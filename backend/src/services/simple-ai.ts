import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error('Missing Gemini API key. Please check your .env file.');
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Get the text generation model - using the model you specified
const textModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-preview-04-17' });

// Simple function to generate AI response
export async function generateSimpleResponse(
  userQuery: string,
  conversationHistory: { role: 'user' | 'model', content: string }[] = []
): Promise<string> {
  try {
    console.log('Generating response for query:', userQuery);
    
    // Construct a simple prompt
    const systemPrompt = `
You are a witty black cat AI assistant named "Witty" for a developer portfolio website.
Respond with wit, charm, and occasional cat-like mannerisms.
Keep responses concise but informative.
`;

    // Prepare the chat history
    const chatHistory = [
      { role: 'system', parts: [{ text: systemPrompt }] },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    // Add the current user query if it's not already in the history
    if (conversationHistory.length === 0 || 
        conversationHistory[conversationHistory.length - 1].role !== 'user' ||
        conversationHistory[conversationHistory.length - 1].content !== userQuery) {
      chatHistory.push({
        role: 'user',
        parts: [{ text: userQuery }]
      });
    }

    console.log('Sending chat history to Gemini:', JSON.stringify(chatHistory, null, 2));

    // Generate response
    const result = await textModel.generateContent({
      contents: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const response = result.response;
    console.log('Received response from Gemini:', response.text());
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return `Meow! Sorry, I encountered an error while trying to answer your question. Error details: ${error.message}`;
  }
}

// Simple function to test the Gemini API connection
export async function testGeminiConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const result = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Hello, are you working?' }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 50,
      },
    });

    return {
      success: true,
      message: `Connection successful. Response: ${result.response.text().substring(0, 100)}...`
    };
  } catch (error) {
    console.error('Error testing Gemini connection:', error);
    return {
      success: false,
      message: `Connection failed: ${error.message}`
    };
  }
}
