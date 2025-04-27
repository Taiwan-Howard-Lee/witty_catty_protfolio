import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout, SplitLayout } from '../components/Layout';
import { ProjectCard } from '../components/Projects';
import { WelcomeScreen } from '../components/Welcome';
import { motion, AnimatePresence } from 'framer-motion';
import { ENDPOINTS, fetchApi } from '../utils/api';
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

// User preference for layout type
type LayoutPreference = 'standard' | 'guide' | null;

const HomePage = () => {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showWelcome, setShowWelcome] = useState<boolean>(true);
  const [layoutPreference, setLayoutPreference] = useState<LayoutPreference>(null);

  // Check if user has already made a choice
  useEffect(() => {
    const savedPreference = localStorage.getItem('layoutPreference');
    if (savedPreference) {
      setLayoutPreference(savedPreference as LayoutPreference);
      setShowWelcome(false);
    }
  }, []);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        // For now, we'll just use the regular projects endpoint
        // In the future, we could create a dedicated featured projects endpoint
        const data = await fetchApi(ENDPOINTS.PROJECTS);

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

  const handleUserChoice = (choice: 'guide' | 'standard') => {
    setLayoutPreference(choice);
    localStorage.setItem('layoutPreference', choice);
    setShowWelcome(false);
  };

  // Content to be displayed in either layout
  const HomeContent = () => (
    <div className="home-page">
      <motion.section
        className="hero"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
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
      </motion.section>

      <motion.section
        className="featured-projects"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h2>Featured Projects</h2>

        {loading ? (
          <div className="loading">Loading featured projects...</div>
        ) : (
          <div className="project-cards">
            {featuredProjects.map((project, index) => (
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
        )}

        <div className="view-all-projects">
          <Link to="/projects" className="btn btn-outline">
            View All Projects
          </Link>
        </div>
      </motion.section>
    </div>
  );

  // Render the appropriate layout based on user preference
  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <WelcomeScreen onUserChoice={handleUserChoice} />
        )}
      </AnimatePresence>

      {!showWelcome && (
        layoutPreference === 'guide' ? (
          <SplitLayout>
            <HomeContent />
          </SplitLayout>
        ) : (
          <Layout>
            <HomeContent />
          </Layout>
        )
      )}
    </>
  );
};

export default HomePage;
