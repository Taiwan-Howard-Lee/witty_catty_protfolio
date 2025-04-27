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
    
    // Try with gemini-2.5-flash-preview-04-17
    try {
      const model1 = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });
      console.log('Testing model: gemini-2.5-flash-preview-04-17');
      
      const result1 = await model1.generateContent({
        contents: [{ role: 'user', parts: [{ text: 'Hello, are you working? Please respond briefly.' }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 50,
        },
      });
      
      console.log('Success with gemini-2.5-flash-preview-04-17!');
      console.log('Response:', result1.response.text());
    } catch (error) {
      console.error('Error with gemini-2.5-flash-preview-04-17:', error.message);
      
      // Try with gemini-pro as fallback
      try {
        console.log('\nTrying fallback model: gemini-pro');
        const model2 = genAI.getGenerativeModel({ model: 'gemini-pro' });
        
        const result2 = await model2.generateContent({
          contents: [{ role: 'user', parts: [{ text: 'Hello, are you working? Please respond briefly.' }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 50,
          },
        });
        
        console.log('Success with gemini-pro!');
        console.log('Response:', result2.response.text());
      } catch (error2) {
        console.error('Error with gemini-pro:', error2.message);
      }
    }
    
  } catch (error) {
    console.error('General error testing Gemini API:', error);
  }
}

// Run the test
testGeminiAPI();
