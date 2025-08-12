import { useState } from 'react';
import { Link } from 'react-router-dom';
import './AppBar.css';

function AppBar({ onToggleSidebar }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="app-bar">
      <div className="app-bar-container">
        {/* Logo/Brand */}
        <div className="app-bar-brand">
          <Link to="/" className="brand-link">
            CodeAgent
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="app-bar-nav">
          <Link to="/" className="nav-link">Home</Link>
          <Link to="/projects" className="nav-link">Projects</Link>
          <Link to="/agents" className="nav-link">Agents</Link>
          <Link to="/settings" className="nav-link">Settings</Link>
        </div>

        {/* Action Buttons */}
        <div className="app-bar-actions">
          <button 
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
          >
            <span className="sidebar-icon">☰</span>
          </button>
          
          <button 
            className="mobile-menu-toggle"
            onClick={toggleMobileMenu}
            title="Toggle menu"
          >
            <span className="menu-icon">☰</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="mobile-nav">
          <Link to="/" className="mobile-nav-link" onClick={toggleMobileMenu}>
            Home
          </Link>
          <Link to="/projects" className="mobile-nav-link" onClick={toggleMobileMenu}>
            Projects
          </Link>
          <Link to="/agents" className="mobile-nav-link" onClick={toggleMobileMenu}>
            Agents
          </Link>
          <Link to="/settings" className="mobile-nav-link" onClick={toggleMobileMenu}>
            Settings
          </Link>
        </div>
      )}
    </nav>
  );
}

export default AppBar;