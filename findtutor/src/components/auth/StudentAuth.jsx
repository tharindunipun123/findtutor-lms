import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://localhost:3000/api';

const StudentAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phoneNumber: '',
    location: '',
    country: '',
    profilePhoto: null
  });

  useEffect(() => {
    // Check if we're on the login or register route
    setIsLogin(location.pathname.includes('/login'));
  }, [location]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleLogin = async () => {
    if (!formData.email) {
      throw new Error('Please enter your email address');
    }

    // Get all students and find by email (since we don't have login endpoint)
    const response = await axios.get(`${API_BASE_URL}/students`);
    const student = response.data.find(s => s.email.toLowerCase() === formData.email.toLowerCase());
    
    if (!student) {
      throw new Error('No account found with this email address');
    }

    // Store student data in localStorage
    const userData = {
      studentId: student.id,
      name: student.name,
      email: student.email,
      phoneNumber: student.phoneNumber,
      location: student.location,
      country: student.country,
      profilePhoto: student.profilePhoto,
      role: 'student'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('studentId', student.id.toString());
    
    return userData;
  };

  const handleRegister = async () => {
    if (!formData.email || !formData.name || !formData.country) {
      throw new Error('Please fill in all required fields (Name, Email, Country)');
    }

    // Create FormData for file upload
    const registerData = new FormData();
    registerData.append('name', formData.name);
    registerData.append('email', formData.email);
    registerData.append('country', formData.country);
    
    if (formData.phoneNumber) {
      registerData.append('phoneNumber', formData.phoneNumber);
    }
    if (formData.location) {
      registerData.append('location', formData.location);
    }
    if (formData.profilePhoto) {
      registerData.append('profilePhoto', formData.profilePhoto);
    }

    const response = await axios.post(`${API_BASE_URL}/students/register`, registerData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Get the full student data
    const studentResponse = await axios.get(`${API_BASE_URL}/students/${response.data.studentId}`);
    const studentData = studentResponse.data;

    // Store student data in localStorage
    const userData = {
      studentId: studentData.id,
      name: studentData.name,
      email: studentData.email,
      phoneNumber: studentData.phoneNumber,
      location: studentData.location,
      country: studentData.country,
      profilePhoto: studentData.profilePhoto,
      role: 'student'
    };
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('studentId', studentData.id.toString());
    
    return userData;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let userData;
      
      if (isLogin) {
        userData = await handleLogin();
      } else {
        userData = await handleRegister();
      }

      // Navigate to dashboard
      navigate('/dashboard/student');
      
    } catch (error) {
      setError(error.response?.data?.error || error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">
                  {isLogin ? 'Student Login' : 'Student Registration'}
                </h2>
                <p className="text-muted">
                  {isLogin 
                    ? 'Welcome back! Enter your email to access your account.'
                    : 'Create your student account to start tutoring'}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phoneNumber" className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="location" className="form-label">Location/City</label>
                      <input
                        type="text"
                        className="form-control"
                        id="location"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="Enter your city or location"
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="country" className="form-label">
                        Country <span className="text-danger">*</span>
                      </label>
                      <select
                        className="form-select"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select your country</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="Canada">Canada</option>
                        <option value="Australia">Australia</option>
                        <option value="Germany">Germany</option>
                        <option value="France">France</option>
                        <option value="Spain">Spain</option>
                        <option value="Italy">Italy</option>
                        <option value="Netherlands">Netherlands</option>
                        <option value="India">India</option>
                        <option value="Singapore">Singapore</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="profilePhoto" className="form-label">Profile Photo</label>
                      <input
                        type="file"
                        className="form-control"
                        id="profilePhoto"
                        name="profilePhoto"
                        onChange={handleChange}
                        accept="image/*"
                      />
                      <div className="form-text">Optional: Upload a profile picture (Max 5MB)</div>
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email address <span className="text-danger">*</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      {isLogin ? 'Logging in...' : 'Creating account...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${isLogin ? 'bi-box-arrow-in-right' : 'bi-person-plus'} me-2`}></i>
                      {isLogin ? 'Login' : 'Create Account'}
                    </>
                  )}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="mb-0">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    className="btn btn-link p-0"
                    onClick={() => navigate(isLogin ? '/register/student' : '/login/student')}
                  >
                    {isLogin ? 'Register here' : 'Login here'}
                  </button>
                </p>
              </div>

              {/* Info Alert */}
              <div className="alert alert-info mt-3" role="alert">
                <i className="bi bi-info-circle-fill me-2"></i>
                <small>
                  {isLogin 
                    ? 'Simply enter your registered email address to access your account.'
                    : 'Fill in your details to create a tutor profile and start offering lessons.'}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: none;
          border-radius: 15px;
        }

        .form-control, .form-select {
          border-radius: 8px;
          padding: 10px 15px;
          border: 1px solid #dee2e6;
        }

        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
          border-color: #86b7fe;
        }

        .btn-primary {
          border-radius: 8px;
          padding: 12px 20px;
          font-weight: 500;
          background-color: #0d6efd;
          border-color: #0d6efd;
        }

        .btn-primary:hover {
          background-color: #0b5ed7;
          border-color: #0a58ca;
        }

        .btn-link {
          color: #0d6efd;
          text-decoration: none;
          font-weight: 500;
        }

        .btn-link:hover {
          text-decoration: underline;
          color: #0b5ed7;
        }

        .alert {
          border-radius: 8px;
        }

        .form-text {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .text-danger {
          color: #dc3545 !important;
        }
      `}</style>
    </div>
  );
};

export default StudentAuth;