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

// Test function
async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API connection...');
    console.log('API Key:', geminiApiKey.substring(0, 5) + '...' + geminiApiKey.substring(geminiApiKey.length - 5));
    
    // Try with gemini-1.5-flash
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      console.log('Testing model: gemini-1.5-flash');
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello, are you working? Please respond briefly.' }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        },
      });
      
      console.log('Success with gemini-1.5-flash!');
      console.log('Response:', result.response.text());
    } catch (error) {
      console.error('Error with gemini-1.5-flash:', error.message);
    }
    
  } catch (error) {
    console.error('General error testing Gemini API:', error);
  }
}

// Run the test
testGeminiAPI();
