import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import './AdminPages.css';

interface CodeSnippet {
  language: string;
  code: string;
  description: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  tech_stack: string[];
  live_link: string;
  repo_link: string;
  content: string;
  code_snippets: CodeSnippet[];
  is_featured: boolean;
}

const ProjectFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    tech_stack: [],
    live_link: '',
    repo_link: '',
    content: '',
    code_snippets: [],
    is_featured: false
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [techInput, setTechInput] = useState('');
  const [ragStatus, setRagStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Check if user is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);
  
  // Fetch project data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProject = async () => {
        try {
          const response = await fetch(`http://localhost:3001/api/projects/${id}`);
          
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          
          const data = await response.json();
          
          // Format the data for the form
          setFormData({
            title: data.title || '',
            description: data.description || '',
            tech_stack: data.tech_stack || [],
            live_link: data.live_link || '',
            repo_link: data.repo_link || '',
            content: data.content || '',
            code_snippets: data.code_snippets || [],
            is_featured: data.is_featured || false
          });
          
          setLoading(false);
        } catch (err) {
          console.error('Error fetching project:', err);
          setError('Failed to fetch project');
          setLoading(false);
        }
      };
      
      fetchProject();
    }
  }, [id, isEditMode]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  const handleAddTech = () => {
    if (!techInput.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      tech_stack: [...prev.tech_stack, techInput.trim()]
    }));
    
    setTechInput('');
  };
  
  const handleRemoveTech = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tech_stack: prev.tech_stack.filter((_, i) => i !== index)
    }));
  };
  
  const handleAddCodeSnippet = () => {
    setFormData(prev => ({
      ...prev,
      code_snippets: [...prev.code_snippets, { language: 'javascript', code: '', description: '' }]
    }));
  };
  
  const handleCodeSnippetChange = (index: number, field: keyof CodeSnippet, value: string) => {
    setFormData(prev => {
      const updatedSnippets = [...prev.code_snippets];
      updatedSnippets[index] = {
        ...updatedSnippets[index],
        [field]: value
      };
      return {
        ...prev,
        code_snippets: updatedSnippets
      };
    });
  };
  
  const handleRemoveCodeSnippet = (index: number) => {
    setFormData(prev => ({
      ...prev,
      code_snippets: prev.code_snippets.filter((_, i) => i !== index)
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title || !formData.description || formData.tech_stack.length === 0 || !formData.content) {
      setError('Please fill out all required fields');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      const url = isEditMode 
        ? `http://localhost:3001/api/projects/${id}` 
        : 'http://localhost:3001/api/projects';
      
      const method = isEditMode ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Generate embedding for this project
      await generateEmbedding(data.id);
      
      // Navigate back to dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Error saving project:', err);
      setError('Failed to save project');
      setSubmitting(false);
    }
  };
  
  const generateEmbedding = async (projectId: string) => {
    setRagStatus({ message: 'Generating embedding for this project...', type: 'info' });
    
    try {
      const response = await fetch(`http://localhost:3001/api/chat/embeddings/${projectId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setRagStatus({ message: data.message, type: 'success' });
    } catch (err) {
      console.error('Error generating embedding:', err);
      setRagStatus({ message: 'Failed to generate embedding, but project was saved', type: 'error' });
    }
  };
  
  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>{isEditMode ? 'Edit Project' : 'Add New Project'}</h1>
          <Link to="/admin/dashboard" className="admin-button">Back to Dashboard</Link>
        </div>
        <div>Loading project data...</div>
      </div>
    );
  }
  
  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>{isEditMode ? 'Edit Project' : 'Add New Project'}</h1>
        <Link to="/admin/dashboard" className="admin-button">Back to Dashboard</Link>
      </div>
      
      {error && <div className="admin-error">{error}</div>}
      
      <div className="admin-form-container">
        <form className="admin-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              required
            ></textarea>
          </div>
          
          <div className="form-group">
            <label>Tech Stack *</label>
            <div className="tech-stack-container">
              {formData.tech_stack.map((tech, index) => (
                <div key={index} className="tech-tag">
                  {tech}
                  <button type="button" onClick={() => handleRemoveTech(index)}>&times;</button>
                </div>
              ))}
            </div>
            <div className="tech-input-group">
              <input
                type="text"
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                placeholder="Add a technology"
              />
              <button type="button" onClick={handleAddTech}>Add</button>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="live_link">Live Link</label>
              <input
                type="url"
                id="live_link"
                name="live_link"
                value={formData.live_link}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="repo_link">Repository Link</label>
              <input
                type="url"
                id="repo_link"
                name="repo_link"
                value={formData.repo_link}
                onChange={handleInputChange}
                placeholder="https://github.com/example/repo"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="content">Content *</label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              rows={10}
              required
              placeholder="Detailed description of the project, including key features, challenges, and technical details."
            ></textarea>
          </div>
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleCheckboxChange}
            />
            <label htmlFor="is_featured">Feature this project on the homepage</label>
          </div>
          
          <div className="code-snippets-section">
            <h3>Code Snippets</h3>
            {formData.code_snippets.map((snippet, index) => (
              <div key={index} className="code-snippet">
                <div className="code-snippet-header">
                  <h4>Snippet #{index + 1}</h4>
                  <div className="code-snippet-actions">
                    <button 
                      type="button" 
                      className="delete-button"
                      onClick={() => handleRemoveCodeSnippet(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor={`snippet-description-${index}`}>Description</label>
                  <input
                    type="text"
                    id={`snippet-description-${index}`}
                    value={snippet.description}
                    onChange={(e) => handleCodeSnippetChange(index, 'description', e.target.value)}
                    placeholder="Brief description of what this code does"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`snippet-language-${index}`}>Language</label>
                  <input
                    type="text"
                    id={`snippet-language-${index}`}
                    value={snippet.language}
                    onChange={(e) => handleCodeSnippetChange(index, 'language', e.target.value)}
                    placeholder="javascript, typescript, python, etc."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor={`snippet-code-${index}`}>Code</label>
                  <textarea
                    id={`snippet-code-${index}`}
                    value={snippet.code}
                    onChange={(e) => handleCodeSnippetChange(index, 'code', e.target.value)}
                    rows={8}
                    placeholder="Paste your code snippet here"
                  ></textarea>
                </div>
              </div>
            ))}
            
            <button 
              type="button" 
              className="add-snippet-button"
              onClick={handleAddCodeSnippet}
            >
              Add Code Snippet
            </button>
          </div>
          
          <div className="form-buttons">
            <Link to="/admin/dashboard" className="cancel-button">Cancel</Link>
            <button 
              type="submit" 
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEditMode ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
      
      {ragStatus && (
        <div className={`rag-status ${ragStatus.type}`} style={{ marginTop: '2rem' }}>
          {ragStatus.message}
        </div>
      )}
    </div>
  );
};

export default ProjectFormPage;
