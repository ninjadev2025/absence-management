import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Header with Navigation */}
      <header className="landing-header">
        <nav className="landing-nav">
          <Link to="/" className="logo">
            AbsenceTracker Pro
          </Link>
          <div className="nav-buttons">
            <Link to="/login" className="nav-btn">
              Login
            </Link>
            <Link to="/register" className="nav-btn primary">
              Register
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="landing-main">
        <div className="hero-content">
          <h1 className="company-logo">
            AbsenceTracker Pro
          </h1>
          <p className="company-tagline">
            Streamline Your Workforce Management with Smart Absence Tracking
          </p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3 className="feature-title">Multi-Role Access</h3>
              <p className="feature-desc">
                Dedicated interfaces for Admins, Managers, and Daily Reporters with role-based permissions
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3 className="feature-title">Real-time Analytics</h3>
              <p className="feature-desc">
                Comprehensive dashboards with statistics and insights into attendance patterns
              </p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Easy Reporting</h3>
              <p className="feature-desc">
                Quick and intuitive absence reporting with automated tracking and notifications
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-grid">
            <div className="footer-section">
              <h3>About AbsenceTracker Pro</h3>
              <p>
                A comprehensive absence management system designed to help organizations 
                efficiently track and manage employee attendance. Built with modern 
                technology for reliability and ease of use.
              </p>
            </div>
            
            <div className="footer-section">
              <h3>Features</h3>
              <ul>
                <li>Role-based access control</li>
                <li>Real-time reporting</li>
                <li>Advanced analytics</li>
                <li>Mobile-friendly interface</li>
                <li>Secure data management</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Contact Information</h3>
              <ul>
                <li>📧 support@absencetracker.com</li>
                <li>📞 +1 (555) 123-4567</li>
                <li>🏢 123 Business Ave, Suite 100</li>
                <li>🌐 www.absencetracker.com</li>
              </ul>
            </div>
            
            <div className="footer-section">
              <h3>Quick Links</h3>
              <ul>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#support">Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 AbsenceTracker Pro. All rights reserved. | Built with MERN Stack</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;