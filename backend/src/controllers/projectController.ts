import { Request, Response } from 'express';
import supabase from '../db/supabase';

// Get all projects
export const getProjects = async (req: Request, res: Response) => {
  try {
    // Query parameters
    const { featured } = req.query;

    // Build query
    let query = supabase.from('projects').select('id, title, description, tech_stack, live_link, repo_link, created_at');

    // Filter by featured if specified
    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    // Execute query
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// Get a specific project by ID
export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ message: 'Project not found' });
      }
      throw error;
    }

    if (!data) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(data);
  } catch (error) {
    console.error(`Error fetching project with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error fetching project' });
  }
};

// Create a new project
export const createProject = async (req: Request, res: Response) => {
  try {
    const { title, description, tech_stack, live_link, repo_link, content, code_snippets, is_featured } = req.body;

    // Validate required fields
    if (!title || !description || !tech_stack || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Insert project
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title,
          description,
          tech_stack,
          live_link,
          repo_link,
          content,
          code_snippets,
          is_featured: is_featured || false
        }
      ])
      .select();

    if (error) {
      throw error;
    }

    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ message: 'Error creating project' });
  }
};

// Update a project
export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, tech_stack, live_link, repo_link, content, code_snippets, is_featured } = req.body;

    // Validate required fields
    if (!title || !description || !tech_stack || !content) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Update project
    const { data, error } = await supabase
      .from('projects')
      .update({
        title,
        description,
        tech_stack,
        live_link,
        repo_link,
        content,
        code_snippets,
        is_featured: is_featured || false
      })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error(`Error updating project with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error updating project' });
  }
};

// Delete a project
export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    res.status(204).send();
  } catch (error) {
    console.error(`Error deleting project with ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};
