# Witty AI Cat Developer Portfolio - Project Plan

## Project Overview

This project is a personal developer portfolio website featuring a unique, real-time, witty animated black cat AI assistant. The AI leverages Google Gemini's capabilities combined with Retrieval-Augmented Generation (RAG) to help visitors navigate the site and discuss showcased coding projects.

## Architecture Overview

### High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │◄───►│     Backend     │◄───►│   AI Service    │
│  (React + TS)   │     │  (Node.js + TS) │     │ (Google Gemini) │
│                 │     │                 │     │                 │
└─────────────────┘     └────────┬────────┘     └─────────────────┘
                                 │
                                 ▼
                        ┌─────────────────┐
                        │                 │
                        │    Database     │
                        │   (Supabase)    │
                        │                 │
                        └─────────────────┘
```

### Components

1. **Frontend (React/TypeScript)**
   - Website UI/UX
   - Animated cat character
   - Chat interface
   - Project showcase
   - Admin panel interface

2. **Backend (Node.js/TypeScript)**
   - REST API for project data
   - WebSocket server for real-time chat
   - RAG implementation
   - Gemini API integration
   - Authentication for admin panel

3. **Database (Supabase - PostgreSQL with pgvector)**
   - Project data storage
   - Vector embeddings for RAG
   - Authentication

4. **AI Service (Google Gemini API)**
   - Text generation (chat responses)
   - Embedding generation (for RAG)

## Technology Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Frontend | React | UI library |
| | TypeScript | Type safety |
| | Vite | Build tool |
| | React Router | Routing |
| | Framer Motion | Animations |
| | CSS/SCSS | Styling |
| Backend | Node.js | Runtime |
| | TypeScript | Type safety |
| | Express.js | Web framework |
| | ws | WebSocket library |
| | @google/generative-ai | Gemini API SDK |
| Database | Supabase | Backend-as-a-Service |
| | PostgreSQL | Relational database |
| | pgvector | Vector extension |
| Deployment | Vercel/Netlify | Frontend hosting |
| | Render/Fly.io | Backend hosting |

## Implementation Phases

### Phase 1: Project Setup and Core Frontend

1. **Repository Structure**
   - Create monorepo using Yarn Workspaces or pnpm workspaces
   - Set up `frontend` and `backend` directories
   - Configure shared TypeScript types

2. **TypeScript Configuration**
   - Create base `tsconfig.json` with strict settings
   - Configure project-specific TypeScript settings

3. **Frontend App Initialization**
   - Initialize React/TypeScript project with Vite
   - Set up basic routing with React Router
   - Create project structure (components, pages, etc.)

4. **Core Website Structure**
   - Implement layout components (`Layout`, `Header`, `Footer`)
   - Create project list and detail components
   - Set up routing between pages

5. **Code Highlighting**
   - Integrate `react-syntax-highlighter` for code snippets
   - Style code blocks

6. **Styling and Responsiveness**
   - Implement responsive design with CSS/SCSS
   - Create theme with consistent colors, typography, spacing

### Phase 2: Backend Core and Project Data Handling

1. **Backend App Initialization**
   - Set up Node.js/TypeScript project
   - Initialize Express.js server
   - Configure environment variables with dotenv

2. **Environment Variable Management**
   - Create `.env` file for local development
   - Add `.env` to `.gitignore`
   - Document required environment variables

3. **Project Data Endpoints**
   - Implement REST API for projects
   - Create routes for listing and retrieving projects
   - Add error handling

### Phase 3: Database and RAG Knowledge Base (Supabase)

1. **Supabase Project Setup**
   - Create Supabase project
   - Configure authentication
   - Set up database access

2. **Database Schema Design**
   - Create `projects` table with necessary fields:
     - `id` (UUID)
     - `created_at` (timestamp)
     - `title` (text)
     - `description` (text)
     - `tech_stack` (text[] or text)
     - `live_link` (text)
     - `repo_link` (text)
     - `content` (text) - detailed project information

3. **Enable pgvector Extension**
   - Run SQL: `create extension if not exists vector;`

4. **Add Vector Embedding Column**
   - Add embedding column to projects table:
     - `embedding vector(1536)` (dimension depends on Gemini model)

5. **Backend Script for Embedding Generation & Storage**
   - Create script to generate embeddings for project content
   - Implement function to store embeddings in Supabase

### Phase 4: AI and RAG Implementation

1. **Gemini API Client**
   - Set up Gemini API client in backend
   - Configure API key from environment variables

2. **RAG Query Logic**
   - Implement vector similarity search
   - Create function to retrieve relevant project content based on user query

3. **Gemini Prompt Construction**
   - Design prompt template for the AI assistant
   - Include personality instructions, context, and user query

4. **Initial AI Chat Endpoint (REST)**
   - Create temporary endpoint for testing AI responses
   - Implement basic chat functionality

### Phase 5: Real-time Communication (WebSockets)

1. **WebSocket Server Integration**
   - Add WebSocket server to backend
   - Configure connection handling

2. **WebSocket Server Logic**
   - Implement connection management
   - Create message routing system

3. **WebSocket Message Handling**
   - Define message types (chat, context updates)
   - Implement handlers for different message types

4. **WebSocket Client Integration**
   - Add WebSocket client to frontend
   - Manage connection state

5. **Connect Chat UI to WebSockets**
   - Update chat component to use WebSockets
   - Implement message sending and receiving

6. **Send Frontend Context via WebSocket**
   - Track current page/project in frontend
   - Send context updates to backend

### Phase 6: AI Assistant UI and Animation

1. **Static Cat Component**
   - Create SVG or image-based cat component
   - Position on page

2. **Animation Library**
   - Integrate Framer Motion or CSS animations
   - Set up animation states

3. **Simple Cat Animations**
   - Implement idle animation
   - Create thinking/typing animation

4. **Connect Animation to AI State**
   - Link animation states to chat activity
   - Trigger animations based on message status

### Phase 7: Admin Panel

1. **Admin Application Setup**
   - Create admin panel interface
   - Set up routing for admin sections

2. **Simple Authentication**
   - Implement Supabase authentication
   - Create protected routes

3. **Project Data Management Interface**
   - Build CRUD forms for projects
   - Implement data validation

4. **Trigger RAG Update**
   - Create endpoint to regenerate embeddings
   - Add button in admin panel to trigger update

### Phase 8: AI Logic Enhancements & Proactive Navigation

1. **Refine Witty Personality**
   - Improve prompt engineering
   - Test and iterate on AI responses

2. **Implement Conversation History**
   - Store recent messages
   - Include history in prompts

3. **Utilize Frontend Context**
   - Adjust RAG queries based on current page
   - Modify prompts based on context

4. **Formulate and Deliver Proactive Suggestions**
   - Generate contextual suggestions
   - Send suggestions via WebSocket

5. **Display Proactive Suggestions**
   - Render suggestions in chat UI
   - Make suggestions clickable

### Phase 9: Testing, Optimization, and Deployment

1. **Comprehensive Testing**
   - Test UI responsiveness
   - Verify chat functionality
   - Validate admin panel operations

2. **Frontend Optimization**
   - Optimize assets
   - Implement lazy loading

3. **Backend Optimization**
   - Optimize database queries
   - Improve WebSocket handling

4. **Error Handling**
   - Implement consistent error handling
   - Add user-friendly error messages

5. **Secure Environment Variables**
   - Configure production environment variables
   - Ensure secrets are protected

6. **Frontend Deployment**
   - Deploy to Vercel or Netlify
   - Configure build settings

7. **Backend Deployment**
   - Deploy to Render or Fly.io
   - Set up environment variables

8. **Monitoring Free Tier Usage**
   - Track API usage
   - Monitor database size and operations

## Technical Details

### Database Schema

```sql
-- Projects Table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL,
  live_link TEXT,
  repo_link TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536)
);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access
CREATE POLICY "Admin users can do anything" ON projects
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### RAG Implementation

1. **Embedding Generation**
   ```typescript
   async function generateEmbedding(text: string): Promise<number[]> {
     const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
     const embeddingModel = genAI.getGenerativeModel({ model: "embedding-model" });
     const result = await embeddingModel.embedContent(text);
     return result.embedding.values;
   }
   ```

2. **Vector Search**
   ```typescript
   async function findSimilarProjects(queryEmbedding: number[], limit: number = 3): Promise<Project[]> {
     const { data, error } = await supabase
       .rpc('match_projects', {
         query_embedding: queryEmbedding,
         match_threshold: 0.7,
         match_count: limit
       });
     
     if (error) throw error;
     return data;
   }
   ```

3. **Stored Procedure for Vector Search**
   ```sql
   CREATE OR REPLACE FUNCTION match_projects(
     query_embedding VECTOR(1536),
     match_threshold FLOAT,
     match_count INT
   )
   RETURNS TABLE (
     id UUID,
     title TEXT,
     description TEXT,
     content TEXT,
     similarity FLOAT
   )
   LANGUAGE plpgsql
   AS $$
   BEGIN
     RETURN QUERY
     SELECT
       projects.id,
       projects.title,
       projects.description,
       projects.content,
       1 - (projects.embedding <=> query_embedding) AS similarity
     FROM projects
     WHERE 1 - (projects.embedding <=> query_embedding) > match_threshold
     ORDER BY similarity DESC
     LIMIT match_count;
   END;
   $$;
   ```

### WebSocket Message Format

```typescript
// Message types
type MessageType = 'chatMessage' | 'aiResponse' | 'contextUpdate' | 'suggestion';

// Base message interface
interface WebSocketMessage {
  type: MessageType;
  payload: any;
}

// Chat message
interface ChatMessage extends WebSocketMessage {
  type: 'chatMessage';
  payload: {
    message: string;
  };
}

// AI response
interface AIResponse extends WebSocketMessage {
  type: 'aiResponse';
  payload: {
    message: string;
  };
}

// Context update
interface ContextUpdate extends WebSocketMessage {
  type: 'contextUpdate';
  payload: {
    currentPage: string;
    projectId?: string;
  };
}

// Suggestion
interface Suggestion extends WebSocketMessage {
  type: 'suggestion';
  payload: {
    suggestions: string[];
  };
}
```

### Prompt Template

```typescript
function constructPrompt(
  userQuery: string,
  projectContexts: ProjectContext[],
  conversationHistory: Message[]
): string {
  const systemPrompt = `
You are a witty black cat AI assistant named "Witty" for a developer portfolio website.
Respond with wit, charm, and occasional cat-like mannerisms.
Answer questions about the developer's projects based ONLY on the following provided information:

${projectContexts.map(ctx => `
PROJECT: ${ctx.title}
DESCRIPTION: ${ctx.description}
DETAILS: ${ctx.content}
`).join('\n\n')}

If asked about something not in the provided information, state that you can only discuss the projects you know about.
Keep responses concise but informative, explaining technical choices and challenges when relevant.
`;

  const historyText = conversationHistory
    .map(msg => `${msg.role === 'user' ? 'Human' : 'Witty'}: ${msg.content}`)
    .join('\n');

  return `${systemPrompt}\n\nConversation history:\n${historyText}\n\nHuman: ${userQuery}\nWitty:`;
}
```

### Free Tier Limits to Monitor

| Service | Resource | Free Tier Limit | Monitoring Strategy |
|---------|----------|-----------------|---------------------|
| Google Gemini | API calls | Varies (check current limits) | Track usage in Google Cloud Console |
| Google Gemini | Embedding API | Varies (check current limits) | Track usage in Google Cloud Console |
| Supabase | Database size | 500 MB | Monitor in Supabase Dashboard |
| Supabase | Storage | 1 GB | Monitor in Supabase Dashboard |
| Supabase | Bandwidth | 2 GB | Monitor in Supabase Dashboard |
| Vercel/Netlify | Bandwidth | 100 GB/month (Vercel) | Monitor in hosting dashboard |
| Render/Fly.io | Compute hours | Varies | Monitor in hosting dashboard |

## Project Structure

```
witty_cat/
├── package.json           # Root package.json for workspace
├── tsconfig.json          # Base TypeScript configuration
├── .gitignore             # Git ignore file
├── README.md              # Project documentation
├── frontend/              # Frontend application
│   ├── package.json       # Frontend dependencies
│   ├── tsconfig.json      # Frontend TypeScript config
│   ├── index.html         # HTML entry point
│   ├── src/               # Source code
│   │   ├── main.tsx       # Application entry point
│   │   ├── App.tsx        # Main application component
│   │   ├── components/    # Reusable components
│   │   │   ├── Layout/    # Layout components
│   │   │   ├── Projects/  # Project-related components
│   │   │   └── Chat/      # Chat and AI assistant components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── assets/        # Static assets
│   └── public/            # Public assets
├── backend/               # Backend application
│   ├── package.json       # Backend dependencies
│   ├── tsconfig.json      # Backend TypeScript config
│   ├── src/               # Source code
│   │   ├── index.ts       # Server entry point
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   │   ├── ai.ts      # AI and RAG implementation
│   │   │   └── projects.ts # Project data service
│   │   ├── websocket/     # WebSocket implementation
│   │   ├── db/            # Database connection and queries
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   └── .env.example       # Example environment variables
└── admin/                 # Admin panel (optional, could be part of frontend)
    ├── package.json       # Admin dependencies
    ├── tsconfig.json      # Admin TypeScript config
    └── src/               # Source code
        ├── main.tsx       # Admin entry point
        ├── App.tsx        # Main admin component
        ├── components/    # Admin components
        ├── pages/         # Admin pages
        └── services/      # Admin services
```

## Implementation Timeline

| Phase | Estimated Duration | Dependencies |
|-------|-------------------|--------------|
| 1: Project Setup and Core Frontend | 1-2 weeks | None |
| 2: Backend Core and Project Data | 1 week | Phase 1 |
| 3: Database and RAG Knowledge Base | 1 week | Phase 2 |
| 4: AI and RAG Implementation | 1-2 weeks | Phase 3 |
| 5: Real-time Communication | 1 week | Phase 4 |
| 6: AI Assistant UI and Animation | 1-2 weeks | Phase 5 |
| 7: Admin Panel | 1 week | Phase 3 |
| 8: AI Logic Enhancements | 1-2 weeks | Phase 4, 5, 6 |
| 9: Testing, Optimization, Deployment | 1-2 weeks | All previous phases |

Total estimated timeline: 8-14 weeks (part-time development)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Fill in required values (Supabase URL, Supabase Key, Gemini API Key)
4. Start development servers:
   ```bash
   # Frontend
   cd frontend
   npm run dev
   
   # Backend
   cd backend
   npm run dev
   ```

## Next Steps

After completing the initial implementation:

1. Enhance the cat animations with more states and transitions
2. Improve RAG performance with hybrid search techniques
3. Add analytics to track user interactions
4. Implement more advanced proactive suggestions
5. Consider adding a blog section with RAG support
