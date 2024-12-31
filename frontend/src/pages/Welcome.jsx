import React from 'react';
import { Link } from 'react-router-dom';
import './Welcome.css';

const Welcome = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1>Welcome to Address Saver</h1>
        <p className="subtitle">Your personal address book with interactive maps</p>
        
        <div className="features">
          <div className="feature">
            <h3>🗺️ Interactive Maps</h3>
            <p>Search and visualize locations on an interactive map</p>
          </div>
          <div className="feature">
            <h3>📍 Save Locations</h3>
            <p>Save your favorite places and important addresses</p>
          </div>
          <div className="feature">
            <h3>🔍 Easy Search</h3>
            <p>Quickly find any saved location</p>
          </div>
        </div>

        <div className="auth-buttons">
          <Link to="/login" className="btn login-btn">Login</Link>
          <Link to="/register" className="btn register-btn">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome; 