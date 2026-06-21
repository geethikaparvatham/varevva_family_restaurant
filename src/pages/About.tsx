import { Link } from 'react-router-dom';

const About = () => {
  return (
    <>
      {/* About Header Page Banner */}
      <header style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://varevva-family-restaurant.vercel.app/assets/about_restaurant-CRrdHzyv.jpg') center/cover`,
        padding: '120px 0 60px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-header)', fontSize: '2.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>About Us</h1>
          <p style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--primary-color)' }}>Discover Varevva's Culinary Legacy</p>
        </div>
      </header>

      {/* About Section */}
      <section className="about-section" id="about" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="about-grid">
            <div className="about-visual">
              <div className="visual-stack">
                <img
                  src="https://varevva-family-restaurant.vercel.app/assets/about_restaurant-CRrdHzyv.jpg"
                  alt="Dining Hall Filled with Customers"
                  className="about-img-main"
                />
                <div className="experience-badge">
                  <h3>Authentic</h3>
                  <p>Telangana Ruchulu</p>
                </div>
              </div>
            </div>
            
            <div className="about-content">
              <h3>Best Family Restaurant in Yadagirigutta | Authentic Telangana Ruchulu</h3>
              <p>
                Conveniently located right on the main temple highway, <strong>Varevva Family Restaurant</strong> is widely recognized as one of the <strong>best restaurants in Yadagirigutta</strong> for travelers, pilgrims, and local families. If you are searching for the <strong>top places to eat near Yadadri Temple</strong>, Varevva offers the perfect stopover for authentic, high-quality, and delicious meals.
              </p>
              <p>
                At Varevva, we believe that food should not only taste incredible but also nourish your body. That's why we enforce a strict policy: <strong>No artificial food colors and no MSG / tasting salt</strong> are used in our kitchen. We spice our dishes using freshly ground, handpicked local spices to ensure authentic taste and excellent health, making us the premier healthy food destination among all <strong>yadagirigutta restaurants</strong>.
              </p>
              
              <div className="about-highlights">
                <div className="highlight-box">
                  <i className="fa-solid fa-kitchen-set"></i>
                  <div>
                    <h4>Authentic Local Spices</h4>
                    <p>No packaged mixtures, only authentic spices ground daily for pure Telangana Ruchulu.</p>
                  </div>
                </div>
                <div className="highlight-box">
                  <i className="fa-solid fa-users"></i>
                  <div>
                    <h4>Best Family Dining in Yadagirigutta</h4>
                    <p>Comfortable indoor A/C seating designed for families and group travelers.</p>
                  </div>
                </div>
              </div>

              <div className="about-cta" style={{ marginTop: '30px' }}>
                <Link to="/menu" className="btn-primary">View Full Menu <i className="fa-solid fa-arrow-right"></i></Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default About;
