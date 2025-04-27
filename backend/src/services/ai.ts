import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import supabase from '../db/supabase';

// Load environment variables
dotenv.config();

// Validate environment variables
const geminiApiKey = process.env.GEMINI_API_KEY;

if (!geminiApiKey) {
  throw new Error('Missing Gemini API key. Please check your .env file.');
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(geminiApiKey);

// Get the text generation model
const textModel = genAI.getGenerativeModel({ model: 'gemini-pro' });

// Get the embedding model
const embeddingModel = genAI.getGenerativeModel({ model: 'embedding-model' });

// Generate embeddings for text
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Generate embeddings for a project and store them in Supabase
export async function generateAndStoreEmbedding(projectId: string): Promise<void> {
  try {
    // Fetch the project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('title, description, content')
      .eq('id', projectId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Combine project text for embedding
    const textToEmbed = `
      Title: ${project.title}
      Description: ${project.description}
      Content: ${project.content}
    `;

    // Generate embedding
    const embedding = await generateEmbedding(textToEmbed);

    // Store embedding in Supabase
    const { error: updateError } = await supabase
      .from('projects')
      .update({ embedding })
      .eq('id', projectId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully generated and stored embedding for project ${projectId}`);
  } catch (error) {
    console.error(`Error generating and storing embedding for project ${projectId}:`, error);
    throw error;
  }
}

// Generate embeddings for all projects
export async function generateAndStoreAllEmbeddings(): Promise<void> {
  try {
    // Fetch all projects
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('id');

    if (fetchError) {
      throw fetchError;
    }

    if (!projects || projects.length === 0) {
      console.log('No projects found to generate embeddings for');
      return;
    }

    // Generate and store embeddings for each project
    for (const project of projects) {
      await generateAndStoreEmbedding(project.id);
    }

    console.log(`Successfully generated and stored embeddings for ${projects.length} projects`);
  } catch (error) {
    console.error('Error generating and storing embeddings for all projects:', error);
    throw error;
  }
}

// Find similar projects based on a query
export async function findSimilarProjects(query: string, threshold = 0.7, limit = 3): Promise<any[]> {
  try {
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Call the match_projects function in Supabase
    const { data, error } = await supabase.rpc('match_projects', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit
    });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error finding similar projects:', error);
    throw error;
  }
}

// Generate AI response based on user query and context
export async function generateAIResponse(
  userQuery: string,
  conversationHistory: { role: 'user' | 'model', content: string }[] = [],
  pageContext?: { currentPage: string; projectId?: string }
): Promise<string> {
  try {
    // Find relevant projects based on query and context
    let relevantProjects = await findSimilarProjects(userQuery);

    // If we have a project context and it's a project detail page, prioritize that project
    if (pageContext?.projectId && pageContext.currentPage.includes('/projects/')) {
      // Fetch the current project
      const { data: currentProject, error } = await supabase
        .from('projects')
        .select('id, title, description, content')
        .eq('id', pageContext.projectId)
        .single();

      if (!error && currentProject) {
        // Check if the current project is already in the relevant projects
        const isCurrentProjectIncluded = relevantProjects.some(p => p.id === currentProject.id);

        if (!isCurrentProjectIncluded) {
          // Add the current project to the beginning of the relevant projects
          relevantProjects = [currentProject, ...relevantProjects];
        } else {
          // Move the current project to the beginning
          relevantProjects = [
            ...relevantProjects.filter(p => p.id === currentProject.id),
            ...relevantProjects.filter(p => p.id !== currentProject.id)
          ];
        }
      }
    }

    // Construct context from relevant projects
    let context = '';
    if (relevantProjects.length > 0) {
      context = relevantProjects.map(project => `
PROJECT: ${project.title}
DESCRIPTION: ${project.description}
DETAILS: ${project.content}
      `).join('\n\n');
    }

    // Add page context to the prompt
    let pageContextInfo = '';
    if (pageContext) {
      if (pageContext.currentPage === '/') {
        pageContextInfo = 'The user is currently on the homepage.';
      } else if (pageContext.currentPage === '/projects') {
        pageContextInfo = 'The user is currently viewing the projects list page.';
      } else if (pageContext.currentPage.includes('/projects/') && pageContext.projectId) {
        const currentProject = relevantProjects.find(p => p.id === pageContext.projectId);
        if (currentProject) {
          pageContextInfo = `The user is currently viewing the project "${currentProject.title}".`;
        }
      } else if (pageContext.currentPage === '/about') {
        pageContextInfo = 'The user is currently on the about page.';
      } else if (pageContext.currentPage === '/contact') {
        pageContextInfo = 'The user is currently on the contact page.';
      }
    }

    // Construct the prompt
    const systemPrompt = `
You are a witty black cat AI assistant named "Witty" for a developer portfolio website.
Respond with wit, charm, and occasional cat-like mannerisms.
Answer questions about the developer's projects based ONLY on the following provided information:

${context || 'No specific project information available.'}

${pageContextInfo ? `Current context: ${pageContextInfo}` : ''}

If asked about something not in the provided information, state that you can only discuss the projects you know about.
Keep responses concise but informative, explaining technical choices and challenges when relevant.
`;

    // Prepare the chat history
    const chatHistory = [
      { role: 'system', parts: [{ text: systemPrompt }] },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))
    ];

    // Generate response
    const result = await textModel.generateContent({
      contents: chatHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return 'Meow! Sorry, I encountered an error while trying to answer your question. Please try again later.';
  }
}

// Generate proactive suggestions based on context
export async function generateProactiveSuggestions(
  pageContext: { currentPage: string; projectId?: string },
  conversationHistory: { role: 'user' | 'model', content: string }[] = []
): Promise<string[]> {
  try {
    // Get context-specific information
    let contextInfo = '';
    let relevantProjects: any[] = [];

    if (pageContext.currentPage === '/') {
      contextInfo = 'The user is on the homepage of the portfolio website.';

      // Get featured projects for homepage
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description')
        .eq('is_featured', true)
        .limit(3);

      if (!error && data) {
        relevantProjects = data;
      }
    } else if (pageContext.currentPage === '/projects') {
      contextInfo = 'The user is viewing the projects list page.';

      // Get all projects
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description')
        .limit(5);

      if (!error && data) {
        relevantProjects = data;
      }
    } else if (pageContext.currentPage.includes('/projects/') && pageContext.projectId) {
      // Get the specific project
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description, content, tech_stack')
        .eq('id', pageContext.projectId)
        .single();

      if (!error && data) {
        contextInfo = `The user is viewing the project "${data.title}" which uses technologies: ${data.tech_stack.join(', ')}.`;
        relevantProjects = [data];
      }
    } else if (pageContext.currentPage === '/about') {
      contextInfo = 'The user is on the about page, which contains information about the developer.';
    } else if (pageContext.currentPage === '/contact') {
      contextInfo = 'The user is on the contact page, which contains a contact form and contact information.';
    }

    // Construct project context
    let projectsContext = '';
    if (relevantProjects.length > 0) {
      projectsContext = relevantProjects.map(project => `
PROJECT: ${project.title}
DESCRIPTION: ${project.description}
      `).join('\n\n');
    }

    // Construct the prompt
    const prompt = `
You are a witty black cat AI assistant for a developer portfolio website.
Based on the user's current context and conversation history, generate 3 proactive suggestions or questions that the user might want to ask.
These should be relevant to the current page and any projects being viewed.

Current context: ${contextInfo}

${projectsContext ? `Relevant projects:\n${projectsContext}` : ''}

${conversationHistory.length > 0 ? `Recent conversation:\n${conversationHistory.map(msg => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n')}` : 'No conversation history yet.'}

Generate 3 short, specific questions or suggestions that would be helpful for the user in this context.
Format your response as a JSON array of strings, with each string being a suggestion.
Example: ["Tell me more about the tech stack used in this project", "What challenges did you face?", "Can I see the source code?"]
`;

    // Generate suggestions
    const result = await textModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const response = result.response.text();

    // Parse the response as JSON
    try {
      // Extract JSON array from the response (it might be wrapped in text)
      const jsonMatch = response.match(/\[.*\]/s);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
      }
      return [];
    } catch (parseError) {
      console.error('Error parsing suggestions JSON:', parseError);
      return [];
    }
  } catch (error) {
    console.error('Error generating proactive suggestions:', error);
    return [];
  }
}
