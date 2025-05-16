import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TeacherDashboard = () => {
  // State for managing different sections
  const [activeSection, setActiveSection] = useState('overview');

  // Mock data for student requests
  const studentRequests = [
    {
      id: 1,
      studentName: 'John Doe',
      subject: 'Mathematics',
      level: 'Advanced',
      requestDate: '2024-03-15',
      status: 'pending'
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      subject: 'Physics',
      level: 'Intermediate',
      requestDate: '2024-03-14',
      status: 'accepted'
    }
  ];

  // Mock data for classes
  const classes = [
    {
      id: 1,
      subject: 'Mathematics',
      students: 5,
      schedule: 'Mon, Wed 10:00 AM',
      status: 'active'
    },
    {
      id: 2,
      subject: 'Physics',
      students: 3,
      schedule: 'Tue, Thu 2:00 PM',
      status: 'active'
    }
  ];

  // Mock data for locations
  const locations = [
    {
      id: 1,
      name: 'Main Teaching Center',
      address: '123 Education St, City',
      capacity: 10,
      status: 'active'
    },
    {
      id: 2,
      name: 'Online Sessions',
      platform: 'Zoom',
      status: 'active'
    }
  ];

  // Profile data
  const profileData = {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@example.com',
    subjects: ['Mathematics', 'Physics'],
    experience: '10 years',
    rating: 4.8,
    totalStudents: 50
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar Navigation */}
        <div className="col-md-3 col-lg-2">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-3">
              <div className="text-center mb-4">
                <img
                  src="/api/placeholder/150/150"
                  alt="Profile"
                  className="rounded-circle mb-3"
                  style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                />
                <h5 className="mb-1">{profileData.name}</h5>
                <p className="text-muted small mb-0">Mathematics & Physics Teacher</p>
              </div>
              <nav className="nav flex-column">
                <button
                  className={`nav-link text-start mb-2 ${activeSection === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveSection('overview')}
                >
                  <i className="bi bi-speedometer2 me-2"></i> Overview
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeSection === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveSection('requests')}
                >
                  <i className="bi bi-person-plus me-2"></i> Student Requests
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeSection === 'classes' ? 'active' : ''}`}
                  onClick={() => setActiveSection('classes')}
                >
                  <i className="bi bi-book me-2"></i> Classes
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeSection === 'locations' ? 'active' : ''}`}
                  onClick={() => setActiveSection('locations')}
                >
                  <i className="bi bi-geo-alt me-2"></i> Locations
                </button>
                <button
                  className={`nav-link text-start mb-2 ${activeSection === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveSection('profile')}
                >
                  <i className="bi bi-person me-2"></i> Profile
                </button>
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="col-md-9 col-lg-10">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="row g-4">
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Total Students</h6>
                    <h3 className="mb-0">{profileData.totalStudents}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Active Classes</h6>
                    <h3 className="mb-0">{classes.length}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Rating</h6>
                    <h3 className="mb-0">{profileData.rating}/5.0</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-6 col-lg-3">
                <div className="card border-0 shadow-sm rounded-3">
                  <div className="card-body">
                    <h6 className="text-muted mb-2">Pending Requests</h6>
                    <h3 className="mb-0">{studentRequests.filter(r => r.status === 'pending').length}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Student Requests Section */}
          {activeSection === 'requests' && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body">
                <h5 className="card-title mb-4">Student Requests</h5>
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Student</th>
                        <th>Subject</th>
                        <th>Level</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentRequests.map(request => (
                        <tr key={request.id}>
                          <td>{request.studentName}</td>
                          <td>{request.subject}</td>
                          <td>{request.level}</td>
                          <td>{request.requestDate}</td>
                          <td>
                            <span className={`badge bg-${request.status === 'pending' ? 'warning' : 'success'}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            <button className="btn btn-sm btn-primary me-2">Accept</button>
                            <button className="btn btn-sm btn-outline-danger">Decline</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Classes Section */}
          {activeSection === 'classes' && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Classes</h5>
                  <button className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>Add New Class
                  </button>
                </div>
                <div className="row g-4">
                  {classes.map(classItem => (
                    <div key={classItem.id} className="col-md-6">
                      <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-body">
                          <h6 className="card-title">{classItem.subject}</h6>
                          <p className="text-muted mb-2">
                            <i className="bi bi-people me-2"></i>
                            {classItem.students} Students
                          </p>
                          <p className="text-muted mb-3">
                            <i className="bi bi-clock me-2"></i>
                            {classItem.schedule}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`badge bg-${classItem.status === 'active' ? 'success' : 'warning'}`}>
                              {classItem.status}
                            </span>
                            <button className="btn btn-sm btn-outline-primary">Manage</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Locations Section */}
          {activeSection === 'locations' && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h5 className="card-title mb-0">Teaching Locations</h5>
                  <button className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>Add Location
                  </button>
                </div>
                <div className="row g-4">
                  {locations.map(location => (
                    <div key={location.id} className="col-md-6">
                      <div className="card border-0 shadow-sm rounded-3">
                        <div className="card-body">
                          <h6 className="card-title">{location.name}</h6>
                          {location.address && (
                            <p className="text-muted mb-2">
                              <i className="bi bi-geo-alt me-2"></i>
                              {location.address}
                            </p>
                          )}
                          {location.platform && (
                            <p className="text-muted mb-2">
                              <i className="bi bi-laptop me-2"></i>
                              {location.platform}
                            </p>
                          )}
                          {location.capacity && (
                            <p className="text-muted mb-3">
                              <i className="bi bi-people me-2"></i>
                              Capacity: {location.capacity} students
                            </p>
                          )}
                          <div className="d-flex justify-content-between align-items-center">
                            <span className={`badge bg-${location.status === 'active' ? 'success' : 'warning'}`}>
                              {location.status}
                            </span>
                            <button className="btn btn-sm btn-outline-primary">Edit</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Profile Section */}
          {activeSection === 'profile' && (
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body">
                <h5 className="card-title mb-4">Profile Information</h5>
                <form>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={profileData.name}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        defaultValue={profileData.email}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Subjects</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={profileData.subjects.join(', ')}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Experience</label>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={profileData.experience}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Bio</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary">
                        Save Changes
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .nav-link {
          color: #4a5568;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
        }

        .nav-link:hover {
          background-color: rgba(37, 99, 235, 0.1);
          color: #2563eb;
        }

        .nav-link.active {
          background-color: #2563eb;
          color: white;
        }

        .card {
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .badge {
          padding: 0.5em 1em;
        }

        .btn-primary {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .btn-primary:hover {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }

        .btn-outline-primary {
          color: #2563eb;
          border-color: #2563eb;
        }

        .btn-outline-primary:hover {
          background-color: #2563eb;
          color: white;
        }

        .form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard; 