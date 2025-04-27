import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './AdminPages.css';

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  is_featured?: boolean;
}

const AdminDashboardPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ragStatus, setRagStatus] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const navigate = useNavigate();

  // Check if user is authenticated
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/projects');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setProjects(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to fetch projects');
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/login');
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/projects/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Remove the deleted project from the state
      setProjects(projects.filter(project => project.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
      alert('Failed to delete project');
    }
  };

  const handleGenerateEmbeddings = async () => {
    setIsGeneratingEmbeddings(true);
    setRagStatus({ message: 'Generating embeddings for all projects...', type: 'info' });

    try {
      const response = await fetch('http://localhost:3001/api/chat/embeddings', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setRagStatus({ message: data.message, type: 'success' });
    } catch (err) {
      console.error('Error generating embeddings:', err);
      setRagStatus({ message: 'Failed to generate embeddings', type: 'error' });
    } finally {
      setIsGeneratingEmbeddings(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <button className="admin-button" onClick={handleLogout}>Logout</button>
        </div>
        <div>Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <button className="admin-button" onClick={handleLogout}>Logout</button>
        </div>
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <div className="admin-actions">
          <Link to="/admin/projects/new" className="admin-button">Add New Project</Link>
          <button className="admin-button" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="rag-section">
        <h3>RAG System Management</h3>
        <p className="rag-description">
          The Retrieval-Augmented Generation (RAG) system uses embeddings to help the AI assistant find relevant information about your projects.
          After adding or updating projects, you should regenerate the embeddings to ensure the AI has access to the latest information.
        </p>
        <div className="rag-buttons">
          <button 
            className="rag-button" 
            onClick={handleGenerateEmbeddings}
            disabled={isGeneratingEmbeddings}
          >
            {isGeneratingEmbeddings ? 'Generating Embeddings...' : 'Generate Embeddings for All Projects'}
          </button>
        </div>
        {ragStatus && (
          <div className={`rag-status ${ragStatus.type}`}>
            {ragStatus.message}
          </div>
        )}
      </div>

      <h2>Projects</h2>
      {projects.length === 0 ? (
        <p>No projects found. Add your first project to get started!</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Tech Stack</th>
              <th>Featured</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map(project => (
              <tr key={project.id}>
                <td>{project.title}</td>
                <td>{project.description.length > 100 ? `${project.description.substring(0, 100)}...` : project.description}</td>
                <td>{project.tech_stack.join(', ')}</td>
                <td>{project.is_featured ? 'Yes' : 'No'}</td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/projects/${project.id}`} className="view-button">View</Link>
                    <Link to={`/admin/projects/edit/${project.id}`} className="edit-button">Edit</Link>
                    <button 
                      className="delete-button"
                      onClick={() => handleDeleteProject(project.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboardPage;
