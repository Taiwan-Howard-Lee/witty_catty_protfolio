import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// File to store usage data
const usageLogFile = path.join(__dirname, '../../logs/usage.json');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Initialize usage log if it doesn't exist
if (!fs.existsSync(usageLogFile)) {
  fs.writeFileSync(usageLogFile, JSON.stringify({
    apiCalls: 0,
    databaseSize: 0,
    lastChecked: new Date().toISOString(),
    history: []
  }));
}

async function checkDatabaseSize() {
  try {
    // Get size of projects table
    const { count: projectsCount } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true });

    // Get approximate size of vector embeddings
    const { data: embeddings } = await supabase
      .from('projects')
      .select('embedding');
    
    // Calculate approximate size (rough estimate)
    const embeddingSize = embeddings?.reduce((total, item) => {
      return total + (item.embedding ? JSON.stringify(item.embedding).length : 0);
    }, 0) || 0;

    return {
      recordCount: projectsCount || 0,
      approximateSizeKB: Math.round(embeddingSize / 1024)
    };
  } catch (error) {
    console.error('Error checking database size:', error);
    return { recordCount: 0, approximateSizeKB: 0 };
  }
}

async function monitorUsage() {
  try {
    // Read current usage log
    const usageLog = JSON.parse(fs.readFileSync(usageLogFile, 'utf8'));
    
    // Check database size
    const dbSize = await checkDatabaseSize();
    
    // Update usage log
    const now = new Date();
    const newEntry = {
      date: now.toISOString(),
      databaseSize: dbSize.approximateSizeKB,
      recordCount: dbSize.recordCount
    };
    
    usageLog.databaseSize = dbSize.approximateSizeKB;
    usageLog.lastChecked = now.toISOString();
    usageLog.history.push(newEntry);
    
    // Keep only last 30 entries in history
    if (usageLog.history.length > 30) {
      usageLog.history = usageLog.history.slice(-30);
    }
    
    // Save updated log
    fs.writeFileSync(usageLogFile, JSON.stringify(usageLog, null, 2));
    
    console.log('Usage monitoring completed:');
    console.log(`Database size: ~${dbSize.approximateSizeKB} KB`);
    console.log(`Record count: ${dbSize.recordCount}`);
    
    return newEntry;
  } catch (error) {
    console.error('Error monitoring usage:', error);
    return null;
  }
}

// Export for use in scripts or scheduled tasks
export { monitorUsage };

// Run directly if called as a script
if (require.main === module) {
  monitorUsage()
    .then(() => console.log('Monitoring complete'))
    .catch(err => console.error('Monitoring failed:', err));
}
