import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fetchMenu, fetchSpecials } from '../data/db';
import type { MenuItem } from '../data/db';

const ItemDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { cart, addToCart, updateQuantity } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [specials, setSpecials] = useState<any[]>([]);
  const [item, setItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toastText, setToastText] = useState('');
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const menuData = await fetchMenu();
      const specialsData = await fetchSpecials();
      setMenuItems(menuData);
      setSpecials(specialsData);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    let foundItem = menuItems.find((i) => i.id === id);
    if (!foundItem) {
      // Look in specials
      const spec = specials.find((i) => i.id === id);
      if (spec) {
        foundItem = {
          id: spec.id,
          name: spec.name,
          price: spec.price.includes('/') ? 200 : parseInt(spec.price.replace(/[^\d]/g, '')) || 200,
          category: 'biryani',
          type: spec.type,
          image: spec.image,
          description: spec.description,
          popular: true,
          outOfStock: false,
        };
      }
    }
    setItem(foundItem || null);
  }, [id, menuItems, specials, isLoading]);

  if (isLoading) {
    return (
      <main style={{ flex: 1, padding: '120px 0 60px' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: 'var(--font-header)' }}>
            <i className="fa-solid fa-spinner fa-spin fa-2x" style={{ color: 'var(--primary-color)', marginBottom: '15px' }}></i>
            <p style={{ fontSize: '1.1rem' }}>Loading delicious details...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!item) {
    return (
      <main style={{ flex: 1, padding: '120px 0 60px' }}>
        <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ textAlign: 'center', padding: '80px 24px', background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-md)' }}>
            <i className="fa-solid fa-face-frown fa-4x" style={{ color: 'var(--primary-color)', marginBottom: '20px' }}></i>
            <h2 style={{ fontFamily: 'var(--font-header)', fontSize: '2rem', color: 'var(--text-dark)', marginBottom: '10px' }}>Dish Not Found</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '30px' }}>We couldn't find the dish you are looking for. It might have been updated or removed.</p>
            <Link to="/menu" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none', padding: '12px 30px', borderRadius: '50px', fontWeight: 700 }}>
              Browse Full Menu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const isVeg = item.type === 'veg';
  const inCartItem = cart[item.name];
  const relatedItems = menuItems.filter(
    (i) => i.category === item.category && i.id !== item.id && !i.outOfStock
  );

  const getCategoryLabel = (cat: string) => {
    return {
      biryani: 'Biryani Special',
      starters: 'Starters',
      curries: 'Rich Curries',
      'chinese-rice': 'Chinese & Rice',
      rotis: 'Rotis & Breads'
    }[cat] || cat;
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url)
      .then(() => {
        setToastText('Link copied to clipboard!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch(() => {
        setToastText('Failed to copy link. Please copy URL manually.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      });
  };

  const fallbackImage = isVeg
    ? 'https://varevva-family-restaurant.vercel.app/assets/paneer_butter_masala.png'
    : 'https://varevva-family-restaurant.vercel.app/assets/chicken_dum_biryani.png';

  const whatsappDirectUrl = `https://wa.me/916302019925?text=Hi%20Varevva%20Restaurant,%20I%20would%20like%20to%20order%20${encodeURIComponent(item.name)}%20(Price:%20₹${item.price})%20from%20your%20website.`;

  return (
    <main style={{ flex: 1, padding: '120px 0 60px' }}>
      <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 16px' }}>
        
        {/* Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/menu" className="btn-back-menu" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-header)', transition: 'var(--transition-smooth)' }}>
            <i className="fa-solid fa-arrow-left"></i> Back to Full Menu
          </Link>
        </div>

        {/* Item Details Card */}
        <div className="item-detail-card">
          {/* Left Column: Product Photo */}
          <div className="item-detail-img-wrapper" style={{ position: 'relative' }}>
            <img
              className="item-detail-img"
              src={item.image || fallbackImage}
              alt={item.name}
              onError={(e) => {
                (e.target as any).onerror = null;
                (e.target as any).src = fallbackImage;
              }}
            />
            <span className={`detail-diet-badge ${isVeg ? 'veg' : 'non-veg'}`} title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
              <span className="diet-dot"></span>
              {isVeg ? 'Veg' : 'Non-Veg'}
            </span>
            {item.popular && (
              <span style={{ position: 'absolute', top: '16px', right: '16px', backgroundColor: 'var(--accent-color)', color: 'white', padding: '6px 12px', borderRadius: '8px', fontFamily: 'var(--font-header)', fontWeight: 700, fontSize: '0.8rem', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="fa-solid fa-fire"></i> Best Seller
              </span>
            )}
          </div>

          {/* Right Column: Info & Actions */}
          <div className="item-detail-info">
            <div>
              <span className="item-detail-category">
                {getCategoryLabel(item.category)}
              </span>
              <h2 className="item-detail-title">
                {item.name}
              </h2>
              <div className="item-detail-price">
                ₹{item.price}
              </div>
              <p className="item-detail-desc">
                {item.description || "Delicately prepared using age-old traditional recipes with premium freshly sourced ingredients and hand-ground spices. Infused with rich authentic Telangana flavors."}
              </p>
              
              <div className="item-detail-meta-tags">
                <span className="item-detail-meta-tag"><i className="fa-solid fa-clock" style={{ color: 'var(--primary-color)' }}></i> 15-20 Mins Prep Time</span>
                <span className="item-detail-meta-tag"><i className="fa-solid fa-leaf" style={{ color: '#24963f' }}></i> No Added Color</span>
                <span className="item-detail-meta-tag"><i className="fa-solid fa-shield-halved" style={{ color: 'var(--accent-color)' }}></i> 100% Hygienic</span>
              </div>
            </div>

            <div className="item-detail-actions-divider" style={{ marginTop: '24px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '20px' }}>
              {/* Primary Actions */}
              <div className="item-detail-actions-row" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
                {item.outOfStock ? (
                  <button className="btn-detail-add btn-detail-add-disabled" disabled style={{ backgroundColor: '#9ca3af', borderColor: '#9ca3af', color: 'white', cursor: 'not-allowed' }}>
                    SOLD OUT
                  </button>
                ) : inCartItem ? (
                  <div className="detail-qty-selector" style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: '#fff', border: '1px solid var(--accent-color)', borderRadius: '8px', padding: '10px 16px', gap: '16px' }}>
                    <button className="btn-qty-minus detail-qty-btn" onClick={() => updateQuantity(item.name, -1)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer' }}>-</button>
                    <span className="qty-value" style={{ fontFamily: 'var(--font-header)', fontWeight: 700, fontSize: '1.2rem' }}>{inCartItem.quantity}</span>
                    <button className="btn-qty-plus detail-qty-btn" onClick={() => addToCart(item.name, item.price)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', color: 'var(--primary-color)', fontWeight: 700, cursor: 'pointer' }}>+</button>
                  </div>
                ) : (
                  <button className="btn-detail-add" onClick={() => addToCart(item.name, item.price)}>
                    ADD TO ORDER <i className="fa-solid fa-plus"></i>
                  </button>
                )}
                
                <a href={whatsappDirectUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp-direct">
                  <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.3rem' }}></i> ORDER VIA WHATSAPP
                </a>
              </div>

              {/* Share Action */}
              <button id="btn-share-dish" className="btn-share-dish" onClick={handleShare}>
                <i className="fa-solid fa-share-nodes"></i> Share this dish with friends
              </button>
            </div>
          </div>
        </div>

        {/* Related Items Section */}
        {relatedItems.length > 0 && (
          <div id="related-items-section" style={{ marginTop: '60px' }}>
            <h3 style={{ fontFamily: 'var(--font-header)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--dark-bg)', marginBottom: '24px', position: 'relative', paddingBottom: '10px', borderBottom: '2px solid rgba(0,0,0,0.05)' }}>
              You Might Also Like
            </h3>
            <div className="related-grid" id="related-items-grid">
              {relatedItems.slice(0, 3).map((rel) => {
                const isRelVeg = rel.type === 'veg';
                const relFallback = isRelVeg ? 'https://varevva-family-restaurant.vercel.app/assets/paneer_butter_masala.png' : 'https://varevva-family-restaurant.vercel.app/assets/chicken_dum_biryani.png';
                return (
                  <div className="related-item-card" key={rel.id}>
                    <div className="related-item-text">
                      <div className="item-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <span className={`diet-badge-fssai ${isRelVeg ? 'veg' : 'non-veg'}`} title={isRelVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
                          <span className="diet-dot"></span>
                        </span>
                        {rel.popular && (
                          <span className="popular-pill">
                            <i className="fa-solid fa-fire"></i> Popular
                          </span>
                        )}
                      </div>
                      <Link to={`/item/${rel.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h3 className="related-item-name">{rel.name}</h3>
                      </Link>
                      <span className="related-item-price">₹{rel.price}</span>
                    </div>
                    <div className="related-item-img-box">
                      <Link to={`/item/${rel.id}`}>
                        <img
                          className="related-item-img"
                          src={rel.image || relFallback}
                          alt={rel.name}
                          loading="lazy"
                          onError={(e) => {
                            (e.target as any).onerror = null;
                            (e.target as any).src = relFallback;
                          }}
                        />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Share Toast */}
      {showToast && (
        <div
          className="share-toast"
          style={{
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#333',
            color: '#fff',
            padding: '12px 24px',
            borderRadius: '50px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
            fontFamily: 'var(--font-header)',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'opacity 0.3s ease',
          }}
        >
          {toastText}
        </div>
      )}
    </main>
  );
};

export default ItemDetails;
