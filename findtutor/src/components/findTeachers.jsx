import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const API_BASE_URL = 'http://localhost:3000';

const FindTeachers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [location, setLocation] = useState('');
  const [lessonType, setLessonType] = useState('');
  const [priceType, setPriceType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  
  const locationInputRef = useRef(null);
  const autocompleteRef = useRef(null);

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

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (isGoogleMapsLoaded && locationInputRef.current && !autocompleteRef.current) {
      const initTimer = setTimeout(() => {
        if (locationInputRef.current && window.google?.maps?.places?.Autocomplete) {
          try {
            autocompleteRef.current = new window.google.maps.places.Autocomplete(
              locationInputRef.current,
              {
                types: ['(cities)'],
                fields: ['name', 'formatted_address', 'address_components']
              }
            );

            autocompleteRef.current.addListener('place_changed', () => {
              const place = autocompleteRef.current.getPlace();
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

                setLocation(cityName);
              }
            });
          } catch (error) {
            console.error('Error creating autocomplete:', error);
          }
        }
      }, 500);

      return () => clearTimeout(initTimer);
    }

    return () => {
      if (autocompleteRef.current && window.google?.maps?.event) {
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
          autocompleteRef.current = null;
        } catch (error) {
          console.error('Error cleaning up autocomplete:', error);
        }
      }
    };
  }, [isGoogleMapsLoaded]);

  // Fetch all teacher posts
  useEffect(() => {
    fetchPosts();
  }, []);

  // Filter posts when search criteria change
  useEffect(() => {
    filterPosts();
  }, [posts, searchQuery, selectedSubject, location, lessonType, priceType, minPrice, maxPrice]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_BASE_URL}/post/teachers/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load teacher posts');
    } finally {
      setLoading(false);
    }
  };

  const filterPosts = () => {
    let filtered = posts.filter(post => {
      // Search query filter (headline, subject, teacher name, description)
      const searchMatch = !searchQuery || 
        post.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.teacherName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Subject filter
      const subjectMatch = !selectedSubject || 
        post.subject?.toLowerCase().includes(selectedSubject.toLowerCase());

      // Location filter
      const locationMatch = !location || 
        post.location?.toLowerCase().includes(location.toLowerCase()) ||
        post.townOrDistrict?.toLowerCase().includes(location.toLowerCase());

      // Lesson type filter
      const lessonTypeMatch = !lessonType || post.lessonType === lessonType;

      // Price type filter
      const priceTypeMatch = !priceType || post.priceType === priceType;

      // Price range filter
      const priceRangeMatch = (!minPrice || post.price >= parseFloat(minPrice)) &&
        (!maxPrice || post.price <= parseFloat(maxPrice));

      return searchMatch && subjectMatch && locationMatch && lessonTypeMatch && priceTypeMatch && priceRangeMatch;
    });

    setFilteredPosts(filtered);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    filterPosts();
  };

  const handleViewProfile = async (teacherId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/teachers/${teacherId}`);
      setSelectedTeacher(response.data);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      alert('Failed to load teacher profile');
    }
  };

  const getUniqueSubjects = () => {
    const subjects = [...new Set(posts.map(post => post.subject).filter(Boolean))];
    return subjects.sort();
  };

  return (
    <div className="find-teachers-page">
      {/* Hero Section */}
      <section className="search-hero">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold mb-4">Find Your Perfect Teacher</h1>
              <p className="lead mb-5">
                Discover experienced teachers offering personalized lessons. Filter by subject, location, and more to find the right match for your learning needs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-card">
            <form onSubmit={handleSearch}>
              <div className="row g-3">
                <div className="col-md-6 col-lg-3">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-search me-2"></i>
                      Search
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by keyword, subject, teacher..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-book me-2"></i>
                      Subject
                    </label>
                    <select
                      className="form-select"
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                    >
                      <option value="">All Subjects</option>
                      {getUniqueSubjects().map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-geo-alt me-2"></i>
                      Location
                    </label>
                    <input
                      ref={locationInputRef}
                      type="text"
                      className="form-control"
                      placeholder="Enter city or location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-laptop me-2"></i>
                      Lesson Type
                    </label>
                    <select
                      className="form-select"
                      value={lessonType}
                      onChange={(e) => setLessonType(e.target.value)}
                    >
                      <option value="">All Types</option>
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="row g-3 mt-2">
                <div className="col-md-4">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-clock me-2"></i>
                      Price Type
                    </label>
                    <select
                      className="form-select"
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value)}
                    >
                      <option value="">All Price Types</option>
                      <option value="hourly">Per Hour</option>
                      <option value="daily">Per Day</option>
                      <option value="monthly">Per Month</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-currency-dollar me-2"></i>
                      Min Price ($)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label className="form-label">
                      <i className="bi bi-currency-dollar me-2"></i>
                      Max Price ($)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="1000"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              <div className="text-center mt-4">
                <button type="button" className="btn btn-outline-secondary me-2" onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('');
                  setLocation('');
                  setLessonType('');
                  setPriceType('');
                  setMinPrice('');
                  setMaxPrice('');
                }}>
                  <i className="bi bi-arrow-clockwise me-2"></i>
                  Clear Filters
                </button>
                <button type="submit" className="btn btn-primary btn-lg">
                  <i className="bi bi-search me-2"></i>
                  Search Teachers ({filteredPosts.length})
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Teachers List Section */}
      <section className="teachers-section">
        <div className="container">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }}>
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3">Loading teacher posts...</p>
            </div>
          ) : error ? (
            <div className="alert alert-danger text-center">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search display-1 text-muted"></i>
              <h4 className="mt-3">No teachers found</h4>
              <p className="text-muted">Try adjusting your search criteria or clear filters to see more results.</p>
            </div>
          ) : (
            <div className="teachers-list">
              {filteredPosts.map((post) => (
                <div key={post.id} className="teacher-card">
                  <div className="row align-items-center">
                    <div className="col-md-2">
                      <div className="teacher-image">
                        {post.teacherPhoto ? (
                          <img src={`${API_BASE_URL}${post.teacherPhoto}`} alt={post.teacherName} />
                        ) : (
                          <div className="placeholder-avatar">
                            <i className="bi bi-person-fill"></i>
                          </div>
                        )}
                        {post.averageRating && (
                          <div className="rating-badge">
                            <i className="bi bi-star-fill"></i>
                            <span>{post.averageRating}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-7">
                      <div className="teacher-info">
                        <div className="teacher-header">
                          <h3>{post.headline}</h3>
                          <span className="subject-badge">{post.subject}</span>
                          <span className={`lesson-type-badge ${post.lessonType}`}>
                            {post.lessonType === 'online' ? (
                              <><i className="bi bi-laptop me-1"></i>Online</>
                            ) : post.lessonType === 'in-person' ? (
                              <><i className="bi bi-person me-1"></i>In-Person</>
                            ) : (
                              <><i className="bi bi-hybrid me-1"></i>Both</>
                            )}
                          </span>
                        </div>
                        <div className="teacher-name">
                          <i className="bi bi-person-badge me-2"></i>
                          <strong>{post.teacherName}</strong>
                        </div>
                        <div className="details">
                          {post.location && (
                            <span><i className="bi bi-geo-alt"></i> {post.location}</span>
                          )}
                          {post.townOrDistrict && (
                            <span><i className="bi bi-building"></i> {post.townOrDistrict}</span>
                          )}
                          {post.distanceFromLocation && (
                            <span><i className="bi bi-arrow-up-right-circle"></i> {post.distanceFromLocation}km radius</span>
                          )}
                          <span><i className="bi bi-currency-dollar"></i> ${post.price}/{post.priceType}</span>
                        </div>
                        <p className="description">{post.description}</p>
                        <div className="reviews-summary">
                          {post.averageRating ? (
                            <>
                              <div className="rating-stars">
                                {[...Array(5)].map((_, i) => (
                                  <i
                                    key={i}
                                    className={`bi bi-star${i < Math.floor(post.averageRating) ? '-fill' : ''}`}
                                  ></i>
                                ))}
                              </div>
                              <span className="reviews-count">{post.totalReviews} reviews</span>
                            </>
                          ) : (
                            <span className="text-muted">No reviews yet</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="teacher-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleViewProfile(post.teacherId)}
                        >
                          <i className="bi bi-person-lines-fill me-2"></i>
                          View Profile
                        </button>
                        <button className="btn btn-success">
                          <i className="bi bi-telephone me-2"></i>
                          Connect Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* View Profile Modal */}
      {showProfileModal && selectedTeacher && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-person-badge me-2"></i>
                  Teacher Profile
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowProfileModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 text-center">
                    <div className="profile-image-large">
                      {selectedTeacher.profilePhoto ? (
                        <img 
                          src={`${API_BASE_URL}${selectedTeacher.profilePhoto}`} 
                          alt={selectedTeacher.name}
                          className="rounded-circle w-100 h-100"
                          style={{ objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="placeholder-avatar-large">
                          <i className="bi bi-person-fill"></i>
                        </div>
                      )}
                    </div>
                    <h4 className="mt-3">{selectedTeacher.name}</h4>
                    <p className="text-muted">{selectedTeacher.email}</p>
                  </div>
                  <div className="col-md-8">
                    <div className="profile-info">
                      <div className="info-section">
                        <h6 className="section-title">
                          <i className="bi bi-info-circle me-2"></i>
                          Contact Information
                        </h6>
                        <div className="info-grid">
                          <div className="info-item">
                            <label>Phone Number:</label>
                            <span>{selectedTeacher.phoneNumber || 'Not provided'}</span>
                          </div>
                          <div className="info-item">
                            <label>Location:</label>
                            <span>{selectedTeacher.cityOrTown || 'Not provided'}</span>
                          </div>
                          <div className="info-item">
                            <label>Member Since:</label>
                            <span>{new Date(selectedTeacher.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowProfileModal(false)}
                >
                  Close
                </button>
                <button className="btn btn-success">
                  <i className="bi bi-telephone me-2"></i>
                  Connect Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .find-teachers-page {
          padding-top: 80px;
        }

        .search-hero {
          padding: 3rem 0;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
        }

        .search-section {
          padding: 1.5rem 0;
          margin-top: -30px;
        }

        .search-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .form-group {
          margin-bottom: 0;
        }

        .form-label {
          font-weight: 500;
          color: #1e293b;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
        }

        .form-control,
        .form-select {
          padding: 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }

        .form-control:focus,
        .form-select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .teachers-section {
          padding: 2rem 0;
        }

        .teachers-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .teacher-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          border: 1px solid #f1f5f9;
        }

        .teacher-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .teacher-image {
          position: relative;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto;
          border: 3px solid #e2e8f0;
        }

        .teacher-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-avatar {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 1.5rem;
        }

        .rating-badge {
          position: absolute;
          bottom: -8px;
          left: 50%;
          transform: translateX(-50%);
          background: #2563eb;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .rating-badge i {
          color: #fbbf24;
          font-size: 0.7rem;
        }

        .teacher-info {
          padding: 0 1rem;
        }

        .teacher-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
        }

        .teacher-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0;
          color: #1e293b;
        }

        .teacher-name {
          display: flex;
          align-items: center;
          margin-bottom: 0.75rem;
          color: #475569;
          font-size: 0.9rem;
        }

        .subject-badge {
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .lesson-type-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 0.5rem;
          font-size: 0.75rem;
          font-weight: 500;
          display: flex;
          align-items: center;
        }

        .lesson-type-badge.online {
          background: #dcfce7;
          color: #166534;
        }

        .lesson-type-badge.in-person {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .lesson-type-badge.both {
          background: #fef3c7;
          color: #92400e;
        }

        .details {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .details span {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: #64748b;
          font-size: 0.8rem;
        }

        .details i {
          color: #2563eb;
          font-size: 0.9rem;
        }

        .description {
          color: #475569;
          font-size: 0.85rem;
          margin-bottom: 0.75rem;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .reviews-summary {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .rating-stars {
          color: #fbbf24;
          font-size: 0.85rem;
        }

        .reviews-count {
          color: #64748b;
          font-size: 0.8rem;
        }

        .teacher-actions {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .teacher-actions .btn {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.875rem;
          border-radius: 0.5rem;
          font-weight: 500;
        }

        .teacher-actions .btn-primary {
          background: #2563eb;
          border: none;
        }

        .teacher-actions .btn-success {
          background: #059669;
          border: none;
        }

        .teacher-actions .btn:hover {
          transform: translateY(-1px);
        }

        .profile-image-large {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          overflow: hidden;
          margin: 0 auto;
          border: 3px solid #e2e8f0;
        }

        .placeholder-avatar-large {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 3rem;
        }

        .profile-info {
          padding: 1rem 0;
        }

        .section-title {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
        }

        .info-grid {
          display: grid;
          gap: 0.75rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f1f5f9;
        }

        .info-item label {
          font-weight: 500;
          color: #64748b;
          margin: 0;
        }

        .info-item span {
          color: #1e293b;
        }

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
          .search-hero {
            padding: 2rem 0;
          }

          .search-section {
            margin-top: 0;
          }

          .search-card {
            padding: 1.5rem;
          }

          .teacher-image {
            width: 70px;
            height: 70px;
            margin-bottom: 1rem;
          }

          .teacher-info {
            padding: 0;
            margin-bottom: 1rem;
          }

          .teacher-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .teacher-actions {
            flex-direction: row;
          }

          .teacher-actions .btn {
            flex: 1;
            padding: 0.5rem;
            font-size: 0.8rem;
          }

          .details {
            flex-direction: column;
            gap: 0.5rem;
          }

          .profile-image-large {
            width: 120px;
            height: 120px;
          }

          .placeholder-avatar-large {
            font-size: 2rem;
          }
        }

        @media (max-width: 576px) {
          .teacher-card {
            padding: 1rem;
          }

          .teacher-header h3 {
            font-size: 1rem;
          }

          .teacher-actions {
            flex-direction: column;
          }

          .search-card {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default FindTeachers;