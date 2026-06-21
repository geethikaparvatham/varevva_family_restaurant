const Contact = () => {
  return (
    <>
      {/* Contact Banner */}
      <header style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://varevva-family-restaurant.vercel.app/assets/restaurant_interior-CpXiFg0S.png') center/cover`,
        padding: '120px 0 60px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-header)', fontSize: '2.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Contact & Location</h1>
          <p style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--primary-color)' }}>Find our location pin or call to place a takeaway order</p>
        </div>
      </header>

      {/* Contact & Map Section */}
      <section className="contact-section" id="contact" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="contact-grid">
            {/* Contact details column */}
            <div className="contact-info-panel">
              <div className="info-card">
                <h3>Varevva Family Restaurant</h3>
                <p className="tagline">Telangana Ruchulu - Veg & Non-Veg Special</p>
                
                <div className="info-list">
                  <div className="info-item">
                    <i className="fa-solid fa-location-dot"></i>
                    <div>
                      <h4>Address</h4>
                      <p>Shop No. 1, Plot No. 11, Yadagirigutta Highway Road, Yadagirigutta, Telangana - 508115</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fa-solid fa-phone-volume"></i>
                    <div>
                      <h4>Phone Number</h4>
                      <p><a href="tel:+916302019925" className="contact-link">+91 63020 19925</a></p>
                      <p className="note">Call us for takeaway orders, dining queries, or party catering.</p>
                    </div>
                  </div>

                  <div className="info-item">
                    <i className="fa-solid fa-clock"></i>
                    <div>
                      <h4>Operating Hours</h4>
                      <p>Open Daily: <strong>11:00 AM – 01:00 AM</strong></p>
                      <p className="note">Dine-in and takeaway available all days.</p>
                    </div>
                  </div>
                </div>

                {/* Custom CTA actions */}
                <div className="contact-actions">
                  <a href="tel:+916302019925" className="btn-primary">
                    <i className="fa-solid fa-phone"></i> Call to Order
                  </a>
                  <a href="https://wa.me/916302019925?text=Hi%20Varevva%20Restaurant,%20I%20would%20like%20to%20inquire%20about%20ordering/table%20booking" target="_blank" rel="noopener noreferrer" className="btn-whatsapp">
                    <i className="fa-brands fa-whatsapp"></i> Chat on WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Google Maps iframe integration */}
            <div className="contact-map-panel">
              <div className="map-container">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3801.3533810141673!2d78.94147787517175!3d17.570091398031548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb67d4faca5371%3A0xdab4327a955a0c5f!2sVarevva%20Restaurant!5e0!3m2!1sen!2sin!4v1717424600000!5m2!1sen!2sin" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Varevva Restaurant Location in Yadagirigutta"
                  id="gmap-iframe">
                </iframe>
              </div>
              <a href="https://maps.app.goo.gl/M5MYdeGL8intHNGd9" target="_blank" rel="noopener noreferrer" className="map-helper">
                <i className="fa-solid fa-diamond-turn-right"></i>
                <span>Located right on the main Yadagirigutta road. Click here to navigate directly on Google Maps.</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contact;
