#!/usr/bin/env node

// This script runs the monitoring utility to check API and database usage

require('dotenv').config();
require('ts-node/register');

const { monitorUsage } = require('../src/utils/monitor');

console.log('Checking Witty Cat Portfolio usage...');

monitorUsage()
  .then(result => {
    if (result) {
      console.log('✅ Usage check completed successfully');
      console.log('----------------------------------------');
      console.log(`Date: ${new Date(result.date).toLocaleString()}`);
      console.log(`Database Size: ~${result.databaseSize} KB`);
      console.log(`Record Count: ${result.recordCount}`);
      console.log('----------------------------------------');
      console.log('For full history, check logs/usage.json');
    } else {
      console.log('❌ Usage check failed');
    }
  })
  .catch(err => {
    console.error('Error running usage check:', err);
    process.exit(1);
  });
