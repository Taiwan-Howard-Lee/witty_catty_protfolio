import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { API_BASE_URL, fetchApi } from '../utils/api';
import './ProjectDetailPage.css';

// This is a temporary type until we connect to the backend
interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_link?: string;
  repo_link?: string;
  content: string;
  code_snippets?: {
    language: string;
    code: string;
    description: string;
  }[];
}

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await fetchApi(`${API_BASE_URL}/api/projects/${id}`);
        setProject(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch project details');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return <div className="loading">Loading project details...</div>;
  }

  if (error || !project) {
    return (
      <div className="error-container">
        <div className="error">{error || 'Project not found'}</div>
        <Link to="/projects" className="back-link">
          Back to Projects
        </Link>
      </div>
    );
  }

  return (
    <Layout>
      <div className="project-detail-page">
        <div className="project-header">
          <Link to="/projects" className="back-link">
            &larr; Back to Projects
          </Link>
          <h1>{project.title}</h1>
          <div className="tech-stack">
            {project.tech_stack.map((tech, index) => (
              <span key={index} className="tech-tag">
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="project-content">
          <div className="project-description">
            <h2>Overview</h2>
            <p>{project.description}</p>

            <div className="project-links">
              {project.live_link && (
                <a
                  href={project.live_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  Live Demo
                </a>
              )}
              {project.repo_link && (
                <a
                  href={project.repo_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  GitHub Repo
                </a>
              )}
            </div>
          </div>

          <div className="project-details">
            <h2>Details</h2>
            <div className="content-text">
              {project.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph.trim()}</p>
              ))}
            </div>
          </div>

          {project.code_snippets && project.code_snippets.length > 0 && (
            <div className="code-snippets">
              <h2>Code Snippets</h2>

              {project.code_snippets.map((snippet, index) => (
                <div key={index} className="code-snippet">
                  <h3>{snippet.description}</h3>
                  <SyntaxHighlighter
                    language={snippet.language}
                    style={vscDarkPlus}
                    showLineNumbers
                    wrapLines
                  >
                    {snippet.code.trim()}
                  </SyntaxHighlighter>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetailPage;
