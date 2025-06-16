import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://localhost:3000/api';

const StudentPosts = () => {
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [formData, setFormData] = useState({
    lessonType: '',
    subject: '',
    headline: '',
    description: '',
    townOrCity: ''
  });
  const [allPosts, setAllPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedLessonType, setSelectedLessonType] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Subjects list
  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology',
    'English', 'History', 'Geography', 'Computer Science',
    'Economics', 'Business Studies', 'Art', 'Music',
    'French', 'Spanish', 'German', 'Psychology',
    'Philosophy', 'Statistics', 'Accounting'
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (!userData) {
      window.location.href = '/login/student';
      return;
    }
    setCurrentUser(userData);
    
    fetchAllPosts();
    
    // Only fetch user's posts if they are a student
    if (userData.role === 'student' && userData.studentId) {
      fetchMyPosts(userData.studentId);
    }
  }, []);




  const fetchAllPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/posts`);
      setAllPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyPosts = async (studentId) => {
    try {
      // Get posts with full student info for "My Posts" section
      const response = await axios.get(`${API_BASE_URL}/posts`);
      const userPosts = response.data.filter(post => post.studentId === studentId);
      setMyPosts(userPosts);
    } catch (error) {
      console.error('Error fetching my posts:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      lessonType: '',
      subject: '',
      headline: '',
      description: '',
      townOrCity: ''
    });
    setEditingPost(null);
  };

  const handleCreatePost = () => {
    resetForm();
    setShowPostForm(true);
  };

  const handleEditPost = (post) => {
    setFormData({
      lessonType: post.lessonType,
      subject: post.subject,
      headline: post.headline,
      description: post.description,
      townOrCity: post.townOrCity || ''
    });
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser?.studentId) {
      setError('Please log in to create a post');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const postData = {
        studentId: currentUser.studentId,
        lessonType: formData.lessonType,
        subject: formData.subject,
        headline: formData.headline,
        description: formData.description,
        townOrCity: formData.townOrCity
      };

      if (editingPost) {
        // Update existing post
        await axios.put(`${API_BASE_URL}/posts/${editingPost.id}`, postData);
      } else {
        // Create new post
        await axios.post(`${API_BASE_URL}/posts`, postData);
      }
      
      setShowPostForm(false);
      resetForm();
      
      // Refresh posts
      fetchAllPosts();
      fetchMyPosts(currentUser.studentId);
      
    } catch (error) {
      console.error('Error saving post:', error);
      setError(error.response?.data?.error || 'Failed to save post');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/posts/${postId}`);
      fetchAllPosts();
      fetchMyPosts(currentUser.studentId);
    } catch (error) {
      console.error('Error deleting post:', error);
      setError('Failed to delete post');
    }
  };

  const getFilteredPosts = () => {
    const posts = activeTab === 'all' ? allPosts : myPosts;
    
    return posts.filter(post => {
      const matchesSubject = !selectedSubject || post.subject === selectedSubject;
      const matchesLessonType = !selectedLessonType || post.lessonType === selectedLessonType;
      const matchesSearch = !searchQuery || 
        post.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.townOrCity?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesSubject && matchesLessonType && matchesSearch;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="student-posts-page">
      {/* Simple Header */}
      <section className="page-header">
        <div className="container">
          <div className="row justify-content-between align-items-center">
            <div className="col-md-8">
              <h2 className="page-title">
                {currentUser?.role === 'student' ? 'Tutoring Posts' : 'Student Tutoring Requests'}
              </h2>
              <p className="page-subtitle">
                {currentUser?.role === 'student' 
                  ? 'Browse tutoring opportunities or manage your posts'
                  : 'Browse student requests for tutoring services'
                }
              </p>
            </div>
            {currentUser?.role === 'student' && (
              <div className="col-md-4 text-end">
                <button 
                  className="btn btn-primary"
                  onClick={handleCreatePost}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Create Post
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="tabs-section">
        <div className="container">
          <div className="nav-tabs-container">
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button 
                  className={`nav-link ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  <i className="bi bi-grid me-2"></i>
                  {currentUser?.role === 'student' ? 'All Posts' : 'Student Requests'} ({allPosts.length})
                </button>
              </li>
              {currentUser?.role === 'student' && (
                <li className="nav-item">
                  <button 
                    className={`nav-link ${activeTab === 'my' ? 'active' : ''}`}
                    onClick={() => setActiveTab('my')}
                  >
                    <i className="bi bi-person me-2"></i>
                    My Posts ({myPosts.length})
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-card">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Filter by Subject</label>
                <select
                  className="form-select"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Filter by Lesson Type</label>
                <select
                  className="form-select"
                  value={selectedLessonType}
                  onChange={(e) => setSelectedLessonType(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="online">Online</option>
                  <option value="in-person">In-Person</option>
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Search</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {error && (
        <div className="container">
          <div className="alert alert-danger alert-dismissible fade show">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        </div>
      )}

      
      {showPostForm && (
        <div className="modal-backdrop" onClick={() => setShowPostForm(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h3>
                <button 
                  className="btn-close"
                  onClick={() => setShowPostForm(false)}
                ></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Lesson Type *</label>
                      <select
                        className="form-select"
                        value={formData.lessonType}
                        onChange={(e) => setFormData({...formData, lessonType: e.target.value})}
                        required
                      >
                        <option value="">Select lesson type</option>
                        <option value="online">Online</option>
                        <option value="in-person">In-Person</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Subject *</label>
                      <select
                        className="form-select"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        required
                      >
                        <option value="">Select a Subject</option>
                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Headline *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.headline}
                        onChange={(e) => setFormData({...formData, headline: e.target.value})}
                        placeholder="e.g., Expert Math Tutoring Available"
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label">Description *</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe your tutoring experience and what you offer..."
                        required
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <label className="form-label">Town or City</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.townOrCity}
                        onChange={(e) => setFormData({...formData, townOrCity: e.target.value})}
                        placeholder="e.g., Colombo, Kandy"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPostForm(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {editingPost ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className={`bi ${editingPost ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>
                        {editingPost ? 'Update Post' : 'Create Post'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      
      <section className="posts-section">
        <div className="container">
          {loading && !showPostForm ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary"></div>
              <p className="mt-2">Loading posts...</p>
            </div>
          ) : (
            <div className="posts-list">
              {getFilteredPosts().length === 0 ? (
                <div className="no-posts-card">
                  <div className="text-center py-5">
                    <i className="bi bi-inbox display-1 text-muted mb-3"></i>
                    <h4 className="text-muted">No posts found</h4>
                    <p className="text-muted">
                      {activeTab === 'my' 
                        ? "You haven't created any posts yet. Click 'Create Post' to get started!"
                        : "No posts match your current filters."
                      }
                    </p>
                  </div>
                </div>
              ) : (
                getFilteredPosts().map((post) => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="student-info">
                        {post.profilePhoto && (
                          <img 
                            src={`http://localhost:3000${post.profilePhoto}`} 
                            alt={post.studentName} 
                            className="profile-avatar"
                          />
                        )}
                        <div className="student-details">
                          <h6 className="student-name">{post.studentName || 'Anonymous'}</h6>
                          <small className="post-date">{formatDate(post.createdAt)}</small>
                        </div>
                      </div>
                      
                      <div className="post-meta">
                        <div className="post-badges">
                          <span className={`lesson-type-badge ${post.lessonType}`}>
                            <i className={`bi ${post.lessonType === 'online' ? 'bi-laptop' : 'bi-geo-alt'} me-1`}></i>
                            {post.lessonType === 'online' ? 'Online' : 'In-Person'}
                          </span>
                          <span className="subject-badge">{post.subject}</span>
                        </div>
                        
                        {currentUser?.role === 'student' && activeTab === 'my' && (
                          <div className="post-actions">
                            <button 
                              className="btn btn-outline-primary btn-sm"
                              onClick={() => handleEditPost(post)}
                              title="Edit post"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => handleDeletePost(post.id)}
                              title="Delete post"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="post-content">
                      <h5 className="post-headline">{post.headline}</h5>
                      <p className="post-description">{post.description}</p>
                      
                      <div className="post-details">
                        {post.townOrCity && (
                          <span><i className="bi bi-geo-alt"></i> {post.townOrCity}</span>
                        )}
                        {/* {post.email && (
                          <span><i className="bi bi-envelope"></i> {post.email}</span>
                        )}
                        {post.phoneNumber && (
                          <span><i className="bi bi-telephone"></i> {post.phoneNumber}</span>
                        )} */}
                      </div>
                    </div>
                    
                    {activeTab === 'all' && post.studentId !== currentUser?.studentId && (
                      <div className="post-footer">
                        <button className="btn btn-primary btn-sm">
                          <i className="bi bi-chat-dots me-1"></i>
                          Contact Tutor
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .student-posts-page {
          padding-top: 80px;
        }

        .page-header {
          padding: 2rem 0;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 600;
          color: #212529;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          color: #6c757d;
          margin-bottom: 0;
        }

        .tabs-section {
          padding: 1rem 0;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .nav-tabs-container {
          background: #f8f9fa;
          border-radius: 0.5rem;
          padding: 0.25rem;
        }

        .nav-tabs {
          border: none;
        }

       

        .search-section {
          padding: 1.5rem 0;
          background: white;
        }

        .search-card {
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 0.75rem;
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1050;
        }

        .modal-dialog {
          background: white;
          border-radius: 0.75rem;
          max-width: 600px;
          width: 90%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .posts-section {
          padding: 1.5rem 0 4rem;
          background: #f8f9fa;
        }

        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .post-card, .no-posts-card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .post-card:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .student-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .profile-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #e2e8f0;
        }

        .student-name {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .post-date {
          color: #64748b;
          font-size: 0.875rem;
        }

        .post-meta {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .post-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .lesson-type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .lesson-type-badge.online {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .lesson-type-badge.in-person {
          background: #dcfce7;
          color: #16a34a;
        }

        .subject-badge {
          background: #f3e8ff;
          color: #7c3aed;
          padding: 0.25rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .post-actions {
          display: flex;
          gap: 0.5rem;
        }

        .post-actions .btn {
          width: 36px;
          height: 36px;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.375rem;
        }

        .post-content {
          margin-bottom: 1rem;
        }

        .post-headline {
          font-size: 1.125rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .post-description {
          color: #475569;
          font-size: 0.875rem;
          margin-bottom: 1rem;
          line-height: 1.5;
        }

        .post-details {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #64748b;
          flex-wrap: wrap;
        }

        .post-details i {
          color: #2563eb;
          margin-right: 0.25rem;
        }

        .post-footer {
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: flex-end;
        }

        .form-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 0.5rem;
          display: block;
        }

        .form-control,
        .form-select {
          padding: 0.75rem 1rem;
          border-radius: 0.375rem;
          border: 1px solid #d1d5db;
          transition: all 0.3s ease;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          outline: none;
        }

        @media (max-width: 768px) {
          .page-header .row {
            flex-direction: column;
            gap: 1rem;
          }

          .page-header .text-end {
            text-align: start !important;
          }

          .post-header {
            flex-direction: column;
            gap: 1rem;
          }

          .post-meta {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .post-actions {
            align-self: flex-end;
          }

          .post-details {
            flex-direction: column;
            gap: 0.5rem;
          }

          .modal-dialog {
            margin: 1rem;
            width: calc(100% - 2rem);
          }
        }
      `}</style>
    </div>
  );
};

export default StudentPosts;