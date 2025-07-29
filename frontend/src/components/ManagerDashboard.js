import React, { useState, useEffect } from 'react';
import { absenceAPI, userAPI } from '../services/api';

const ManagerDashboard = ({ user }) => {
  const [absences, setAbsences] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    date: '',
    group: '',
    status: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchAbsences();
  }, [filters]);

  const fetchData = async () => {
    try {
      const [absencesRes, usersRes, statsRes] = await Promise.all([
        absenceAPI.getAll(),
        userAPI.getAll(),
        absenceAPI.getStats()
      ]);
      
      setAbsences(absencesRes.data);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setLoading(false);
  };

  const fetchAbsences = async () => {
    try {
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.group) params.group = filters.group;
      if (filters.status) params.status = filters.status;
      
      const response = await absenceAPI.getAll(params);
      setAbsences(response.data);
    } catch (error) {
      console.error('Error fetching absences:', error);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      date: '',
      group: '',
      status: ''
    });
  };

  const getUniqueGroups = () => {
    const groups = users
      .filter(u => u.role === 'daily_reporter')
      .map(u => u.group)
      .filter(Boolean);
    return [...new Set(groups)];
  };

  if (loading) {
    return <div className="card"><h2>Loading...</h2></div>;
  }

  return (
    <div>
      <h2>Manager Dashboard</h2>
      
      {/* Statistics */}
      {stats && (
        <div className="card">
          <h3>Overview Statistics</h3>
          <div className="stats-grid">
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

      {/* Company Members */}
      <div className="card">
        <h3>Company Members</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Group</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {users.map(member => (
              <tr key={member._id}>
                <td>{member.username}</td>
                <td>{member.email}</td>
                <td>{member.role}</td>
                <td>{member.group || '-'}</td>
                <td>{new Date(member.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Absence Reports */}
      <div className="card">
        <h3>Absence Reports</h3>
        
        {/* Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              className="form-control"
              value={filters.date}
              onChange={handleFilterChange}
            />
          </div>
          <div className="form-group">
            <label>Group</label>
            <select
              name="group"
              className="form-control"
              value={filters.group}
              onChange={handleFilterChange}
            >
              <option value="">All Groups</option>
              {getUniqueGroups().map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              className="form-control"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="sick_leave">Sick Leave</option>
              <option value="vacation">Vacation</option>
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', alignItems: 'end' }}>
            <button className="btn btn-primary" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

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
              <th>Created</th>
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
                <td>{new Date(absence.createdAt).toLocaleDateString()}</td>
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
    </div>
  );
};

export default ManagerDashboard;