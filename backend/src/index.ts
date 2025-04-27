import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer, WebSocket as WS } from 'ws';
import http from 'http';
import projectRoutes from './routes/projects';
import chatRoutes from './routes/chat';
import testRoutes from './routes/test';
import { generateSimpleResponse } from './services/simple-ai';

// Define a custom type that combines WebSocket properties we need
type WebSocketExt = WS & {
  reconnectAttempt?: number;
};

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Parse allowed origins from environment variable or use defaults
const getAllowedOrigins = (): string[] | string => {
  if (process.env.NODE_ENV === 'production') {
    const originsEnv = process.env.ALLOWED_ORIGINS;
    if (originsEnv) {
      return originsEnv.split(',').map(origin => origin.trim());
    }
    return ['https://witty-catty-protfolio-frontend.vercel.app', 'https://witty-cat-portfolio.vercel.app'];
  }
  return 'http://localhost:5173';
};

// Middleware
app.use(cors({
  origin: getAllowedOrigins(),
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

// Function to send a simple welcome message
function sendWelcomeMessage(ws: WebSocketExt) {
  try {
    // Send a welcome message
    ws.send(JSON.stringify({
      type: 'aiResponse',
      payload: {
        message: "Meow! *stretches and purrs* I'm Witty, your AI cat assistant! I was just napping in a sunbeam, but I'm all ears now. How can I help you today? Feel free to ask me anything about this purrfect portfolio! *playfully paws at your cursor*"
      }
    }));
  } catch (error: any) {
    console.error(`Error sending welcome message:`, error?.message || 'Unknown error');
  }
}

// WebSocket connection handler
wss.on('connection', (ws: WebSocketExt) => {
  // Generate a unique ID for this connection
  const id = Date.now().toString();

  // Store the connection with simplified structure
  clients.set(id, {
    ws,
    id,
    history: []
  });

  console.log(`Client connected (ID: ${id})`);

  // Send welcome message
  sendWelcomeMessage(ws);

  ws.on('message', async (message) => {
    try {
      const client = clients.get(id);
      const parsedMessage = JSON.parse(message.toString());

      console.log(`Received message from client ${id}:`, parsedMessage);

      // Handle different message types
      switch (parsedMessage.type) {
        case 'chatMessage': {
          // Add user message to history
          const userMessage = { role: 'user', content: parsedMessage.payload.message };
          client.history.push(userMessage);

          // Send typing indicator
          ws.send(JSON.stringify({ type: 'typing', payload: { isTyping: true } }));

          // Generate AI response using the simplified service
          const aiResponse = await generateSimpleResponse(
            parsedMessage.payload.message,
            client.history
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

          break;
        }

        case 'contextUpdate': {
          // Just log the context update but don't use it for now
          console.log(`Updated context for client ${id}:`, parsedMessage.payload);
          break;
        }

        default:
          console.warn(`Unknown message type: ${parsedMessage.type}`);
      }
    } catch (error: any) {
      console.error('Error handling WebSocket message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        payload: { message: `Error processing your request: ${error?.message || 'Unknown error'}` }
      }));
    }
  });

  ws.on('close', () => {
    // Remove the connection
    clients.delete(id);
    console.log(`Client disconnected (ID: ${id})`);
  });
});

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/test', testRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Witty Cat Portfolio API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: process.env.npm_package_version || '1.0.0'
  });
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
