import express from 'express';
import { getChatResponse, generateEmbeddings, generateEmbeddingForProject } from '../controllers/chatController';

const router = express.Router();

// POST /api/chat - Get AI response
router.post('/', getChatResponse);

// POST /api/chat/embeddings - Generate embeddings for all projects
router.post('/embeddings', generateEmbeddings);

// POST /api/chat/embeddings/:id - Generate embedding for a specific project
router.post('/embeddings/:id', generateEmbeddingForProject);

export default router;
