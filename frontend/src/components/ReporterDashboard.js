import React, { useState, useEffect } from 'react';
import { absenceAPI } from '../services/api';

const ReporterDashboard = ({ user }) => {
  const [absences, setAbsences] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState(null);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    date: '',
    status: 'present',
    reason: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyReports();
  }, []);

  const fetchMyReports = async () => {
    try {
      const response = await absenceAPI.getMyReports();
      setAbsences(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
    setLoading(false);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAbsence) {
        await absenceAPI.update(editingAbsence._id, formData);
        setMessage('Absence report updated successfully!');
      } else {
        await absenceAPI.create(formData);
        setMessage('Absence report created successfully!');
      }
      
      fetchMyReports();
      setShowModal(false);
      setEditingAbsence(null);
      resetForm();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving report');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleEdit = (absence) => {
    setEditingAbsence(absence);
    setFormData({
      employeeName: absence.employeeName,
      employeeId: absence.employeeId,
      date: new Date(absence.date).toISOString().split('T')[0],
      status: absence.status,
      reason: absence.reason || ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      employeeName: '',
      employeeId: '',
      date: '',
      status: 'present',
      reason: ''
    });
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAbsence(null);
    resetForm();
  };

  const handleNewReport = () => {
    resetForm();
    setEditingAbsence(null);
    setShowModal(true);
  };

  if (loading) {
    return <div className="card"><h2>Loading...</h2></div>;
  }

  return (
    <div>
      <h2>Daily Reporter Dashboard - Group: {user.group}</h2>
      
      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
          {message}
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3>My Absence Reports</h3>
          <button className="btn btn-primary" onClick={handleNewReport}>
            New Report
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Employee ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {absences.map(absence => (
              <tr key={absence._id}>
                <td>{absence.employeeName}</td>
                <td>{absence.employeeId}</td>
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
                <td>{new Date(absence.createdAt).toLocaleDateString()}</td>
                <td>
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleEdit(absence)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {absences.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '20px' }}>
            No reports created yet. Click "New Report" to create your first report.
          </p>
        )}
      </div>

      {/* Modal for Create/Edit */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingAbsence ? 'Edit Absence Report' : 'New Absence Report'}</h3>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Employee Name</label>
                <input
                  type="text"
                  name="employeeName"
                  className="form-control"
                  value={formData.employeeName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  className="form-control"
                  value={formData.employeeId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  className="form-control"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="sick_leave">Sick Leave</option>
                  <option value="vacation">Vacation</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Reason (Optional)</label>
                <textarea
                  name="reason"
                  className="form-control"
                  rows="3"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Enter reason for absence..."
                />
              </div>
              
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" className="btn" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingAbsence ? 'Update Report' : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReporterDashboard;