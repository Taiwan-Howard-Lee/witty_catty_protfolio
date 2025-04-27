import { Link } from 'react-router-dom';
import './ProjectCard.css';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  live_link?: string;
  repo_link?: string;
}

const ProjectCard = ({
  id,
  title,
  description,
  tech_stack,
  live_link,
  repo_link
}: ProjectCardProps) => {
  return (
    <div className="project-card">
      <h2 className="project-title">{title}</h2>
      <p className="project-description">{description}</p>
      
      <div className="tech-stack">
        {tech_stack.map((tech, index) => (
          <span key={index} className="tech-tag">
            {tech}
          </span>
        ))}
      </div>
      
      <div className="project-links">
        <Link to={`/projects/${id}`} className="project-link view-details">
          View Details
        </Link>
        
        {live_link && (
          <a
            href={live_link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
          >
            Live Demo
          </a>
        )}
        
        {repo_link && (
          <a
            href={repo_link}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
          >
            GitHub Repo
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
