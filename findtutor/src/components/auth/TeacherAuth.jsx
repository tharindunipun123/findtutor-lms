import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const TeacherAuth = ({ isLogin }) => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    subjects: '',
    experience: '',
    qualifications: '',
    hourlyRate: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      if (isLogin) {
        await login(formData.email, formData.password, 'teacher');
      } else {
        await signup(formData.email, formData.password, formData, 'teacher');
      }
      navigate('/dashboard/teacher');
    } catch (err) {
      setError(err.message || 'An error occurred');
    }
  };

  return (
    <div className="container py-5" style={{ marginTop: '80px' }}>
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card border-0 shadow-sm rounded-3">
            <div className="card-body p-4">
              <h2 className="text-center mb-4">
                {isLogin ? 'Teacher Login' : 'Teacher Sign Up'}
              </h2>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {!isLogin && (
                  <>
                    <div className="mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Subjects You Teach</label>
                      <input
                        type="text"
                        className="form-control"
                        name="subjects"
                        value={formData.subjects}
                        onChange={handleChange}
                        placeholder="e.g., Mathematics, Physics"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Years of Experience</label>
                      <input
                        type="number"
                        className="form-control"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Qualifications</label>
                      <textarea
                        className="form-control"
                        name="qualifications"
                        value={formData.qualifications}
                        onChange={handleChange}
                        rows="3"
                        placeholder="List your degrees, certifications, etc."
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Hourly Rate (USD)</label>
                      <input
                        type="number"
                        className="form-control"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </>
                )}

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                {!isLogin && (
                  <div className="mb-3">
                    <label className="form-label">Confirm Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}

                <button type="submit" className="btn btn-primary w-100 mb-3">
                  {isLogin ? 'Login' : 'Sign Up'}
                </button>

                <div className="text-center">
                  <p className="mb-0">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <Link
                      to={isLogin ? '/register/teacher' : '/login/teacher'}
                      className="text-primary text-decoration-none"
                    >
                      {isLogin ? 'Sign Up' : 'Login'}
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .card {
          transition: transform 0.3s ease;
        }

        .card:hover {
          transform: translateY(-5px);
        }

        .form-control:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
        }

        .btn-primary {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .btn-primary:hover {
          background-color: #1d4ed8;
          border-color: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default TeacherAuth; 