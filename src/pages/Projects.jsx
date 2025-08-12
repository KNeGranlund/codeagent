import './Page.css';

function Projects() {
  const projects = [
    {
      id: 1,
      name: "E-commerce Platform",
      description: "Full-stack e-commerce solution with React and Node.js",
      status: "Active",
      lastModified: "2 hours ago",
      language: "JavaScript"
    },
    {
      id: 2,
      name: "Machine Learning API",
      description: "REST API for ML model inference and training",
      status: "Development",
      lastModified: "1 day ago",
      language: "Python"
    },
    {
      id: 3,
      name: "Mobile App Backend",
      description: "Backend services for iOS and Android application",
      status: "Testing",
      lastModified: "3 days ago",
      language: "Go"
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>Projects</h1>
        <p>Manage and monitor your development projects.</p>
        <button className="primary-button">+ New Project</button>
      </div>
      
      <div className="page-content">
        <div className="projects-grid">
          {projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.name}</h3>
                <span className={`status-badge status-${project.status.toLowerCase()}`}>
                  {project.status}
                </span>
              </div>
              
              <p className="project-description">{project.description}</p>
              
              <div className="project-meta">
                <span className="project-language">
                  <span className="language-dot" style={{
                    backgroundColor: project.language === 'JavaScript' ? '#f7df1e' : 
                                   project.language === 'Python' ? '#3776ab' : '#00add8'
                  }}></span>
                  {project.language}
                </span>
                <span className="project-modified">Modified {project.lastModified}</span>
              </div>
              
              <div className="project-actions">
                <button className="secondary-button">View</button>
                <button className="secondary-button">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Projects;