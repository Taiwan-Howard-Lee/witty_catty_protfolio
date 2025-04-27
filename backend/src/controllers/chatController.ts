import { Request, Response } from 'express';
import { generateAIResponse, generateAndStoreAllEmbeddings, generateAndStoreEmbedding } from '../services/ai';

// Simple in-memory store for conversation history
// In a production app, this would be stored in a database
const conversationStore: Record<string, { role: 'user' | 'model', content: string }[]> = {};

// Generate AI response
export const getChatResponse = async (req: Request, res: Response) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message) {
      return res.status(400).json({ message: 'Message is required' });
    }
    
    // Use a default session ID if not provided
    const session = sessionId || 'default';
    
    // Initialize conversation history if it doesn't exist
    if (!conversationStore[session]) {
      conversationStore[session] = [];
    }
    
    // Add user message to history
    conversationStore[session].push({ role: 'user', content: message });
    
    // Get AI response
    const aiResponse = await generateAIResponse(message, conversationStore[session]);
    
    // Add AI response to history
    conversationStore[session].push({ role: 'model', content: aiResponse });
    
    // Limit history to last 10 messages to prevent token limit issues
    if (conversationStore[session].length > 10) {
      conversationStore[session] = conversationStore[session].slice(-10);
    }
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error generating chat response:', error);
    res.status(500).json({ message: 'Error generating chat response' });
  }
};

// Generate embeddings for all projects
export const generateEmbeddings = async (req: Request, res: Response) => {
  try {
    await generateAndStoreAllEmbeddings();
    res.json({ message: 'Embeddings generated successfully for all projects' });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    res.status(500).json({ message: 'Error generating embeddings' });
  }
};

// Generate embedding for a specific project
export const generateEmbeddingForProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    await generateAndStoreEmbedding(id);
    res.json({ message: `Embedding generated successfully for project ${id}` });
  } catch (error) {
    console.error(`Error generating embedding for project ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error generating embedding' });
  }
};
