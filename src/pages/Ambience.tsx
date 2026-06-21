const Ambience = () => {
  const images = [
    {
      className: 'gallery-item wide',
      src: 'https://varevva-family-restaurant.vercel.app/assets/ambience_1-BC_ZMhR_.png',
      alt: 'Main Restaurant Frontage',
      title: 'Welcoming night view of our Yadagirigutta Highway location',
      heading: 'Main Restaurant Frontage',
      desc: 'Welcoming night view of our Yadagirigutta Highway location.'
    },
    {
      className: 'gallery-item wide',
      src: 'https://varevva-family-restaurant.vercel.app/assets/ambience_2-CkOA5WYu.jpg',
      alt: 'Highway Landmark Banner',
      title: 'Easy to spot for pilgrims and travelers visiting Yadadri Temple',
      heading: 'Highway Landmark Banner',
      desc: 'Easy to spot for pilgrims and travelers visiting Yadadri Temple.'
    },
    {
      className: 'gallery-item large',
      src: 'https://varevva-family-restaurant.vercel.app/assets/ambience_4-BA4FbaIp.png',
      alt: 'Premium A/C Family Seating',
      title: 'Comfortable settings perfect for families and large dining groups',
      heading: 'Premium A/C Family Seating',
      desc: 'Comfortable settings perfect for families and large dining groups.'
    },
    {
      className: 'gallery-item wide',
      src: 'https://varevva-family-restaurant.vercel.app/assets/ambience_3-C8x94RDq.png',
      alt: 'Restaurant Entrance',
      title: 'Clean, hygienic, and well-designed entrance leading to the dining area',
      heading: 'Restaurant Entrance',
      desc: 'Clean, hygienic, and well-designed entrance leading to the dining area.'
    },
    {
      className: 'gallery-item wide',
      src: 'https://varevva-family-restaurant.vercel.app/assets/ambience_5-zguADdEj.jpg',
      alt: 'Spacious AC Dining Hall',
      title: 'Bright, welcoming interior with plenty of seating capacity',
      heading: 'Spacious AC Dining Hall',
      desc: 'Bright, welcoming interior with plenty of seating capacity.'
    }
  ];

  return (
    <>
      {/* Ambience Banner */}
      <header style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://varevva-family-restaurant.vercel.app/assets/restaurant_interior-CpXiFg0S.png') center/cover`,
        padding: '120px 0 60px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-header)', fontSize: '2.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Restaurant Ambience</h1>
          <p style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--primary-color)' }}>Cozy settings, A/C comforts, and a welcoming family atmosphere</p>
        </div>
      </header>

      {/* Gallery Section */}
      <section className="gallery-section" id="gallery" style={{ padding: '80px 0' }}>
        <div className="container">
          <div className="gallery-grid">
            {images.map((img, idx) => (
              <div key={idx} className={img.className} title={img.title}>
                <img src={img.src} alt={img.alt} />
                <div className="gallery-overlay">
                  <h4>{img.heading}</h4>
                  <p>{img.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default Ambience;
