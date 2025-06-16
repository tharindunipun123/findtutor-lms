import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import Header from './header';
import Footer from './footer';


const EduLink = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activePage, setActivePage] = useState('home');
  const [isSticky, setIsSticky] = useState(false);

  // Handle scroll for sticky header
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Navigation links
  const navLinks = [
    { id: 'home', name: 'Home', href: '#' },
    { id: 'teachers', name: 'Find Teachers', href: '#' },
    { id: 'students', name: 'For Students', href: '#' },
    { id: 'about', name: 'About Us', href: '#' },
    { id: 'contact', name: 'Contact', href: '#' }
  ];

  // Popular subjects data
  const popularSubjects = [
    { name: 'Mathematics', icon: '📐', students: 24500 },
    { name: 'English', icon: '📚', students: 21800 },
    { name: 'Science', icon: '🔬', students: 19200 },
    { name: 'Computer Science', icon: '💻', students: 18700 },
    { name: 'History', icon: '🏛️', students: 15300 },
    { name: 'Languages', icon: '🌎', students: 14200 }
  ];

  // Featured teachers data
  const featuredTeachers = [
    {
      id: 1,
      name: 'Dr. Emily Johnson',
      subject: 'Mathematics',
      price: '$35/hr',
      location: 'New York, USA',
      rating: 4.9,
      reviews: 236,
      image: '/api/placeholder/300/300'
    },
    {
      id: 2,
      name: 'Prof. David Chen',
      subject: 'Physics',
      price: '$40/hr',
      location: 'Boston, USA',
      rating: 4.8,
      reviews: 195,
      image: '/api/placeholder/300/300'
    },
    {
      id: 3,
      name: 'Sarah Williams',
      subject: 'English Literature',
      price: '$30/hr',
      location: 'London, UK',
      rating: 4.7,
      reviews: 168,
      image: '/api/placeholder/300/300'
    },
    {
      id: 4,
      name: 'Michael Rodriguez',
      subject: 'Computer Science',
      price: '$45/hr',
      location: 'San Francisco, USA',
      rating: 4.9,
      reviews: 218,
      image: '/api/placeholder/300/300'
    }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      author: 'Sophia Garcia',
      role: 'Student, Psychology',
      content: 'EduLink completely transformed my learning experience. I found a perfect tutor who helped me improve my grades dramatically in just two months!',
      image: '/api/placeholder/100/100'
    },
    {
      id: 2,
      author: 'James Wilson',
      role: 'Math Teacher',
      content: 'As a teacher, EduLink has allowed me to connect with motivated students and share my passion for mathematics. The platform is intuitive and professional.',
      image: '/api/placeholder/100/100'
    },
    {
      id: 3,
      author: 'Emma Thompson',
      role: 'Parent',
      content: 'Finding a qualified tutor for my daughter was so easy with EduLink. The verification process gave me confidence, and the results speak for themselves!',
      image: '/api/placeholder/100/100'
    }
  ];

  return (
    <div className="min-vh-100 d-flex flex-column">
      {/* Replace old header with new Header component */}
    
      
      {/* Hero Section */}
      <section className="bg-primary text-white py-5 position-relative">
        {/* Background Pattern */}
        <div className="position-absolute top-0 start-0 end-0 bottom-0 bg-dark opacity-10">
          <div className="position-absolute top-0 start-0 end-0 bottom-0" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container py-5 position-relative">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-5 mb-lg-0">
              <h1 className="display-4 fw-bold mb-4">
                Connect with the Perfect Teacher for Your Learning Journey
              </h1>
              <p className="lead text-white-50 mb-4">
                EduLink brings students and teachers together for personalized learning experiences that inspire academic success.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 pt-3">
                <button className="btn btn-light btn-lg text-primary d-flex align-items-center justify-content-center">
                  <i className="bi bi-search me-2"></i>
                  Find a Teacher
                </button>
                {/* <button className="btn btn-outline-light btn-lg d-flex align-items-center justify-content-center">
                  <i className="bi bi-book me-2"></i>
                  Post a Request
                </button> */}
              </div>
            </div>
            
            <div className="col-lg-6 d-none d-lg-block">
              <div className="position-relative">
                <div className="position-absolute top-0 start-0 end-0 bottom-0 translate-x-10 translate-y-10 bg-info opacity-25 rounded-3 blur-3"></div>
                <img 
                  src="https://www.twigscience.com/wp-content/uploads/2022/05/GettyImages-974018398-RF-scaled.jpg" 
                  alt="Students and teacher collaborating" 
                  className="img-fluid rounded-3 shadow position-relative"
                />
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="row mt-5 g-4 text-center">
            <div className="col-6 col-md-3">
              <div className="bg-white bg-opacity-10 rounded p-3 backdrop-filter-blur">
                <p className="display-6 fw-bold mb-0">10,000+</p>
                <p className="text-white-50 mb-0">Expert Teachers</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="bg-white bg-opacity-10 rounded p-3 backdrop-filter-blur">
                <p className="display-6 fw-bold mb-0">50,000+</p>
                <p className="text-white-50 mb-0">Active Students</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="bg-white bg-opacity-10 rounded p-3 backdrop-filter-blur">
                <p className="display-6 fw-bold mb-0">100+</p>
                <p className="text-white-50 mb-0">Subjects</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="bg-white bg-opacity-10 rounded p-3 backdrop-filter-blur">
                <p className="display-6 fw-bold mb-0">4.8/5</p>
                <p className="text-white-50 mb-0">Average Rating</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Wave Divider */}
        <div className="position-absolute bottom-0 start-0 end-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" fill="white">
            <path fillOpacity="1" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
          </svg>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">How EduLink Works</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Our platform makes it simple to connect with teachers or students in just a few steps
            </p>
          </div>
          
          <div className="row g-4">
            {/* Step 1 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-4 text-center position-relative transition" style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }}>
                <div className="text-center mb-3">
                  <div className="bg-primary text-white rounded-circle p-3 d-inline-flex">
                    <i className="bi bi-search fs-4"></i>
                  </div>
                </div>
                <h3 className="fs-4 fw-bold mb-2">Find or Request</h3>
                <p className="text-muted">
                  Search for teachers by subject or post a specific request. Browse profiles, credentials, and reviews.
                </p>
                <div className="position-absolute end-0 top-50 translate-middle-y d-none d-md-block">
                  <i className="bi bi-chevron-right text-primary fs-3"></i>
                </div>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-4 text-center position-relative transition" style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }}>
                <div className="text-center mb-3">
                  <div className="bg-primary text-white rounded-circle p-3 d-inline-flex">
                    <i className="bi bi-people-fill fs-4"></i>
                  </div>
                </div>
                <h3 className="fs-4 fw-bold mb-2">Connect</h3>
                <p className="text-muted">
                  Message teachers or students directly, discuss your learning goals, and schedule lessons.
                </p>
                <div className="position-absolute end-0 top-50 translate-middle-y d-none d-md-block">
                  <i className="bi bi-chevron-right text-primary fs-3"></i>
                </div>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 p-4 text-center transition" style={{ transform: 'translateY(0)', transition: 'transform 0.3s ease' }}>
                <div className="text-center mb-3">
                  <div className="bg-primary text-white rounded-circle p-3 d-inline-flex">
                    <i className="bi bi-award-fill fs-4"></i>
                  </div>
                </div>
                <h3 className="fs-4 fw-bold mb-2">Learn & Succeed</h3>
                <p className="text-muted">
                  Receive personalized education, track your progress, and achieve your academic goals.
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-5 text-center">
            <button className="btn btn-primary btn-lg">
              Get Started Now
              <i className="bi bi-arrow-right ms-2"></i>
            </button>
          </div>
        </div>
      </section>
      
      {/* Popular Subjects */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">Popular Subjects</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Discover the most sought-after subjects on our platform
            </p>
          </div>
          
          <div className="row row-cols-2 row-cols-md-3 row-cols-lg-6 g-4">
            {popularSubjects.map((subject, index) => (
              <div key={index} className="col">
                <div className="card h-100 border-0 shadow-sm rounded-3 p-3 text-center hover-shadow">
                  <div className="fs-1 mb-2">{subject.icon}</div>
                  <h3 className="fs-5 fw-bold mb-1">{subject.name}</h3>
                  <p className="small text-muted mb-0">{subject.students.toLocaleString()} students</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <a href="#" className="btn btn-link text-primary fw-bold">
              View All Subjects
              <i className="bi bi-arrow-right ms-1"></i>
            </a>
          </div>
        </div>
      </section>
      
      {/* Featured Teachers */}
      {/* <section className="py-5 bg-white">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">Featured Teachers</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Learn from our top-rated experienced educators
            </p>
          </div>
          
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {featuredTeachers.map((teacher) => (
              <div key={teacher.id} className="col">
                <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden hover-shadow">
                  <img 
                    src={teacher.image} 
                    alt={teacher.name} 
                    className="card-img-top"
                    style={{ aspectRatio: '1/1', objectFit: 'cover' }}
                  />
                  <div className="card-body p-4">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h3 className="card-title fs-5 fw-bold mb-0">{teacher.name}</h3>
                      <span className="badge bg-primary-subtle text-primary rounded-pill">
                        {teacher.price}
                      </span>
                    </div>
                    <p className="text-primary fw-medium">{teacher.subject}</p>
                    <div className="d-flex align-items-center mt-2 text-muted small">
                      <i className="bi bi-geo-alt me-1"></i>
                      {teacher.location}
                    </div>
                    <div className="d-flex align-items-center mt-2">
                      <div className="text-warning d-flex align-items-center">
                        <i className="bi bi-star-fill"></i>
                        <span className="ms-1 fw-medium">{teacher.rating}</span>
                      </div>
                      <span className="mx-2 text-muted">•</span>
                      <span className="text-muted small">{teacher.reviews} reviews</span>
                    </div>
                    <button className="btn btn-primary w-100 mt-3">
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-center">
            <a href="#" className="btn btn-outline-primary">
              Browse All Teachers
              <i className="bi bi-arrow-right ms-2"></i>
            </a>
          </div>
        </div>
      </section> */}
      
      {/* Testimonials */}
      <section className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-dark mb-3">What Our Users Say</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '700px' }}>
              Read testimonials from students and teachers who have found success on EduLink
            </p>
          </div>
          
          <div className="row g-4">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-3 p-4 position-relative">
                  {/* Quote mark */}
                  <div className="position-absolute top-0 end-0 p-3 text-primary-subtle display-3 fw-bold">"</div>
                  
                  <p className="card-text text-muted mb-4 position-relative">
                    {testimonial.content}
                  </p>
                  <div className="d-flex align-items-center">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.author} 
                      className="rounded-circle me-3"
                      width="48"
                      height="48"
                    />
                    <div>
                      <h4 className="fs-6 fw-bold mb-0">{testimonial.author}</h4>
                      <p className="small text-muted mb-0">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-5 bg-primary text-white position-relative overflow-hidden">
        {/* Background Pattern */}
        <div className="position-absolute top-0 start-0 end-0 bottom-0 opacity-10">
          <div className="position-absolute top-0 start-0 end-0 bottom-0" style={{ 
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '60px 60px'
          }}></div>
        </div>
        
        <div className="container py-5 text-center position-relative">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <h2 className="display-5 fw-bold mb-4">Ready to Transform Your Learning Experience?</h2>
              <p className="lead text-white-50 mb-5">
                Join thousands of students and teachers who are already using EduLink to achieve their educational goals.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button className="btn btn-light btn-lg text-primary fw-medium">
                  Join as a Student
                </button>
                <button className="btn btn-outline-light btn-lg fw-medium">
                  Join as a Teacher
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
     
    </div>
  );
};

export default EduLink;