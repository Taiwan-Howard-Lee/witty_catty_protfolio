import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import http from 'http';
import projectRoutes from './routes/projects';
import chatRoutes from './routes/chat';
import { generateAIResponse, generateProactiveSuggestions } from './services/ai';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://witty-cat-portfolio.vercel.app']
    : 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Store WebSocket connections
const clients = new Map();

// Function to send proactive suggestions
async function sendProactiveSuggestions(clientId: string) {
  const client = clients.get(clientId);
  if (!client || !client.context) return;

  try {
    // Generate suggestions based on context
    const suggestions = await generateProactiveSuggestions(client.context, client.history);

    if (suggestions.length > 0) {
      // Send suggestions to client
      client.ws.send(JSON.stringify({
        type: 'suggestion',
        payload: { suggestions }
      }));
    }
  } catch (error) {
    console.error(`Error sending proactive suggestions to client ${clientId}:`, error);
  }
}

// WebSocket connection handler
wss.on('connection', (ws) => {
  // Generate a unique ID for this connection
  const id = Date.now().toString();

  // Store the connection
  clients.set(id, {
    ws,
    id,
    context: null,
    history: [],
    suggestionTimer: null
  });

  console.log(`Client connected (ID: ${id})`);

  ws.on('message', async (message) => {
    try {
      const client = clients.get(id);
      const parsedMessage = JSON.parse(message.toString());

      console.log(`Received message from client ${id}:`, parsedMessage);

      // Clear any existing suggestion timer
      if (client.suggestionTimer) {
        clearTimeout(client.suggestionTimer);
        client.suggestionTimer = null;
      }

      // Handle different message types
      switch (parsedMessage.type) {
        case 'chatMessage': {
          // Add user message to history
          const userMessage = { role: 'user', content: parsedMessage.payload.message };
          client.history.push(userMessage);

          // Send typing indicator
          ws.send(JSON.stringify({ type: 'typing', payload: { isTyping: true } }));

          // Generate AI response
          const aiResponse = await generateAIResponse(
            parsedMessage.payload.message,
            client.history,
            client.context
          );

          // Add AI response to history
          const aiMessage = { role: 'model', content: aiResponse };
          client.history.push(aiMessage);

          // Limit history to last 10 messages
          if (client.history.length > 10) {
            client.history = client.history.slice(-10);
          }

          // Send response
          ws.send(JSON.stringify({
            type: 'aiResponse',
            payload: { message: aiResponse }
          }));

          // Stop typing indicator
          ws.send(JSON.stringify({ type: 'typing', payload: { isTyping: false } }));

          // Set a timer to send proactive suggestions after a delay
          client.suggestionTimer = setTimeout(() => {
            sendProactiveSuggestions(id);
          }, 10000); // 10 seconds after the last message

          break;
        }

        case 'contextUpdate': {
          // Update context
          client.context = parsedMessage.payload;
          console.log(`Updated context for client ${id}:`, client.context);

          // Send proactive suggestions after context update with a delay
          client.suggestionTimer = setTimeout(() => {
            sendProactiveSuggestions(id);
          }, 5000); // 5 seconds after context update

          break;
        }

        default:
          console.warn(`Unknown message type: ${parsedMessage.type}`);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: 'Error processing your request' }
      }));
    }
  });

  ws.on('close', () => {
    // Clear any timers
    const client = clients.get(id);
    if (client && client.suggestionTimer) {
      clearTimeout(client.suggestionTimer);
    }

    // Remove the connection
    clients.delete(id);
    console.log(`Client disconnected (ID: ${id})`);
  });
});

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Witty Cat Portfolio API' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'An unexpected error occurred',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
