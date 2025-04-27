import express from 'express';
import { testGeminiConnection, generateSimpleResponse } from '../services/simple-ai';

const router = express.Router();

// Test Gemini API connection
router.get('/gemini', async (req, res) => {
  try {
    const result = await testGeminiConnection();
    res.json(result);
  } catch (error: any) {
    console.error('Error testing Gemini connection:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error?.message || 'Unknown error'}`
    });
  }
});

// Simple chat endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const response = await generateSimpleResponse(message, history);

    res.json({
      success: true,
      message: response
    });
  } catch (error: any) {
    console.error('Error generating chat response:', error);
    res.status(500).json({
      success: false,
      message: `Error: ${error?.message || 'Unknown error'}`
    });
  }
});

export default router;
