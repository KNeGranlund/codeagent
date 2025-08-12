import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppBar from './components/AppBar';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Agents from './pages/Agents';
import Settings from './pages/Settings';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Router>
      <div className="app">
        <AppBar onToggleSidebar={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/agents" element={<Agents />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
