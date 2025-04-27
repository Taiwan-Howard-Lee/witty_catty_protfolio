import { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { ProjectCard } from '../components/Projects';
import './ProjectsPage.css';

// This is a temporary type until we connect to the backend
interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_link?: string;
  repo_link?: string;
}

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setError('Failed to fetch projects');
        setLoading(false);
        console.error(err);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="loading">Loading projects...</div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="projects-page">
        <h1>My Projects</h1>
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              id={project.id}
              title={project.title}
              description={project.description}
              tech_stack={project.tech_stack}
              live_link={project.live_link}
              repo_link={project.repo_link}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default ProjectsPage;
