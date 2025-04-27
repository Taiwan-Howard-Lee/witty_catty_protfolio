import { Layout } from '../components/Layout';
import './AboutPage.css';

const AboutPage = () => {
  return (
    <Layout>
      <div className="about-page">
        <h1>About Me</h1>
        
        <section className="about-section">
          <div className="about-content">
            <div className="about-text">
              <h2>Who I Am</h2>
              <p>
                Hello! I'm a passionate software developer with a love for creating
                intuitive and impactful applications. My journey in programming
                began several years ago, and I've been hooked ever since.
              </p>
              <p>
                I specialize in full-stack development, with expertise in modern
                web technologies. I enjoy solving complex problems and turning ideas
                into reality through code.
              </p>
              <p>
                When I'm not coding, you can find me exploring new technologies,
                contributing to open-source projects, or enjoying the outdoors.
              </p>
            </div>
            <div className="about-image">
              {/* Placeholder for profile image */}
              <div className="image-placeholder">
                Profile Image
              </div>
            </div>
          </div>
        </section>
        
        <section className="skills-section">
          <h2>My Skills</h2>
          <div className="skills-container">
            <div className="skill-category">
              <h3>Frontend</h3>
              <ul className="skills-list">
                <li>React</li>
                <li>TypeScript</li>
                <li>HTML5 & CSS3</li>
                <li>JavaScript (ES6+)</li>
                <li>Responsive Design</li>
              </ul>
            </div>
            
            <div className="skill-category">
              <h3>Backend</h3>
              <ul className="skills-list">
                <li>Node.js</li>
                <li>Express</li>
                <li>RESTful APIs</li>
                <li>GraphQL</li>
                <li>WebSockets</li>
              </ul>
            </div>
            
            <div className="skill-category">
              <h3>Database</h3>
              <ul className="skills-list">
                <li>PostgreSQL</li>
                <li>MongoDB</li>
                <li>Supabase</li>
                <li>Firebase</li>
                <li>Redis</li>
              </ul>
            </div>
            
            <div className="skill-category">
              <h3>Tools & Others</h3>
              <ul className="skills-list">
                <li>Git & GitHub</li>
                <li>Docker</li>
                <li>CI/CD</li>
                <li>AWS</li>
                <li>Agile Methodologies</li>
              </ul>
            </div>
          </div>
        </section>
        
        <section className="experience-section">
          <h2>Experience</h2>
          <div className="timeline">
            <div className="timeline-item">
              <div className="timeline-date">2022 - Present</div>
              <div className="timeline-content">
                <h3>Senior Software Developer</h3>
                <p className="timeline-company">Tech Innovations Inc.</p>
                <p>
                  Leading development of web applications using React, Node.js, and
                  PostgreSQL. Implementing CI/CD pipelines and mentoring junior developers.
                </p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-date">2019 - 2022</div>
              <div className="timeline-content">
                <h3>Full Stack Developer</h3>
                <p className="timeline-company">Digital Solutions Ltd.</p>
                <p>
                  Developed and maintained multiple client projects using JavaScript
                  frameworks. Collaborated with design and product teams to deliver
                  high-quality applications.
                </p>
              </div>
            </div>
            
            <div className="timeline-item">
              <div className="timeline-date">2017 - 2019</div>
              <div className="timeline-content">
                <h3>Frontend Developer</h3>
                <p className="timeline-company">WebCraft Studios</p>
                <p>
                  Created responsive user interfaces and implemented frontend features
                  for various web applications. Worked closely with backend developers
                  to integrate APIs.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
