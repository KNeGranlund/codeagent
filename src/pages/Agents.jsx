import './Page.css';

function Agents() {
  const agents = [
    {
      id: 1,
      name: "Code Reviewer",
      description: "Automatically reviews code for best practices and potential issues",
      status: "Online",
      lastActivity: "5 minutes ago",
      type: "Review"
    },
    {
      id: 2,
      name: "Test Generator",
      description: "Generates unit tests based on your code structure",
      status: "Busy",
      lastActivity: "Running on Project #1",
      type: "Testing"
    },
    {
      id: 3,
      name: "Documentation Bot",
      description: "Creates and maintains project documentation automatically",
      status: "Idle",
      lastActivity: "1 hour ago",
      type: "Documentation"
    },
    {
      id: 4,
      name: "Deployment Agent",
      description: "Handles continuous integration and deployment pipelines",
      status: "Online",
      lastActivity: "30 minutes ago",
      type: "DevOps"
    }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h1>AI Agents</h1>
        <p>Manage your intelligent coding assistants and automation tools.</p>
        <button className="primary-button">+ Create Agent</button>
      </div>
      
      <div className="page-content">
        <div className="agents-grid">
          {agents.map(agent => (
            <div key={agent.id} className="agent-card">
              <div className="agent-header">
                <div className="agent-info">
                  <h3>{agent.name}</h3>
                  <span className={`agent-type type-${agent.type.toLowerCase()}`}>
                    {agent.type}
                  </span>
                </div>
                <div className={`status-indicator status-${agent.status.toLowerCase()}`}>
                  <span className="status-dot"></span>
                  {agent.status}
                </div>
              </div>
              
              <p className="agent-description">{agent.description}</p>
              
              <div className="agent-activity">
                <span className="activity-label">Last Activity:</span>
                <span className="activity-time">{agent.lastActivity}</span>
              </div>
              
              <div className="agent-actions">
                <button className="secondary-button">Configure</button>
                <button className="secondary-button">Logs</button>
                <button className={agent.status === 'Online' ? 'danger-button' : 'primary-button'}>
                  {agent.status === 'Online' ? 'Stop' : 'Start'}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="agent-stats">
          <h2>Agent Performance</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">24</div>
              <div className="stat-label">Tasks Completed Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">3</div>
              <div className="stat-label">Active Agents</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">98%</div>
              <div className="stat-label">Success Rate</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">2.3s</div>
              <div className="stat-label">Avg Response Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Agents;