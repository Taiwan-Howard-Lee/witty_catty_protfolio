import { useState, useEffect } from 'react';
import { ProjectCard } from '../components/Projects';
import { motion } from 'framer-motion';
import { ENDPOINTS, fetchApi } from '../utils/api';
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
        const data = await fetchApi(ENDPOINTS.PROJECTS);
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
    return <div className="loading">Loading projects...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <motion.div
      className="projects-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Projects
      </motion.h1>
      <div className="projects-grid">
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.5 }}
          >
            <ProjectCard
              id={project.id}
              title={project.title}
              description={project.description}
              tech_stack={project.tech_stack}
              live_link={project.live_link}
              repo_link={project.repo_link}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default ProjectsPage;
