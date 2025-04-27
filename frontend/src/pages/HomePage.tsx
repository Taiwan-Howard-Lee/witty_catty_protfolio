import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { ProjectCard } from '../components/Projects';
import './HomePage.css';

// This is a temporary type until we connect to the backend
interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_link?: string;
  repo_link?: string;
}

const HomePage = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        // For now, we'll just use the regular projects endpoint
        // In the future, we could create a dedicated featured projects endpoint
        const response = await fetch('http://localhost:3001/api/projects');

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // For now, just use all projects as featured projects
        // In a real app, you might have a "featured" flag in the database
        setFeaturedProjects(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch featured projects:', err);
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, []);

  return (
    <Layout>
      <div className="home-page">
        <section className="hero">
          <div className="hero-content">
            <h1>Welcome to My Developer Portfolio</h1>
            <p>
              I'm a passionate developer creating innovative solutions with modern technologies.
              Explore my projects and chat with my witty AI cat assistant!
            </p>
            <div className="hero-buttons">
              <Link to="/projects" className="btn btn-primary">
                View Projects
              </Link>
              <Link to="/about" className="btn btn-secondary">
                About Me
              </Link>
            </div>
          </div>
        </section>

        <section className="featured-projects">
          <h2>Featured Projects</h2>

          {loading ? (
            <div className="loading">Loading featured projects...</div>
          ) : (
            <div className="project-cards">
              {featuredProjects.map(project => (
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
          )}

          <div className="view-all-projects">
            <Link to="/projects" className="btn btn-outline">
              View All Projects
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default HomePage;
