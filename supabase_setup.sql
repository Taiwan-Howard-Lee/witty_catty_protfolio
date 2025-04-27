-- Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tech_stack TEXT[] NOT NULL,
  live_link TEXT,
  repo_link TEXT,
  content TEXT NOT NULL,
  code_snippets JSONB,
  is_featured BOOLEAN DEFAULT FALSE,
  embedding VECTOR(1536)
);

-- Create a function to match projects based on vector similarity
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

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Public can view projects" ON projects
  FOR SELECT
  USING (true);

-- Create policy for authenticated users to insert/update/delete
CREATE POLICY "Authenticated users can modify projects" ON projects
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
