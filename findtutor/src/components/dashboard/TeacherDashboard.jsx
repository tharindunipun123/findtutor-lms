import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container-fluid py-4 mt-5">
      <div className="row">
        {/* Sidebar */}
        <div className="col-md-3 col-lg-2">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <div className="text-center mb-4">
                <div className="avatar-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-person-fill fs-1"></i>
                </div>
                <h5 className="mb-1">{user?.name || 'Teacher Name'}</h5>
                <p className="text-muted mb-0">{user?.email}</p>
              </div>

              <div className="list-group">
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  <i className="bi bi-envelope me-2"></i>
                  Student Requests
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person me-2"></i>
                  Profile
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'classes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('classes')}
                >
                  <i className="bi bi-book me-2"></i>
                  Classes
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'location' ? 'active' : ''}`}
                  onClick={() => setActiveTab('location')}
                >
                  <i className="bi bi-geo-alt me-2"></i>
                  Location
                </button>
                <button
                  className="list-group-item list-group-item-action text-danger"
                  onClick={handleLogout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9 col-lg-10">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {activeTab === 'requests' && (
                <div>
                  <h4 className="mb-4">Student Requests</h4>
                  <div className="alert alert-info">
                    No pending requests at the moment.
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div>
                  <h4 className="mb-4">Profile</h4>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Full Name</label>
                        <input type="text" className="form-control" value={user?.name || ''} readOnly />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={user?.email || ''} readOnly />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Subjects</label>
                        <input type="text" className="form-control" value={user?.subjects || ''} readOnly />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Experience</label>
                        <input type="text" className="form-control" value={user?.experience || ''} readOnly />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Qualifications</label>
                        <textarea className="form-control" rows="3" value={user?.qualifications || ''} readOnly />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Hourly Rate</label>
                        <input type="text" className="form-control" value={user?.hourlyRate || ''} readOnly />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'classes' && (
                <div>
                  <h4 className="mb-4">Classes</h4>
                  <div className="alert alert-info">
                    No active classes at the moment.
                  </div>
                </div>
              )}

              {activeTab === 'location' && (
                <div>
                  <h4 className="mb-4">Location</h4>
                  <div className="alert alert-info">
                    Location settings will be available soon.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .list-group-item {
          border: none;
          padding: 0.75rem 1rem;
          margin-bottom: 0.25rem;
          border-radius: 0.5rem !important;
        }

        .list-group-item:hover {
          background-color: #f8f9fa;
        }

        .list-group-item.active {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .card {
          border-radius: 1rem;
        }

        .avatar-placeholder {
          background-color: #2563eb;
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard; 