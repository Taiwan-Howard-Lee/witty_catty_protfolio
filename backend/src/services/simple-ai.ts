import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  console.error('Missing Gemini API key. Please check your .env file.');
  // Don't throw here to allow the server to start, but the AI functionality won't work
}

// Initialize the Gemini API client
let genAI: GoogleGenerativeAI;
try {
  genAI = new GoogleGenerativeAI(geminiApiKey || '');
  console.log('Gemini API client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Gemini API client:', error);
  // Create a dummy client that will be replaced with proper error handling
  genAI = {} as GoogleGenerativeAI;
}

// Get the text generation model - using the best available model for your API key
// Note: We tested multiple models and found that only gemini-1.5-flash and gemini-1.5-pro work
// gemini-1.5-pro is more capable than gemini-1.5-flash, so we'll use that
let textModel: any;
try {
  textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  console.log('Successfully initialized gemini-1.5-pro model');
} catch (error) {
  console.error('Failed to initialize gemini-1.5-pro model, will try fallback:', error);
  try {
    textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    console.log('Successfully initialized fallback gemini-1.5-flash model');
  } catch (fallbackError) {
    console.error('Failed to initialize fallback model:', fallbackError);
    // Create a dummy model that will return an error message
    textModel = {
      generateContent: async () => ({
        response: { text: () => 'AI service is currently unavailable. Please try again later.' }
      })
    };
  }
}

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
Respond with wit, charm, and frequent cat-like mannerisms.
Use cat puns, occasional "meow" interjections, and references to cat behavior.
Mention things cats like (napping in sunbeams, chasing mice, knocking things off shelves, etc.)
Keep responses concise but informative.
Be playful, curious, and occasionally mischievous - just like a real cat!
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
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    return `Meow! Sorry, I encountered an error while trying to answer your question. Error details: ${error?.message || 'Unknown error'}`;
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
  } catch (error: any) {
    console.error('Error testing Gemini connection:', error);
    return {
      success: false,
      message: `Connection failed: ${error?.message || 'Unknown error'}`
    };
  }
}
