require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Validate environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.error('Missing Gemini API key. Please check your .env file.');
  process.exit(1);
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(geminiApiKey);

// List available models
async function listModels() {
  try {
    console.log('Listing available Gemini models...');
    const models = await genAI.listModels();
    console.log('Available models:');
    models.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`);
      console.log(`  Supported generation methods: ${model.supportedGenerationMethods.join(', ')}`);
    });
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

// Run the function
listModels();
