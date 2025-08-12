import { useState } from 'react';
import './Sidebar.css';

function Sidebar({ isOpen, onClose }) {
  const [activeSection, setActiveSection] = useState('tools');

  const toggleSection = (section) => {
    setActiveSection(activeSection === section ? '' : section);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}
      
      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h3>Page Tools</h3>
          <button className="sidebar-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="sidebar-content">
          {/* Page Tools Section */}
          <div className="sidebar-section">
            <button 
              className={`section-header ${activeSection === 'tools' ? 'active' : ''}`}
              onClick={() => toggleSection('tools')}
            >
              <span>🔧 Page Tools</span>
              <span className="toggle-icon">{activeSection === 'tools' ? '▼' : '▶'}</span>
            </button>
            
            {activeSection === 'tools' && (
              <div className="section-content">
                <button className="tool-button">
                  <span>📝</span>
                  Code Editor
                </button>
                <button className="tool-button">
                  <span>🔍</span>
                  Search Files
                </button>
                <button className="tool-button">
                  <span>🚀</span>
                  Deploy
                </button>
                <button className="tool-button">
                  <span>📊</span>
                  Analytics
                </button>
                <button className="tool-button">
                  <span>🐛</span>
                  Debug Console
                </button>
              </div>
            )}
          </div>

          {/* User Settings Section */}
          <div className="sidebar-section">
            <button 
              className={`section-header ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => toggleSection('settings')}
            >
              <span>⚙️ User Settings</span>
              <span className="toggle-icon">{activeSection === 'settings' ? '▼' : '▶'}</span>
            </button>
            
            {activeSection === 'settings' && (
              <div className="section-content">
                <button className="tool-button">
                  <span>👤</span>
                  Profile
                </button>
                <button className="tool-button">
                  <span>🎨</span>
                  Theme
                </button>
                <button className="tool-button">
                  <span>🔔</span>
                  Notifications
                </button>
                <button className="tool-button">
                  <span>🔐</span>
                  Security
                </button>
                <button className="tool-button">
                  <span>📤</span>
                  Export Data
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions Section */}
          <div className="sidebar-section">
            <button 
              className={`section-header ${activeSection === 'actions' ? 'active' : ''}`}
              onClick={() => toggleSection('actions')}
            >
              <span>⚡ Quick Actions</span>
              <span className="toggle-icon">{activeSection === 'actions' ? '▼' : '▶'}</span>
            </button>
            
            {activeSection === 'actions' && (
              <div className="section-content">
                <button className="tool-button">
                  <span>➕</span>
                  New Project
                </button>
                <button className="tool-button">
                  <span>📋</span>
                  Clone Repository
                </button>
                <button className="tool-button">
                  <span>💾</span>
                  Save All
                </button>
                <button className="tool-button">
                  <span>🔄</span>
                  Sync Changes
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;