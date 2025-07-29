import React, { useState, useEffect } from 'react';
import { userAPI, absenceAPI } from '../services/api';

const AdminDashboard = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [stats, setStats] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'daily_reporter',
    group: ''
  });
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, absencesRes, statsRes] = await Promise.all([
        userAPI.getAll(),
        absenceAPI.getAll(),
        absenceAPI.getStats()
      ]);
      
      setUsers(usersRes.data);
      setAbsences(absencesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const handleUserInputChange = (e) => {
    setUserFormData({
      ...userFormData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await userAPI.update(editingUser._id, userFormData);
        setMessage('User updated successfully!');
      } else {
        await userAPI.create(userFormData);
        setMessage('User created successfully!');
      }
      
      fetchData();
      setShowUserModal(false);
      setEditingUser(null);
      resetUserForm();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      group: user.group || ''
    });
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.delete(userId);
        setMessage('User deleted successfully!');
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Error deleting user');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const handleDeleteAbsence = async (absenceId) => {
    if (window.confirm('Are you sure you want to delete this absence report?')) {
      try {
        await absenceAPI.delete(absenceId);
        setMessage('Absence report deleted successfully!');
        fetchData();
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Error deleting absence report');
        setTimeout(() => setMessage(''), 3000);
      }
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      username: '',
      email: '',
      password: '',
      role: 'daily_reporter',
      group: ''
    });
  };

  const handleCloseUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    resetUserForm();
  };

  const handleNewUser = () => {
    resetUserForm();
    setEditingUser(null);
    setShowUserModal(true);
  };

  if (loading) {
    return <div className="card"><h2>Loading...</h2></div>;
  }

  return (
    <div>
      <h2>Admin Dashboard</h2>
      
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      {/* Statistics */}
      {stats && (
        <div className="card">
          <h3>System Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p>{users.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Reports</h3>
              <p>{stats.totalReports}</p>
            </div>
            {stats.statusBreakdown.map(stat => (
              <div key={stat._id} className="stat-card">
                <h3>{stat._id.charAt(0).toUpperCase() + stat._id.slice(1)}</h3>
                <p>{stat.count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="card">
        <div style={{ borderBottom: '1px solid #ddd', marginBottom: '20px' }}>
          <button 
            className={`btn ${activeTab === 'users' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('users')}
            style={{ marginRight: '10px' }}
          >
            User Management
          </button>
          <button 
            className={`btn ${activeTab === 'absences' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('absences')}
          >
            Absence Management
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3>User Management</h3>
              <button className="btn btn-success" onClick={handleNewUser}>
                Add New User
              </button>
            </div>

            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Group</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>{u.group || '-'}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        className="btn btn-primary"
                        onClick={() => handleEditUser(u)}
                        style={{ fontSize: '12px', padding: '5px 10px', marginRight: '5px' }}
                      >
                        Edit
                      </button>
                      {u._id !== user.id && (
                        <button 
                          className="btn btn-danger"
                          onClick={() => handleDeleteUser(u._id)}
                          style={{ fontSize: '12px', padding: '5px 10px' }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Absence Management Tab */}
        {activeTab === 'absences' && (
          <div>
            <h3>Absence Management</h3>
            <table className="table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Employee ID</th>
                  <th>Group</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Reported By</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {absences.map(absence => (
                  <tr key={absence._id}>
                    <td>{absence.employeeName}</td>
                    <td>{absence.employeeId}</td>
                    <td>{absence.group}</td>
                    <td>{new Date(absence.date).toLocaleDateString()}</td>
                    <td>
                      <span style={{ 
                        color: absence.status === 'present' ? 'green' : 
                               absence.status === 'absent' ? 'red' : 
                               absence.status === 'late' ? 'orange' : 'blue'
                      }}>
                        {absence.status}
                      </span>
                    </td>
                    <td>{absence.reason || '-'}</td>
                    <td>{absence.reportedBy?.username}</td>
                    <td>
                      <button 
                        className="btn btn-danger"
                        onClick={() => handleDeleteAbsence(absence._id)}
                        style={{ fontSize: '12px', padding: '5px 10px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {absences.length === 0 && (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
                No absence reports found
              </p>
            )}
          </div>
        )}
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingUser ? 'Edit User' : 'New User'}</h3>
              <button className="modal-close" onClick={handleCloseUserModal}>×</button>
            </div>
            
            <form onSubmit={handleUserSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={userFormData.username}
                  onChange={handleUserInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={userFormData.email}
                  onChange={handleUserInputChange}
                  required
                />
              </div>
              
              {!editingUser && (
                <div className="form-group">
                  <label>Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={userFormData.password}
                    onChange={handleUserInputChange}
                    required={!editingUser}
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  className="form-control"
                  value={userFormData.role}
                  onChange={handleUserInputChange}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="daily_reporter">Daily Reporter</option>
                </select>
              </div>
              
              {userFormData.role === 'daily_reporter' && (
                <div className="form-group">
                  <label>Group</label>
                  <input
                    type="text"
                    name="group"
                    className="form-control"
                    value={userFormData.group}
                    onChange={handleUserInputChange}
                    placeholder="Enter group name (e.g., Team A, Department 1)"
                    required
                  />
                </div>
              )}
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={handleCloseUserModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;