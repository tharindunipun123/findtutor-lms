import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // Quick links data
  const quickLinks = [
    { title: 'For Students', links: [
      { name: 'Find Teachers', path: '/find-teachers' },
      { name: 'Browse Subjects', path: '/subjects' },
      { name: 'Student Dashboard', path: '/dashboard/student' },
      { name: 'Learning Resources', path: '/resources' }
    ]},
    { title: 'For Teachers', links: [
      { name: 'Create Profile', path: '/register/teacher' },
      { name: 'Teacher Dashboard', path: '/dashboard/teacher' },
      { name: 'Teaching Resources', path: '/teacher-resources' },
      { name: 'Pricing Plans', path: '/pricing' }
    ]},
    { title: 'Company', links: [
      { name: 'About Us', path: '/about' },
      { name: 'Careers', path: '/careers' },
      { name: 'Blog', path: '/blog' },
      { name: 'Press', path: '/press' }
    ]},
    { title: 'Support', links: [
      { name: 'Help Center', path: '/help' },
      { name: 'Contact Us', path: '/contact' },
      { name: 'Privacy Policy', path: '/privacy' },
      { name: 'Terms of Service', path: '/terms' }
    ]}
  ];

  // Social media links
  const socialLinks = [
    { icon: 'bi-facebook', url: '#' },
    { icon: 'bi-twitter', url: '#' },
    { icon: 'bi-instagram', url: '#' },
    { icon: 'bi-linkedin', url: '#' },
    { icon: 'bi-youtube', url: '#' }
  ];

  return (
    <footer className="footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="container">
          <div className="row g-4">
            {/* Brand Column */}
            <div className="col-lg-4">
              <div className="footer-brand">
                <Link to="/" className="d-flex align-items-center mb-3">
                  <div className="logo-icon me-2">
                    <i className="bi bi-book-half"></i>
                  </div>
                  <span className="logo-text">EduLink</span>
                </Link>
                <p className="footer-description">
                  Connecting passionate teachers with motivated students worldwide. 
                  Join our community and transform education together.
                </p>
                <div className="social-links">
                  {socialLinks.map((social, index) => (
                    <a 
                      key={index}
                      href={social.url}
                      className="social-link"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className={`bi ${social.icon}`}></i>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links Columns */}
            {quickLinks.map((section, index) => (
              <div key={index} className="col-6 col-md-3 col-lg-2">
                <h5 className="footer-title">{section.title}</h5>
                <ul className="footer-links">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link to={link.path} className="footer-link">
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="copyright">
                © {new Date().getFullYear()} EduLink. All rights reserved.
              </p>
            </div>
            <div className="col-md-6">
              <div className="footer-bottom-links">
                <Link to="/privacy" className="footer-bottom-link">Privacy Policy</Link>
                <Link to="/terms" className="footer-bottom-link">Terms of Service</Link>
                <Link to="/cookies" className="footer-bottom-link">Cookie Policy</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .footer {
          background: #1a1a1a;
          color: #ffffff;
          padding-top: 4rem;
        }

        .footer-main {
          padding-bottom: 3rem;
        }

        .footer-brand {
          max-width: 300px;
        }

        .logo-icon {
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
        }

        .logo-text {
          font-family: 'Poppins', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .footer-description {
          color: #a0aec0;
          margin-bottom: 1.5rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          color: #a0aec0;
          font-size: 1.25rem;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          color: #2563eb;
          transform: translateY(-2px);
        }

        .footer-title {
          color: #ffffff;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.5rem;
        }

        .footer-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30px;
          height: 2px;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        }

        .footer-links {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-link {
          color: #a0aec0;
          text-decoration: none;
          display: block;
          padding: 0.5rem 0;
          transition: all 0.3s ease;
        }

        .footer-link:hover {
          color: #ffffff;
          transform: translateX(5px);
        }

        .footer-bottom {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem 0;
        }

        .copyright {
          color: #a0aec0;
          margin: 0;
        }

        .footer-bottom-links {
          display: flex;
          gap: 1.5rem;
          justify-content: flex-end;
        }

        .footer-bottom-link {
          color: #a0aec0;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.3s ease;
        }

        .footer-bottom-link:hover {
          color: #ffffff;
        }

        @media (max-width: 768px) {
          .footer {
            padding-top: 3rem;
          }

          .footer-bottom-links {
            justify-content: flex-start;
            margin-top: 1rem;
          }

          .footer-brand {
            max-width: 100%;
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;