import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://localhost:3000';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Google Maps state
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const locationInputRef = useRef(null);
  const locationAutocompleteRef = useRef(null);
  const profileLocationInputRef = useRef(null);
  const profileLocationAutocompleteRef = useRef(null);

  // Post form state
  const [postForm, setPostForm] = useState({
    headline: '',
    subject: '',
    location: '',
    description: '',
    lessonType: 'in-person',
    distanceFromLocation: 5,
    townOrDistrict: '',
    price: '',
    priceType: 'hourly'
  });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    cityOrTown: user?.cityOrTown || '',
    profilePhoto: null
  });

  // Load Google Maps API
  useEffect(() => {
    const loadGoogleMapsAPI = () => {
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true);
        return;
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBRVAGSgYeCWuZW_Lhy5V_bdr_0Tv1Q5ys&libraries=places`;
      script.async = true;
      
      script.onload = () => {
        setTimeout(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsGoogleMapsLoaded(true);
          }
        }, 100);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMapsAPI();
  }, []);

  // Initialize autocomplete for post location
  useEffect(() => {
    if (isGoogleMapsLoaded && locationInputRef.current && !locationAutocompleteRef.current && showPostModal) {
      const initTimer = setTimeout(() => {
        if (locationInputRef.current && window.google?.maps?.places?.Autocomplete) {
          try {
            locationAutocompleteRef.current = new window.google.maps.places.Autocomplete(
              locationInputRef.current,
              {
                types: ['(cities)'],
                fields: ['name', 'formatted_address', 'address_components']
              }
            );

            locationAutocompleteRef.current.addListener('place_changed', () => {
              const place = locationAutocompleteRef.current.getPlace();
              if (place && (place.name || place.formatted_address)) {
                let cityName = place.name || place.formatted_address;
                
                if (place.address_components) {
                  const cityComponent = place.address_components.find(
                    component => 
                      component.types.includes('locality') || 
                      component.types.includes('administrative_area_level_2')
                  );
                  if (cityComponent) {
                    cityName = cityComponent.long_name;
                  }
                }

                setPostForm(prev => ({
                  ...prev,
                  location: cityName
                }));
              }
            });
          } catch (error) {
            console.error('Error creating post location autocomplete:', error);
          }
        }
      }, 500);

      return () => clearTimeout(initTimer);
    }

    return () => {
      if (locationAutocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(locationAutocompleteRef.current);
          locationAutocompleteRef.current = null;
        } catch (error) {
          console.error('Error cleaning up location autocomplete:', error);
        }
      }
    };
  }, [isGoogleMapsLoaded, showPostModal]);

  // Initialize autocomplete for profile location
  useEffect(() => {
    if (isGoogleMapsLoaded && profileLocationInputRef.current && !profileLocationAutocompleteRef.current && showProfileModal) {
      const initTimer = setTimeout(() => {
        if (profileLocationInputRef.current && window.google?.maps?.places?.Autocomplete) {
          try {
            profileLocationAutocompleteRef.current = new window.google.maps.places.Autocomplete(
              profileLocationInputRef.current,
              {
                types: ['(cities)'],
                fields: ['name', 'formatted_address', 'address_components']
              }
            );

            profileLocationAutocompleteRef.current.addListener('place_changed', () => {
              const place = profileLocationAutocompleteRef.current.getPlace();
              if (place && (place.name || place.formatted_address)) {
                let cityName = place.name || place.formatted_address;
                
                if (place.address_components) {
                  const cityComponent = place.address_components.find(
                    component => 
                      component.types.includes('locality') || 
                      component.types.includes('administrative_area_level_2')
                  );
                  if (cityComponent) {
                    cityName = cityComponent.long_name;
                  }
                }

                setProfileForm(prev => ({
                  ...prev,
                  cityOrTown: cityName
                }));
              }
            });
          } catch (error) {
            console.error('Error creating profile location autocomplete:', error);
          }
        }
      }, 500);

      return () => clearTimeout(initTimer);
    }

    return () => {
      if (profileLocationAutocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(profileLocationAutocompleteRef.current);
          profileLocationAutocompleteRef.current = null;
        } catch (error) {
          console.error('Error cleaning up profile location autocomplete:', error);
        }
      }
    };
  }, [isGoogleMapsLoaded, showProfileModal]);

  // Load teacher posts
  useEffect(() => {
    const teacherId = user?.teacherId || user?.id;
    console.log('User object:', user); // Debug log
    console.log('Teacher ID for posts:', teacherId); // Debug log
    
    if (teacherId) {
      fetchPosts();
    } else {
      console.error('No teacher ID found in user object');
      setError('Teacher ID not found. Please check your login.');
    }
  }, [user]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll('.dropdown-menu');
      dropdowns.forEach(dropdown => {
        if (!dropdown.closest('.position-relative').contains(event.target)) {
          dropdown.style.display = 'none';
        }
      });
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get the correct teacher ID
      const teacherId = user?.teacherId || user?.id;
      
      if (!teacherId) {
        setError('Teacher ID not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      console.log('Fetching posts for teacher ID:', teacherId); // Debug log
      
      // Try the main route first
      try {
        const response = await axios.get(`${API_BASE_URL}/post/teachers/${teacherId}/posts`);
        console.log('Posts fetched successfully:', response.data); // Debug log
        setPosts(response.data);
        return;
      } catch (mainError) {
        console.error('Main route failed:', mainError);
        
        // Try fallback route if main route fails
        try {
          const fallbackResponse = await axios.get(`${API_BASE_URL}/post/teachers/${teacherId}/posts-simple`);
          console.log('Fallback posts fetched:', fallbackResponse.data); // Debug log
          setPosts(fallbackResponse.data);
          return;
        } catch (fallbackError) {
          console.error('Fallback route failed:', fallbackError);
          throw fallbackError;
        }
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError(`Failed to load posts: ${error.response?.data?.error || error.message}`);
      setPosts([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const postData = {
        ...postForm,
        teacherId: user.teacherId || user.id, // Use teacherId or fallback to user.id
        price: parseFloat(postForm.price)
      };

      let response;
      if (editingPost) {
        // Update existing post
        response = await axios.put(`${API_BASE_URL}/post/teachers/posts/${editingPost.id}`, postData);
        setSuccess('Post updated successfully!');
      } else {
        // Create new post
        response = await axios.post(`${API_BASE_URL}/post/teachers/posts`, postData);
        setSuccess('Post created successfully!');
      }

      setShowPostModal(false);
      resetPostForm();
      fetchPosts();
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error saving post:', error);
      setError(error.response?.data?.error || 'Failed to save post');
      
      // Hide error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      setLoading(true);
      await axios.delete(`${API_BASE_URL}/post/teachers/posts/${postId}`);
      setSuccess('Post deleted successfully!');
      fetchPosts();
    } catch (error) {
      setError('Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  const handleEditPost = (post) => {
    console.log('Editing post:', post); // Debug log
    setEditingPost(post);
    setPostForm({
      headline: post.headline || '',
      subject: post.subject || '',
      location: post.location || '',
      description: post.description || '',
      lessonType: post.lessonType || 'in-person',
      distanceFromLocation: post.distanceFromLocation || 5,
      townOrDistrict: post.townOrDistrict || '',
      price: post.price ? post.price.toString() : '',
      priceType: post.priceType || 'hourly'
    });
    setShowPostModal(true);
  };

  const resetPostForm = () => {
    setPostForm({
      headline: '',
      subject: '',
      location: '',
      description: '',
      lessonType: 'in-person',
      distanceFromLocation: 5,
      townOrDistrict: '',
      price: '',
      priceType: 'hourly'
    });
    setEditingPost(null);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('name', profileForm.name);
      formData.append('email', profileForm.email);
      formData.append('phoneNumber', profileForm.phoneNumber);
      formData.append('cityOrTown', profileForm.cityOrTown);
      
      if (profileForm.profilePhoto) {
        formData.append('profilePhoto', profileForm.profilePhoto);
      }

      const response = await axios.put(`${API_BASE_URL}/api/teachers/${user.teacherId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Update local user data
      const updatedUserData = {
        ...user,
        name: profileForm.name,
        email: profileForm.email,
        phoneNumber: profileForm.phoneNumber,
        cityOrTown: profileForm.cityOrTown,
        profilePhoto: response.data.profilePhoto || user.profilePhoto
      };

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // If you have a context update function, use it here
      // updateUser(updatedUserData);

      setSuccess('Profile updated successfully!');
      setShowProfileModal(false);
      
      // Force page refresh to show updated data
      window.location.reload();
      
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

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
                  {user?.profilePhoto ? (
                    <img 
                      src={`${API_BASE_URL}${user.profilePhoto}`} 
                      alt="Profile" 
                      className="rounded-circle w-100 h-100" 
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <i className="bi bi-person-fill fs-1"></i>
                  )}
                </div>
                <h5 className="mb-1">{user?.name || 'Teacher Name'}</h5>
                <p className="text-muted mb-0 small">{user?.email}</p>
                <p className="text-muted mb-0 small">{user?.cityOrTown}</p>
              </div>

              <div className="list-group">
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'posts' ? 'active' : ''}`}
                  onClick={() => setActiveTab('posts')}
                >
                  <i className="bi bi-book me-2"></i>
                  My Posts
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'requests' ? 'active' : ''}`}
                  onClick={() => setActiveTab('requests')}
                >
                  <i className="bi bi-envelope me-2"></i>
                  Requests
                </button>
                <button
                  className={`list-group-item list-group-item-action ${activeTab === 'profile' ? 'active' : ''}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <i className="bi bi-person me-2"></i>
                  Profile
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
          {error && (
            <div className="alert alert-danger alert-dismissible fade show">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
              <button type="button" className="btn-close" onClick={() => setError('')}></button>
            </div>
          )}
          
          {success && (
            <div className="alert alert-success alert-dismissible fade show">
              <i className="bi bi-check-circle-fill me-2"></i>
              {success}
              <button type="button" className="btn-close" onClick={() => setSuccess('')}></button>
            </div>
          )}

          <div className="card border-0 shadow-sm">
            <div className="card-body">
              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">
                      <i className="bi bi-book me-2"></i>
                      My Teaching Posts
                    </h4>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        resetPostForm();
                        setShowPostModal(true);
                      }}
                    >
                      <i className="bi bi-plus-lg me-2"></i>
                      Create New Post
                    </button>
                  </div>

                  {loading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary"></div>
                      <p className="mt-2">Loading posts...</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-book display-1 text-muted"></i>
                      <h5 className="mt-3">No Posts Yet</h5>
                      <p className="text-muted">Create your first teaching post to start attracting students!</p>
                      <button 
                        className="btn btn-primary"
                        onClick={() => {
                          resetPostForm();
                          setShowPostModal(true);
                        }}
                      >
                        <i className="bi bi-plus-lg me-2"></i>
                        Create First Post
                      </button>
                    </div>
                  ) : (
                    <div className="row">
                      {posts.map(post => (
                        <div key={post.id} className="col-md-6 col-lg-4 mb-4">
                          <div className="card h-100 border-0 shadow-sm">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <span className={`badge ${post.lessonType === 'online' ? 'bg-success' : post.lessonType === 'in-person' ? 'bg-primary' : 'bg-info'}`}>
                                  {post.lessonType === 'online' ? 'Online' : post.lessonType === 'in-person' ? 'In-Person' : 'Both'}
                                </span>
                                <div className="position-relative">
                                  <button 
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const dropdown = e.target.closest('.position-relative').querySelector('.dropdown-menu');
                                      const allDropdowns = document.querySelectorAll('.dropdown-menu');
                                      
                                      // Close all other dropdowns
                                      allDropdowns.forEach(d => {
                                        if (d !== dropdown) {
                                          d.style.display = 'none';
                                        }
                                      });
                                      
                                      // Toggle current dropdown
                                      if (dropdown.style.display === 'block') {
                                        dropdown.style.display = 'none';
                                      } else {
                                        dropdown.style.display = 'block';
                                      }
                                    }}
                                  >
                                    <i className="bi bi-three-dots-vertical"></i>
                                  </button>
                                  <div 
                                    className="dropdown-menu position-absolute end-0" 
                                    style={{ 
                                      display: 'none',
                                      top: '100%',
                                      zIndex: 1000,
                                      minWidth: '120px',
                                      boxShadow: '0 0.5rem 1rem rgba(0, 0, 0, 0.15)',
                                      border: '1px solid rgba(0,0,0,.125)',
                                      borderRadius: '0.375rem'
                                    }}
                                  >
                                    <button 
                                      className="dropdown-item d-flex align-items-center" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditPost(post);
                                        // Hide dropdown
                                        e.target.closest('.dropdown-menu').style.display = 'none';
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '0.375rem 1rem',
                                        width: '100%',
                                        textAlign: 'left',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      <i className="bi bi-pencil me-2 text-primary"></i>
                                      Edit Post
                                    </button>
                                    <button 
                                      className="dropdown-item d-flex align-items-center text-danger" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeletePost(post.id);
                                        // Hide dropdown
                                        e.target.closest('.dropdown-menu').style.display = 'none';
                                      }}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '0.375rem 1rem',
                                        width: '100%',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        color: '#dc3545'
                                      }}
                                    >
                                      <i className="bi bi-trash me-2"></i>
                                      Delete Post
                                    </button>
                                  </div>
                                </div>
                              </div>
                              
                              <h6 className="card-title">{post.headline}</h6>
                              <p className="text-muted small mb-2">
                                <i className="bi bi-book me-1"></i>
                                {post.subject}
                              </p>
                              
                              {post.location && (
                                <p className="text-muted small mb-2">
                                  <i className="bi bi-geo-alt me-1"></i>
                                  {post.location}
                                  {post.distanceFromLocation && (
                                    <span className="ms-1">({post.distanceFromLocation}km radius)</span>
                                  )}
                                </p>
                              )}
                              
                              <p className="card-text small">{post.description?.substring(0, 100)}{post.description?.length > 100 ? '...' : ''}</p>
                              
                              <div className="d-flex justify-content-between align-items-center mt-3">
                                <span className="h6 mb-0 text-success">
                                  ${post.price}/{post.priceType}
                                </span>
                                <small className="text-muted">
                                  {new Date(post.createdAt).toLocaleDateString()}
                                </small>
                              </div>
                              
                              {post.averageRating && (
                                <div className="mt-2">
                                  <span className="badge bg-warning">
                                    <i className="bi bi-star-fill me-1"></i>
                                    {post.averageRating} ({post.totalReviews} reviews)
                                  </span>
                                </div>
                              )}

                              {/* Action buttons - Alternative to dropdown */}
                              <div className="mt-3 d-flex gap-2">
                                <button 
                                  className="btn btn-sm btn-outline-primary flex-fill"
                                  onClick={() => handleEditPost(post)}
                                >
                                  <i className="bi bi-pencil me-1"></i>
                                  Edit
                                </button>
                                <button 
                                  className="btn btn-sm btn-outline-danger flex-fill"
                                  onClick={() => handleDeletePost(post.id)}
                                >
                                  <i className="bi bi-trash me-1"></i>
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">
                      <i className="bi bi-person me-2"></i>
                      Profile Information
                    </h4>
                    <button
                      className="btn btn-primary"
                      onClick={() => {
                        setProfileForm({
                          name: user?.name || '',
                          email: user?.email || '',
                          phoneNumber: user?.phoneNumber || '',
                          cityOrTown: user?.cityOrTown || '',
                          profilePhoto: null
                        });
                        setShowProfileModal(true);
                      }}
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Edit Profile
                    </button>
                  </div>

                  <div className="row">
                    <div className="col-md-4 text-center mb-4">
                      <div className="position-relative d-inline-block">
                        <div className="avatar-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '150px', height: '150px' }}>
                          {user?.profilePhoto ? (
                            <img 
                              src={`${API_BASE_URL}${user.profilePhoto}`} 
                              alt="Profile" 
                              className="rounded-circle w-100 h-100" 
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <i className="bi bi-person-fill" style={{ fontSize: '4rem' }}></i>
                          )}
                        </div>
                        <button 
                          className="btn btn-sm btn-primary rounded-circle position-absolute"
                          style={{ bottom: '20px', right: '10px', width: '40px', height: '40px' }}
                          onClick={() => {
                            setProfileForm({
                              name: user?.name || '',
                              email: user?.email || '',
                              phoneNumber: user?.phoneNumber || '',
                              cityOrTown: user?.cityOrTown || '',
                              profilePhoto: null
                            });
                            setShowProfileModal(true);
                          }}
                        >
                          <i className="bi bi-camera"></i>
                        </button>
                      </div>
                      <h5>{user?.name || 'Teacher Name'}</h5>
                      <p className="text-muted">{user?.email}</p>
                      <div className="mt-3">
                        <span className="badge bg-success me-2">
                          <i className="bi bi-check-circle me-1"></i>
                          Verified Teacher
                        </span>
                        <span className="badge bg-info">
                          <i className="bi bi-calendar me-1"></i>
                          Member since {user?.createdAt ? new Date(user.createdAt).getFullYear() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="col-md-8">
                      <div className="card border-0 bg-light">
                        <div className="card-body">
                          <h6 className="card-title mb-3">
                            <i className="bi bi-info-circle me-2"></i>
                            Contact Information
                          </h6>
                          <div className="row">
                            <div className="col-sm-6 mb-3">
                              <label className="form-label fw-bold text-muted small">FULL NAME</label>
                              <p className="mb-0 h6">{user?.name || 'Not provided'}</p>
                            </div>
                            <div className="col-sm-6 mb-3">
                              <label className="form-label fw-bold text-muted small">EMAIL ADDRESS</label>
                              <p className="mb-0">{user?.email || 'Not provided'}</p>
                            </div>
                            <div className="col-sm-6 mb-3">
                              <label className="form-label fw-bold text-muted small">PHONE NUMBER</label>
                              <p className="mb-0">
                                {user?.phoneNumber ? (
                                  <>
                                    <i className="bi bi-telephone me-2 text-success"></i>
                                    {user.phoneNumber}
                                  </>
                                ) : (
                                  <span className="text-muted">Not provided</span>
                                )}
                              </p>
                            </div>
                            <div className="col-sm-6 mb-3">
                              <label className="form-label fw-bold text-muted small">LOCATION</label>
                              <p className="mb-0">
                                {user?.cityOrTown ? (
                                  <>
                                    <i className="bi bi-geo-alt me-2 text-primary"></i>
                                    {user.cityOrTown}
                                  </>
                                ) : (
                                  <span className="text-muted">Not provided</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="card border-0 bg-light mt-3">
                        <div className="card-body">
                          <h6 className="card-title mb-3">
                            <i className="bi bi-graph-up me-2"></i>
                            Teaching Statistics
                          </h6>
                          <div className="row text-center">
                            <div className="col-4">
                              <div className="border-end">
                                <h4 className="text-primary mb-0">{posts.length}</h4>
                                <small className="text-muted">Active Posts</small>
                              </div>
                            </div>
                            <div className="col-4">
                              <div className="border-end">
                                <h4 className="text-success mb-0">
                                  {posts.reduce((total, post) => total + (post.totalReviews || 0), 0)}
                                </h4>
                                <small className="text-muted">Total Reviews</small>
                              </div>
                            </div>
                            <div className="col-4">
                              <h4 className="text-warning mb-0">
                                {posts.length > 0 ? 
                                  (posts.reduce((sum, post) => sum + (parseFloat(post.averageRating) || 0), 0) / posts.filter(p => p.averageRating).length || 0).toFixed(1)
                                  : '0.0'
                                }
                                <i className="bi bi-star-fill ms-1"></i>
                              </h4>
                              <small className="text-muted">Avg Rating</small>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="row">
                          <div className="col-6">
                            <button 
                              className="btn btn-outline-primary w-100"
                              onClick={() => {
                                setProfileForm({
                                  name: user?.name || '',
                                  email: user?.email || '',
                                  phoneNumber: user?.phoneNumber || '',
                                  cityOrTown: user?.cityOrTown || '',
                                  profilePhoto: null
                                });
                                setShowProfileModal(true);
                              }}
                            >
                              <i className="bi bi-pencil me-2"></i>
                              Edit Profile
                            </button>
                          </div>
                          <div className="col-6">
                            <button className="btn btn-outline-secondary w-100">
                              <i className="bi bi-download me-2"></i>
                              Export Data
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Requests Tab */}
              {activeTab === 'requests' && (
                <div>
                  <h4 className="mb-4">
                    <i className="bi bi-envelope me-2"></i>
                    Student Requests
                  </h4>
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    No pending requests at the moment. Students will be able to contact you through your posts.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Post Modal */}
      {showPostModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingPost ? 'Edit Post' : 'Create New Post'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => {
                    setShowPostModal(false);
                    resetPostForm();
                  }}
                ></button>
              </div>
              <form onSubmit={handlePostSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Headline <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={postForm.headline}
                        onChange={(e) => setPostForm({...postForm, headline: e.target.value})}
                        placeholder="e.g., Expert Math Tutor Available"
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Subject <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        value={postForm.subject}
                        onChange={(e) => setPostForm({...postForm, subject: e.target.value})}
                        placeholder="e.g., Mathematics, Physics, English"
                        required
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Location</label>
                      <input
                        ref={locationInputRef}
                        type="text"
                        className="form-control"
                        value={postForm.location}
                        onChange={(e) => setPostForm({...postForm, location: e.target.value})}
                        placeholder="Start typing your city..."
                        autoComplete="off"
                      />
                      <div className="form-text">
                        <i className="bi bi-info-circle me-1"></i>
                        Start typing to see city suggestions
                      </div>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Town/District</label>
                      <input
                        type="text"
                        className="form-control"
                        value={postForm.townOrDistrict}
                        onChange={(e) => setPostForm({...postForm, townOrDistrict: e.target.value})}
                        placeholder="e.g., Downtown, Suburb area"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={postForm.description}
                      onChange={(e) => setPostForm({...postForm, description: e.target.value})}
                      placeholder="Describe your teaching experience, methodology, and what students can expect..."
                    />
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Lesson Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={postForm.lessonType}
                        onChange={(e) => setPostForm({...postForm, lessonType: e.target.value})}
                        required
                      >
                        <option value="in-person">In-Person</option>
                        <option value="online">Online</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Price <span className="text-danger">*</span></label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={postForm.price}
                        onChange={(e) => setPostForm({...postForm, price: e.target.value})}
                        placeholder="0.00"
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Price Type <span className="text-danger">*</span></label>
                      <select
                        className="form-select"
                        value={postForm.priceType}
                        onChange={(e) => setPostForm({...postForm, priceType: e.target.value})}
                        required
                      >
                        <option value="hourly">Per Hour</option>
                        <option value="daily">Per Day</option>
                        <option value="monthly">Per Month</option>
                      </select>
                    </div>
                  </div>

                  {(postForm.lessonType === 'in-person' || postForm.lessonType === 'both') && (
                    <div className="mb-3">
                      <label className="form-label">Distance from Location (km)</label>
                      <div className="row align-items-center">
                        <div className="col-md-8">
                          <input
                            type="range"
                            className="form-range"
                            min="1"
                            max="100"
                            value={postForm.distanceFromLocation}
                            onChange={(e) => setPostForm({...postForm, distanceFromLocation: parseInt(e.target.value)})}
                          />
                        </div>
                        <div className="col-md-4">
                          <span className="badge bg-primary fs-6">{postForm.distanceFromLocation} km</span>
                        </div>
                      </div>
                      <div className="form-text">
                        How far are you willing to travel for in-person lessons?
                      </div>
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setShowPostModal(false);
                      resetPostForm();
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {editingPost ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className={`bi ${editingPost ? 'bi-check-lg' : 'bi-plus-lg'} me-2`}></i>
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

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-gear me-2"></i>
                  Edit Profile Information
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowProfileModal(false)}
                ></button>
              </div>
              <form onSubmit={handleProfileSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-4 text-center mb-4">
                      <div className="position-relative d-inline-block">
                        <div className="avatar-placeholder rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-3" style={{ width: '120px', height: '120px' }}>
                          {user?.profilePhoto ? (
                            <img 
                              src={`${API_BASE_URL}${user.profilePhoto}`} 
                              alt="Profile" 
                              className="rounded-circle w-100 h-100" 
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <i className="bi bi-person-fill" style={{ fontSize: '3rem' }}></i>
                          )}
                        </div>
                        <div className="position-absolute bottom-0 end-0">
                          <label className="btn btn-sm btn-primary rounded-circle" style={{ width: '35px', height: '35px' }}>
                            <i className="bi bi-camera"></i>
                            <input
                              type="file"
                              className="d-none"
                              accept="image/*"
                              onChange={(e) => setProfileForm({...profileForm, profilePhoto: e.target.files[0]})}
                            />
                          </label>
                        </div>
                      </div>
                      <p className="small text-muted">Click camera to update photo</p>
                    </div>
                    
                    <div className="col-md-8">
                      <div className="row">
                        <div className="col-12 mb-3">
                          <label className="form-label fw-bold">
                            <i className="bi bi-person me-2"></i>
                            Full Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                            placeholder="Enter your full name"
                            required
                          />
                        </div>
                        
                        <div className="col-12 mb-3">
                          <label className="form-label fw-bold">
                            <i className="bi bi-envelope me-2"></i>
                            Email Address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                            placeholder="Enter your email address"
                            required
                          />
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            <i className="bi bi-telephone me-2"></i>
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            className="form-control"
                            value={profileForm.phoneNumber}
                            onChange={(e) => setProfileForm({...profileForm, phoneNumber: e.target.value})}
                            placeholder="Enter your phone number"
                          />
                          <div className="form-text">
                            Students will use this to contact you
                          </div>
                        </div>
                        
                        <div className="col-md-6 mb-3">
                          <label className="form-label fw-bold">
                            <i className="bi bi-geo-alt me-2"></i>
                            City/Town
                          </label>
                          <input
                            ref={profileLocationInputRef}
                            type="text"
                            className="form-control"
                            value={profileForm.cityOrTown}
                            onChange={(e) => setProfileForm({...profileForm, cityOrTown: e.target.value})}
                            placeholder="Start typing your city..."
                            autoComplete="off"
                          />
                          <div className="form-text">
                            <i className="bi bi-info-circle me-1"></i>
                            Start typing to see city suggestions
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="row mt-3">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <i className="bi bi-lightbulb me-2"></i>
                        <strong>Profile Tips:</strong>
                        <ul className="mb-0 mt-2">
                          <li>Add a clear profile photo to build trust with students</li>
                          <li>Keep your contact information up to date</li>
                          <li>Your location helps students find local tutors</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary" 
                    onClick={() => setShowProfileModal(false)}
                  >
                    <i className="bi bi-x-lg me-2"></i>
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Updating Profile...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .list-group-item {
          border: none;
          padding: 0.75rem 1rem;
          margin-bottom: 0.25rem;
          border-radius: 0.5rem !important;
          transition: all 0.2s ease;
        }

        .list-group-item:hover {
          background-color: #f8f9fa;
          transform: translateX(2px);
        }

        .list-group-item.active {
          background-color: #2563eb;
          border-color: #2563eb;
        }

        .card {
          border-radius: 1rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }

        .avatar-placeholder {
          background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
        }

        .form-range::-webkit-slider-thumb {
          background: #2563eb;
        }

        .form-range::-moz-range-thumb {
          background: #2563eb;
          border: none;
        }

        .modal {
          backdrop-filter: blur(5px);
        }

        .badge {
          font-size: 0.75rem;
        }

        .btn {
          border-radius: 0.5rem;
          transition: all 0.2s ease;
        }

        .btn:hover {
          transform: translateY(-1px);
        }

        .alert {
          border-radius: 0.75rem;
          border: none;
        }

        .form-control, .form-select {
          border-radius: 0.5rem;
          border: 1px solid #dee2e6;
          transition: all 0.2s ease;
        }

        .form-control:focus, .form-select:focus {
          box-shadow: 0 0 0 0.2rem rgba(37, 99, 235, 0.25);
          border-color: #3b82f6;
        }

        .dropdown-menu {
          border-radius: 0.5rem;
          border: none;
          box-shadow: 0 10px 25px rgba(0,0,0,0.15);
          background-color: white;
          padding: 0.5rem 0;
        }

        .dropdown-item {
          border-radius: 0.25rem;
          margin: 0.125rem 0.5rem;
          padding: 0.375rem 1rem;
          transition: background-color 0.15s ease-in-out;
        }

        .dropdown-item:hover {
          background-color: #f8f9fa;
          color: inherit;
        }

        .dropdown-item.text-danger:hover {
          background-color: #f8d7da;
          color: #721c24;
        }

        .text-truncate-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Google Places Autocomplete Dropdown Styling */
        .pac-container {
          background-color: white !important;
          border-radius: 8px !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
          border: 1px solid #dee2e6 !important;
          margin-top: 2px !important;
          font-family: inherit !important;
          z-index: 9999 !important;
        }

        .pac-item {
          padding: 12px 15px !important;
          border-bottom: 1px solid #f1f3f4 !important;
          cursor: pointer !important;
          font-size: 14px !important;
          line-height: 1.5 !important;
        }

        .pac-item:hover {
          background-color: #f8f9fa !important;
        }

        .pac-item-selected,
        .pac-item:hover {
          background-color: #e7f1ff !important;
        }

        .pac-matched {
          font-weight: 600 !important;
          color: #2563eb !important;
        }

        @media (max-width: 768px) {
          .col-md-6.col-lg-4 {
            margin-bottom: 1rem;
          }
          
          .modal-lg {
            max-width: 95vw;
          }
        }
      `}</style>
    </div>
  );
};

export default TeacherDashboard;