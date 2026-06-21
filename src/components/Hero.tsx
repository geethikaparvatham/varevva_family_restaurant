import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <header className="hero-section" id="hero" style={{ minHeight: '85vh' }}>
      <div className="hero-overlay"></div>
      <div className="hero-container">
        <div className="hero-content">
          <span className="hero-subtitle">Taste the Heritage of Telangana</span>
          <h1 className="hero-title">
            VAREVVA<br />
            <span className="accent-text">Family Restaurant</span>
          </h1>
          <p className="hero-description">
            A premium culinary destination specializing in authentic local Telangana spices, rich slow-cooked Dum Biryanis, sizzling starters, and fresh curries. Handcrafted for families and travelers visiting Yadadri Temple.
          </p>
          
          <div className="hero-badges">
            <div className="badge-item" title="Healthy preparation guidelines followed strictly">
              <i className="fa-solid fa-heart-pulse"></i>
              <span>No Colors & No Tasting Salt</span>
            </div>
            <div className="badge-item" title="Spacious air-conditioned dining area">
              <i className="fa-solid fa-snowflake"></i>
              <span>Premium A/C Seating</span>
            </div>
            <div className="badge-item" title="Dedicated options for everyone">
              <i className="fa-solid fa-leaf"></i>
              <span>Veg & Non-Veg Specials</span>
            </div>
          </div>

          <div className="hero-actions">
            <Link to="/menu" className="btn-primary">
              <i className="fa-solid fa-utensils"></i> Explore Menu
            </Link>
            <Link to="/contact" className="btn-secondary">
              <i className="fa-solid fa-location-dot"></i> Get Directions
            </Link>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="floating-circle"></div>
          <img src="/assets/chicken_dum_biryani.png" alt="Special Chicken Dum Biryani in Clay Pot" className="hero-img" id="hero-img" />
          <div className="floating-card signature-card">
            <i className="fa-solid fa-star"></i>
            <div>
              <h4>Biryani Special</h4>
              <p>Telangana Dum Style</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
