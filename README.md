# Witty AI Cat Developer Portfolio

A developer portfolio website featuring a witty AI cat assistant that helps visitors navigate the site and discuss showcased projects. The AI uses Retrieval-Augmented Generation (RAG) to provide accurate information about your projects.

## Features

- **Modern, Responsive Design**: Built with React and TypeScript
- **Interactive AI Assistant**: A witty black cat AI assistant powered by Google's Gemini API
- **RAG Implementation**: Uses Supabase with pgvector for accurate project information retrieval
- **Real-time Communication**: WebSockets for instant chat responses
- **Admin Panel**: Easily manage projects and regenerate embeddings
- **Proactive Suggestions**: AI suggests relevant questions based on the current page

## Tech Stack

- **Frontend**: React, TypeScript, Vite, React Router, Framer Motion
- **Backend**: Node.js, TypeScript, Express.js, WebSockets
- **Database**: Supabase (PostgreSQL with pgvector)
- **AI**: Google Gemini API (text generation and embeddings)
- **Deployment**: Vercel/Netlify (frontend), Render/Fly.io (backend)

## Prerequisites

- Node.js (v16+)
- npm or yarn
- Supabase account
- Google Gemini API key

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/witty-cat-portfolio.git
cd witty-cat-portfolio
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at https://supabase.com
2. Run the SQL script in `supabase_setup.sql` in the Supabase SQL Editor
3. Get your Supabase URL and anon key from Project Settings > API

### 4. Set Up Environment Variables

Create a `.env` file in the `backend` directory:

```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
GEMINI_API_KEY=your_gemini_api_key
```

### 5. Run the Development Servers

```bash
# Start the backend server
cd backend
npm run dev

# In a new terminal, start the frontend server
cd frontend
npm run dev
```

The frontend will be available at http://localhost:5173 and the backend at http://localhost:3001.

### 6. Admin Panel Access

Navigate to http://localhost:5173/admin/login and use the following credentials:
- Email: admin@example.com
- Password: password123

## Deployment

### Frontend Deployment (Vercel)

1. Push your code to a GitHub repository
2. Sign up for Vercel at https://vercel.com
3. Create a new project and import your GitHub repository
4. Configure the build settings:
   - Framework Preset: Vite
   - Build Command: `cd frontend && npm run build`
   - Output Directory: `frontend/dist`
5. Deploy

### Backend Deployment (Render)

1. Sign up for Render at https://render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure the service:
   - Name: witty-cat-backend
   - Root Directory: backend
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables (SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY)
6. Deploy

### Update Frontend API URL

After deploying the backend, update the WebSocket and API URLs in the frontend code to point to your deployed backend URL.

## Project Structure

```
witty_cat/
├── package.json           # Root package.json for workspace
├── tsconfig.json          # Base TypeScript configuration
├── frontend/              # Frontend application
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   │   ├── Layout/    # Layout components
│   │   │   ├── Projects/  # Project-related components
│   │   │   └── Chat/      # Chat and AI assistant components
│   │   ├── pages/         # Page components
│   │   └── pages/admin/   # Admin panel pages
├── backend/               # Backend application
│   ├── src/               # Source code
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── websocket/     # WebSocket implementation
│   │   └── db/            # Database connection
└── shared/                # Shared code between frontend and backend
    └── types/             # Shared TypeScript types
```

## Monitoring Usage

- **Gemini API**: Monitor usage in Google Cloud Console
- **Supabase**: Monitor database size, storage, and bandwidth in Supabase Dashboard
- **Vercel/Netlify**: Monitor bandwidth in hosting dashboard
- **Render/Fly.io**: Monitor compute hours in hosting dashboard

## License

MIT

## Acknowledgements

- Google Gemini API for AI capabilities
- Supabase for database and vector search
- React and TypeScript communities
- All open-source libraries used in this project
