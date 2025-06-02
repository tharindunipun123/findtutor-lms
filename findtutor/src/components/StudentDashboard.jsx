import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    // Check if user is logged in and is a student
    if (!user || user.role !== 'student') {
      navigate('/login/student');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Mock data for tutor requests
  const tutorRequests = [
    {
      id: 1,
      teacherName: 'Dr. Sarah Johnson',
      subject: 'Mathematics',
      level: 'Advanced',
      requestDate: '2024-03-15',
      status: 'pending'
    },
    {
      id: 2,
      teacherName: 'Prof. Michael Brown',
      subject: 'Physics',
      level: 'Intermediate',
      requestDate: '2024-03-14',
      status: 'accepted'
    }
  ];

  // Mock data for enrolled classes
  const enrolledClasses = [
    {
      id: 1,
      subject: 'Mathematics',
      teacher: 'Dr. Sarah Johnson',
      schedule: 'Mon, Wed 10:00 AM',
      progress: 75
    },
    {
      id: 2,
      subject: 'Physics',
      teacher: 'Prof. Michael Brown',
      schedule: 'Tue, Thu 2:00 PM',
      progress: 60
    }
  ];

  // Mock data for learning resources
  const learningResources = [
    {
      id: 1,
      title: 'Mathematics Fundamentals',
      type: 'PDF',
      subject: 'Mathematics',
      uploadDate: '2024-03-10'
    },
    {
      id: 2,
      title: 'Physics Practice Problems',
      type: 'Video',
      subject: 'Physics',
      uploadDate: '2024-03-12'
    }
  ];

  // Profile data
  const profileData = {
    name: user?.name || 'Student Name',
    email: user?.email || 'student@example.com',
    grade: '12th Grade',
    subjects: ['Mathematics', 'Physics'],
    joinDate: '2024-01-01'
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <img
            src={user?.profile_picture || 'https://via.placeholder.com/100'}
            alt="Profile"
            className="profile-image"
          />
          <h5>{user?.name || 'Student Name'}</h5>
          <p className="text-muted">Student</p>
        </div>

        <ul className="nav flex-column">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              <i className="bi bi-envelope me-2"></i>
              Tutor Requests
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'classes' ? 'active' : ''}`}
              onClick={() => setActiveTab('classes')}
            >
              <i className="bi bi-book me-2"></i>
              My Classes
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'resources' ? 'active' : ''}`}
              onClick={() => setActiveTab('resources')}
            >
              <i className="bi bi-file-earmark-text me-2"></i>
              Learning Resources
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <i className="bi bi-person me-2"></i>
              Profile
            </button>
          </li>
          <li className="nav-item mt-3">
            <button
              className="nav-link text-danger"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <main className="main-content">
        <div className="content-header">
          <h1>
            {activeTab === 'requests' && 'Tutor Requests'}
            {activeTab === 'classes' && 'My Classes'}
            {activeTab === 'resources' && 'Learning Resources'}
            {activeTab === 'profile' && 'Profile Management'}
          </h1>
        </div>

        <div className="content-body">
          {activeTab === 'requests' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Tutor Requests</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Teacher</th>
                        <th>Subject</th>
                        <th>Level</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tutorRequests.map(request => (
                        <tr key={request.id}>
                          <td>{request.teacherName}</td>
                          <td>{request.subject}</td>
                          <td>{request.level}</td>
                          <td>{request.requestDate}</td>
                          <td>
                            <span className={`badge bg-${request.status === 'pending' ? 'warning' : 'success'}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">View Details</button>
                            <button className="btn btn-sm btn-danger">Cancel</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button className="btn btn-primary mt-3">Request New Tutor</button>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Enrolled Classes</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Schedule</th>
                        <th>Progress</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrolledClasses.map(cls => (
                        <tr key={cls.id}>
                          <td>{cls.subject}</td>
                          <td>{cls.teacher}</td>
                          <td>{cls.schedule}</td>
                          <td>
                            <div className="progress">
                              <div 
                                className="progress-bar" 
                                role="progressbar" 
                                style={{ width: `${cls.progress}%` }}
                                aria-valuenow={cls.progress} 
                                aria-valuemin="0" 
                                aria-valuemax="100"
                              >
                                {cls.progress}%
                              </div>
                            </div>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">View Details</button>
                            <button className="btn btn-sm btn-danger">Leave Class</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'resources' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Learning Resources</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Subject</th>
                        <th>Upload Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {learningResources.map(resource => (
                        <tr key={resource.id}>
                          <td>{resource.title}</td>
                          <td>
                            <span className={`badge bg-${resource.type === 'PDF' ? 'danger' : 'primary'}`}>
                              {resource.type}
                            </span>
                          </td>
                          <td>{resource.subject}</td>
                          <td>{resource.uploadDate}</td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">Download</button>
                            <button className="btn btn-sm btn-info">View</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Profile Information</h5>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={profileData.name} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" value={profileData.email} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Grade</label>
                      <input type="text" className="form-control" value={profileData.grade} readOnly />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Subjects</label>
                      <input type="text" className="form-control" value={profileData.subjects.join(', ')} readOnly />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Join Date</label>
                      <input type="text" className="form-control" value={profileData.joinDate} readOnly />
                    </div>
                  </div>
                </div>
                <button className="btn btn-primary">Edit Profile</button>
              </div>
            </div>
          )}
        </div>
      </main>

      <style jsx>{`
        .dashboard-container {
          display: flex;
          min-height: 100vh;
          padding-top: 80px; /* Height of the header */
        }

        .sidebar {
          width: 280px;
          background-color: #f8f9fa;
          padding: 20px;
          position: fixed;
          height: calc(100vh - 80px);
          overflow-y: auto;
          border-right: 1px solid #dee2e6;
        }

        .sidebar-header {
          text-align: center;
          padding-bottom: 20px;
          border-bottom: 1px solid #dee2e6;
          margin-bottom: 20px;
        }

        .profile-image {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          object-fit: cover;
          margin-bottom: 10px;
        }

        .nav-link {
          color: #333;
          padding: 10px 15px;
          border-radius: 5px;
          margin: 5px 0;
          text-align: left;
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
        }

        .nav-link:hover {
          background-color: #e9ecef;
        }

        .nav-link.active {
          background-color: #0d6efd;
          color: white;
        }

        .main-content {
          flex: 1;
          margin-left: 280px;
          padding: 20px;
        }

        .content-header {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 1px solid #dee2e6;
        }

        .content-body {
          background-color: white;
        }

        .card {
          border: none;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .table {
          margin-bottom: 0;
        }

        .badge {
          padding: 5px 10px;
        }

        .progress {
          height: 20px;
        }

        @media (max-width: 768px) {
          .sidebar {
            width: 100%;
            position: relative;
            height: auto;
          }

          .main-content {
            margin-left: 0;
          }

          .dashboard-container {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard; 