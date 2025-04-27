import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './styles/base.css';       // Importing base styles
import './styles/layout.css';     // Importing layout styles
import './styles/components.css'; // Importing components styles
import './styles/themes.css';     // Importing themes (colors, etc.)
import './styles/animations.css'; // Importing animations
import './styles/utilities.css';  // Importing utility classes

import './App.css';
// Import pages
import Home from './pages/Home';
import LoanApplication from './pages/LoanApplication';
import Dashboard from './pages/Dashboard';

// Import wallet provider
import { WalletProvider } from './context/WalletContext';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="App">
          <nav className="navbar">
            <Link to="/" className="nav-logo">DotSloan</Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/apply" className="nav-link">Apply</Link>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
            </div>
          </nav>
          
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/apply" element={<LoanApplication />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;