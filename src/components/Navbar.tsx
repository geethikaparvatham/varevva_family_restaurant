import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/specials', label: 'Specials' },
    { path: '/menu', label: 'Menu' },
    { path: '/ambience', label: 'Ambience' },
    { path: '/contact', label: 'Contact & Map' },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" id="nav-logo">
          <img id="restaurant-logo" src="/assets/logo.png" alt="Varevva Logo" />
          <div className="brand-text-container">
            <span className="brand-v">Varevva</span>
            <span className="sub-brand">Telangana Ruchulu</span>
          </div>
        </Link>
        
        <ul className="nav-menu" id="nav-menu">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          <a href="tel:+916302019925" className="btn-nav-call" id="btn-nav-call">
            <i className="fa-solid fa-phone"></i>
            <span>+91 63020 19925</span>
          </a>
          <button className="mobile-nav-toggle" id="mobile-nav-toggle" aria-label="Toggle menu">
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
