import { Link } from 'react-router-dom';

const SpecialsGrid = () => {
  const sections = [
    {
      path: '/menu',
      icon: 'fa-utensils',
      title: 'Explore Food Menu',
      desc: 'Search our extensive list of Biryanis, Starters, Curries, Rotis, and Chinese items with exact prices.',
      btnText: 'Open Menu',
    },
    {
      path: '/specials',
      icon: 'fa-star',
      title: "Chef's Recommendations",
      desc: 'Check out our highly recommended specialties like Special Dum Biryani and Natukodi Fry.',
      btnText: 'View Specials',
    },
    {
      path: '/about',
      icon: 'fa-circle-info',
      title: 'Our Culinary Story',
      desc: 'Learn about our commitment to "No Colours & No Tasting Salt" and our spicy Telangana Ruchulu recipes.',
      btnText: 'Read Story',
    },
    {
      path: '/contact',
      icon: 'fa-location-dot',
      title: 'Location & Contact',
      desc: 'Get directions directly to the restaurant on Google Maps, check open timings, or order directly.',
      btnText: 'Get Details',
    },
  ];

  return (
    <section className="specials-section" style={{ padding: '60px 0', backgroundColor: 'var(--light-bg)' }}>
      <div className="container">
        <div className="section-header" style={{ marginBottom: '40px' }}>
          <span className="sub-heading">Welcome to Varevva</span>
          <h2 className="main-heading">Explore Our Sections</h2>
          <div className="heading-divider"></div>
        </div>

        <div className="specials-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
          {sections.map((section, idx) => (
            <Link
              key={idx}
              to={section.path}
              className="special-card"
              style={{
                padding: '30px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none'
              }}
            >
              <div
                style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--accent-color)',
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  fontSize: '2rem',
                }}
              >
                <i className={`fa-solid ${section.icon}`}></i>
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-header)',
                  fontSize: '1.3rem',
                  fontWeight: 700,
                  color: 'var(--dark-bg)',
                  marginBottom: '10px',
                }}
              >
                {section.title}
              </h3>
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.9rem',
                  marginBottom: '20px',
                  lineHeight: 1.5,
                }}
              >
                {section.desc}
              </p>
              <span
                style={{
                  fontFamily: 'var(--font-header)',
                  fontWeight: 700,
                  color: 'var(--accent-color)',
                  fontSize: '0.9rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {section.btnText} <i className="fa-solid fa-chevron-right"></i>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialsGrid;
