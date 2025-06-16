import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://localhost:3000/api';



const TeacherAuth = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
  name: '', 
  email: '',
  password: '',
  confirmPassword: '',
  phoneNumber: '',
  cityOrTown: '',
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

// Update handleLogin function
const handleLogin = async () => {
  if (!formData.email || !formData.password) {
    throw new Error('Please fill in all required fields');
  }

  const response = await axios.post(`${API_BASE_URL}/teachers/login`, {
    email: formData.email,
    password: formData.password
  });

  // Create user object for AuthContext
  const userData = {
    id: response.data.teacher.id,
    teacherId: response.data.teacher.id,
    name: response.data.teacher.name, // ✅ Now includes real name
    email: response.data.teacher.email,
    phoneNumber: response.data.teacher.phoneNumber,
    cityOrTown: response.data.teacher.cityOrTown,
    profilePhoto: response.data.teacher.profilePhoto,
    role: 'teacher'
  };

  await login(userData);
  return response.data;
};

// Update handleRegister function
const handleRegister = async () => {
  if (!formData.name || !formData.email || !formData.password) { // ✅ Add name validation
    throw new Error('Please fill in name, email and password');
  }

  if (formData.password !== formData.confirmPassword) {
    throw new Error('Passwords do not match');
  }

  if (formData.password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Create FormData for file upload
  const registerData = new FormData();
  registerData.append('name', formData.name); // ✅ Add name to form data
  registerData.append('email', formData.email);
  registerData.append('password', formData.password);
  
  if (formData.phoneNumber) {
    registerData.append('phoneNumber', formData.phoneNumber);
  }
  if (formData.cityOrTown) {
    registerData.append('cityOrTown', formData.cityOrTown);
  }
  if (formData.profilePhoto) {
    registerData.append('profilePhoto', formData.profilePhoto);
  }

  const response = await axios.post(`${API_BASE_URL}/teachers/register`, registerData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  const teacherResponse = await axios.get(`${API_BASE_URL}/teachers/${response.data.teacherId}`);
  const teacherData = teacherResponse.data;

  // Create user object for AuthContext
  const userData = {
    id: teacherData.id,
    teacherId: teacherData.id,
    name: teacherData.name, // ✅ Now includes real name
    email: teacherData.email,
    phoneNumber: teacherData.phoneNumber,
    cityOrTown: teacherData.cityOrTown,
    profilePhoto: teacherData.profilePhoto,
    role: 'teacher'
  };

  await login(userData);
  return response.data;
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await handleLogin();
      } else {
        await handleRegister();
      }

      // Navigate to teacher dashboard
      navigate('/dashboard/teacher');
      
    } catch (error) {
      console.error('Auth error:', error);
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
                <i className="bi bi-person-workspace display-4 text-primary mb-3"></i>
                <h2 className="fw-bold">
                  {isLogin ? 'Teacher Login' : 'Teacher Registration'}
                </h2>
                <p className="text-muted">
                  {isLogin 
                    ? 'Welcome back! Please login to your account.'
                    : 'Create your teacher account to start offering lessons'}
                </p>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">
                    Email Address <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-envelope"></i>
                    </span>
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
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password <span className="text-danger">*</span>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={isLogin ? "Enter your password" : "Create a password (min 6 characters)"}
                      required
                    />
                  </div>
                </div>

                {!isLogin && (
                  <>
                    <div className="mb-3">
      <label htmlFor="name" className="form-label">
        Full Name <span className="text-danger">*</span>
      </label>
      <div className="input-group">
        <span className="input-group-text">
          <i className="bi bi-person"></i>
        </span>
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
    </div>

                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Confirm Password <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type="password"
                          className="form-control"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="phoneNumber" className="form-label">
                        Phone Number <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-telephone"></i>
                        </span>
                        <input
                          type="tel"
                          className="form-control"
                          id="phoneNumber"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="Enter your phone number"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="cityOrTown" className="form-label">
                        City or Town <span className="text-danger">*</span>
                        </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-geo-alt"></i>
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          id="cityOrTown"
                          name="cityOrTown"
                          value={formData.cityOrTown}
                          onChange={handleChange}
                          placeholder="Enter your city or town"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="profilePhoto" className="form-label">
                        Profile Photo <span className="text-danger">*</span>
                        </label>
                      <input
                        type="file"
                        className="form-control"
                        id="profilePhoto"
                        name="profilePhoto"
                        onChange={handleChange}
                        accept="image/*"
                        required
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Optional: Upload a profile picture (Max 5MB, JPG, PNG, GIF)
                      </div>
                    </div>
                  </>
                )}

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
                    onClick={() => navigate(isLogin ? '/register/teacher' : '/login/teacher')}
                  >
                    {isLogin ? 'Register here' : 'Login here'}
                  </button>
                </p>
              </div>

              {/* Info Section */}
              <div className="mt-4">
                <div className="alert alert-info" role="alert">
                  <div className="d-flex">
                    <i className="bi bi-lightbulb flex-shrink-0 me-2"></i>
                    <div>
                      <h6 className="alert-heading mb-1">For Teachers</h6>
                      <small>
                        {isLogin 
                          ? 'Login to access your teacher dashboard and manage your tutoring services.'
                          : 'Join our platform to offer tutoring services and connect with students looking for help.'
                        }
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          border: none;
          border-radius: 15px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .input-group-text {
          background-color: #f8f9fa;
          border-color: #dee2e6;
          color: #6c757d;
        }

        .form-control {
          border-radius: 0 8px 8px 0;
          padding: 12px 15px;
          border-left: none;
        }

        .input-group-text {
          border-radius: 8px 0 0 8px;
        }

        .form-control:focus {
          box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
          border-color: #86b7fe;
        }

        .input-group:focus-within .input-group-text {
          border-color: #86b7fe;
          background-color: #e7f1ff;
          color: #0d6efd;
        }

        .btn-primary {
          border-radius: 8px;
          padding: 12px 20px;
          font-weight: 500;
          background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
          border: none;
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 5px 15px rgba(13, 110, 253, 0.3);
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
          border-radius: 10px;
          border: none;
        }

        .alert-info {
          background-color: #f8f9ff;
          color: #6f42c1;
          border-left: 4px solid #6f42c1;
        }

        .alert-danger {
          background-color: #fff5f5;
          color: #dc3545;
          border-left: 4px solid #dc3545;
        }

        .form-text {
          font-size: 0.875rem;
          color: #6c757d;
        }

        .text-danger {
          color: #dc3545 !important;
        }

        .display-4 {
          font-size: 2.5rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 15px;
          }
          
          .card-body {
            padding: 2rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherAuth;