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

// Test various model names
async function testModels() {
  const modelNames = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'gemini-pro',
    'gemini-pro-vision',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-pro-preview',
    'gemini-2.5-flash-preview',
    'gemini-2.5-pro-latest',
    'gemini-2.5-flash-latest'
  ];
  
  console.log('Testing various Gemini models...');
  
  for (const modelName of modelNames) {
    try {
      console.log(`\nTesting model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello, are you working? Please respond briefly.' }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        },
      });
      
      console.log(`✅ Success with ${modelName}!`);
      console.log('Response:', result.response.text());
    } catch (error) {
      console.error(`❌ Error with ${modelName}:`, error.message);
    }
  }
}

// Run the test
testModels();
