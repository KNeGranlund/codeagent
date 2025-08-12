import './Page.css';

function Home() {
  return (
    <div className="page">
      <div className="page-header">
        <h1>Welcome to CodeAgent</h1>
        <p>Your intelligent coding companion for project management and development.</p>
      </div>
      
      <div className="page-content">
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Quick Start</h3>
            <p>Get up and running with your projects in minutes with our intuitive interface.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered</h3>
            <p>Leverage artificial intelligence to accelerate your development workflow.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Analytics</h3>
            <p>Track your progress and optimize your development process with detailed insights.</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔧</div>
            <h3>Tools</h3>
            <p>Access a comprehensive suite of development tools from the sidebar.</p>
          </div>
        </div>
        
        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-icon">📝</span>
              <div className="activity-details">
                <div className="activity-title">Created new project</div>
                <div className="activity-time">2 hours ago</div>
              </div>
            </div>
            
            <div className="activity-item">
              <span className="activity-icon">🔄</span>
              <div className="activity-details">
                <div className="activity-title">Synced changes to repository</div>
                <div className="activity-time">4 hours ago</div>
              </div>
            </div>
            
            <div className="activity-item">
              <span className="activity-icon">🐛</span>
              <div className="activity-details">
                <div className="activity-title">Fixed critical bug in authentication</div>
                <div className="activity-time">1 day ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;