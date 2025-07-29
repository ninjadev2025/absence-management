import React from 'react';
import ManagerDashboard from './ManagerDashboard';
import ReporterDashboard from './ReporterDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = ({ user, onLogout }) => {
  const renderDashboard = () => {
    switch (user.role) {
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'manager':
        return <ManagerDashboard user={user} />;
      case 'daily_reporter':
        return <ReporterDashboard user={user} />;
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <div>
      <div className="header">
        <div className="container">
          <div className="nav">
            <h1>Absence Management System</h1>
            <div className="nav-links">
              <span>Welcome, {user.username} ({user.role})</span>
              <button 
                className="btn btn-danger"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container">
        {renderDashboard()}
      </div>
    </div>
  );
};

export default Dashboard;