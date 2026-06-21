import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

const VAREVVA_COORDS = { lat: 17.5700914, lng: 78.9440528 };

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => x * (Math.PI / 180);
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const rLat1 = toRad(lat1);
  const rLat2 = toRad(lat2);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(rLat1) * Math.cos(rLat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const R = 6371; // Earth radius in km
  return R * c;
}

function base64UrlSafeEncode(obj: any) {
  const str = JSON.stringify(obj);
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const CheckoutModal = () => {
  const {
    cart,
    cartTotal,
    updateQuantity,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen
  } = useCart();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [diningPreference, setDiningPreference] = useState('dine-in');
  const [address, setAddress] = useState('');
  
  // Geolocation states
  const [isVerifyingLocation, setIsVerifyingLocation] = useState(false);
  const [isLocationVerified, setIsLocationVerified] = useState(false);
  const [locationStatusText, setLocationStatusText] = useState('Not verified yet');
  const [locationStatusColor, setLocationStatusColor] = useState('var(--text-muted)');
  const [calculatedDistance, setCalculatedDistance] = useState<string | null>(null);

  // Success states
  const [orderGenerated, setOrderGenerated] = useState(false);
  const [generatedToken, setGeneratedToken] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [verificationUrl, setVerificationUrl] = useState('');

  const cartItems = Object.values(cart);

  useEffect(() => {
    // Reset states when modal is opened/closed
    if (isCheckoutOpen) {
      setOrderGenerated(false);
      setName('');
      setPhone('');
      setDiningPreference('dine-in');
      setAddress('');
      setIsLocationVerified(false);
      setCalculatedDistance(null);
      setLocationStatusText('Not verified yet');
      setLocationStatusColor('var(--text-muted)');
      setVerificationUrl('');
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleClose = () => {
    setIsCheckoutOpen(false);
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatusColor('#ef4444');
      setLocationStatusText('GPS not supported. Manual allowed.');
      setIsLocationVerified(true);
      return;
    }

    setIsVerifyingLocation(true);
    setLocationStatusColor('var(--text-dark)');
    setLocationStatusText('Checking GPS...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;

        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${userLng},${userLat};${VAREVVA_COORDS.lng},${VAREVVA_COORDS.lat}?overview=false`;

        fetch(osrmUrl)
          .then((res) => res.json())
          .then((data) => {
            let distance = 0;
            if (data.code === 'Ok' && data.routes && data.routes[0]) {
              distance = data.routes[0].distance / 1000;
            } else {
              distance = haversineDistance(VAREVVA_COORDS.lat, VAREVVA_COORDS.lng, userLat, userLng);
            }

            const distStr = distance.toFixed(2);
            setCalculatedDistance(distStr);

            if (distance <= 4) {
              setLocationStatusColor('#10b981');
              setLocationStatusText(`Delivery available (${distStr} km)`);
              setIsLocationVerified(true);
            } else {
              setLocationStatusColor('#ef4444');
              setLocationStatusText(`Delivery not available (${distStr} km)`);
              setIsLocationVerified(false);
              alert(`Delivery address is outside our 4km delivery range. Distance calculated: ${distStr} km from restaurant. Please choose Dine-in or Takeaway instead.`);
            }
            setIsVerifyingLocation(false);
          })
          .catch((err) => {
            console.error('OSRM fetch error, falling back to Haversine:', err);
            const distance = haversineDistance(VAREVVA_COORDS.lat, VAREVVA_COORDS.lng, userLat, userLng);
            const distStr = distance.toFixed(2);
            setCalculatedDistance(distStr);

            if (distance <= 4) {
              setLocationStatusColor('#10b981');
              setLocationStatusText(`Delivery available (${distStr} km)`);
              setIsLocationVerified(true);
            } else {
              setLocationStatusColor('#ef4444');
              setLocationStatusText(`Delivery not available (${distStr} km)`);
              setIsLocationVerified(false);
              alert(`Delivery address is outside our 4km delivery range. Distance calculated: ${distStr} km from restaurant. Please choose Dine-in or Takeaway instead.`);
            }
            setIsVerifyingLocation(false);
          });
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationStatusColor('#d97706');
        setLocationStatusText('GPS failed. Manual allowed.');
        setIsLocationVerified(true);
        setIsVerifyingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      alert("Please enter a valid 10-digit mobile number starting with 9, 8, 7, or 6.");
      return;
    }

    if (diningPreference === 'delivery' && !isLocationVerified) {
      alert("Please verify your location first by clicking 'Detect Distance'.");
      return;
    }

    const token = `VRV-${Math.floor(1000 + Math.random() * 9000)}`;
    setGeneratedToken(token);

    // Build items for bill verification base64 string
    const itemsEncoded = cartItems.map((item) => {
      // Find item ID or default
      return [item.name, item.quantity, item.price];
    });

    let prefVal = 1; // Takeaway default
    if (diningPreference === 'dine-in') prefVal = 0;
    else if (diningPreference === 'delivery') prefVal = 2;

    const verificationPayload: any = {
      n: name,
      p: phone,
      t: prefVal,
      k: token,
      i: itemsEncoded
    };

    if (diningPreference === 'delivery') {
      verificationPayload.a = address;
    }

    const encodedBill = base64UrlSafeEncode(verificationPayload);
    const verUrl = `${window.location.origin}/verify?o=${encodedBill}`;
    setVerificationUrl(verUrl);

    // Format WhatsApp Message
    let text = `*Order Token: ${token}*\n`;
    text += `*Customer:* ${name}\n`;
    text += `*Phone:* ${phone}\n`;
    const preferenceLabel = diningPreference === 'dine-in' ? 'Dine-in (Eating at Restaurant)' : 
                          diningPreference === 'delivery' ? 'Door Delivery (within 4km radius)' : 'Takeaway / Parcel';
    text += `*Option:* ${preferenceLabel}\n`;

    if (diningPreference === 'delivery') {
      text += `*Delivery Address:* ${address}\n`;
      if (calculatedDistance) {
        text += `*GPS Distance:* ${calculatedDistance} km\n`;
      }
    }
    text += `-------------------------\n`;
    text += `*Items Ordered:*\n`;
    cartItems.forEach((item, idx) => {
      text += `${idx + 1}. ${item.name} x ${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    text += `-------------------------\n`;
    text += `*Total Amount:* ₹${cartTotal}\n\n`;
    text += `*Verify Original Price & Bill:*\n${verUrl}\n\n`;
    text += `Please confirm my order. Thank you!`;

    const finalWhatsappUrl = `https://wa.me/916302019925?text=${encodeURIComponent(text)}`;
    setWhatsappUrl(finalWhatsappUrl);
    setOrderGenerated(true);
    clearCart(); // Clear cart immediately upon successful generation of order
  };

  const handleFinish = () => {
    clearCart();
    setIsCheckoutOpen(false);
  };

  return (
    <div className="order-modal-overlay" onClick={handleClose}>
      <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-header">
          <h3>{orderGenerated ? 'Order Generated!' : 'Order Details'}</h3>
          <button className="btn-close-modal" onClick={handleClose}>&times;</button>
        </div>

        {!orderGenerated ? (
          <>
            <div className="order-modal-summary">
              <label style={{ fontFamily: 'var(--font-header)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-dark)', display: 'block', marginBottom: '8px' }}>
                Order Summary
              </label>
              <div className="modal-summary-box">
                <div className="modal-items-list">
                  {cartItems.map((item) => (
                    <div className="modal-summary-item" key={item.name}>
                      <div className="summary-item-info">
                        <span className="summary-item-name">{item.name}</span>
                        <span className="summary-item-price">₹{item.price} each</span>
                      </div>
                      <div className="summary-item-actions">
                        <div className="modal-qty-control">
                          <button type="button" className="btn-modal-qty-minus" onClick={() => updateQuantity(item.name, -1)}>-</button>
                          <span className="modal-qty-value">{item.quantity}</span>
                          <button type="button" className="btn-modal-qty-plus" onClick={() => updateQuantity(item.name, 1)}>+</button>
                        </div>
                        <span className="summary-item-subtotal">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="modal-summary-total">
                  <span>Total Cost:</span>
                  <span>₹{cartTotal}</span>
                </div>
              </div>
            </div>

            <form className="order-modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="cust-name">Your Name</label>
                <input
                  type="text"
                  id="cust-name"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="cust-phone">Phone Number</label>
                <input
                  type="tel"
                  id="cust-phone"
                  placeholder="Enter 10-digit mobile number"
                  pattern="[6-9][0-9]{9}"
                  title="Please enter a valid 10-digit mobile number starting with 9, 8, 7, or 6"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="order-type">Dining Preference</label>
                <select
                  id="order-type"
                  value={diningPreference}
                  onChange={(e) => {
                    setDiningPreference(e.target.value);
                    setIsLocationVerified(false);
                    setCalculatedDistance(null);
                    setLocationStatusText('Not verified yet');
                    setLocationStatusColor('var(--text-muted)');
                  }}
                >
                  <option value="dine-in">Dine-in (Eating at Restaurant)</option>
                  <option value="takeaway">Takeaway / Parcel</option>
                  <option value="delivery">Door Delivery (within 4km radius)</option>
                </select>
              </div>

              {diningPreference === 'delivery' && (
                <div id="delivery-fields" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px', borderTop: '1px dashed rgba(0,0,0,0.08)', paddingTop: '12px' }}>
                  <div className="form-group">
                    <label htmlFor="cust-address">Delivery Address</label>
                    <textarea
                      id="cust-address"
                      placeholder="Enter your full address with landmark"
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--border-radius-sm)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        outline: 'none',
                        fontFamily: 'var(--font-accent)',
                        fontSize: '0.95rem',
                        transition: 'var(--transition-smooth)',
                        width: '100%',
                        resize: 'vertical'
                      }}
                      required
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Location Verification</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                      <button
                        type="button"
                        id="btn-detect-location"
                        className="btn-admin-submit"
                        style={{ padding: '8px 14px', fontSize: '0.85rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 0 }}
                        onClick={detectLocation}
                        disabled={isVerifyingLocation}
                      >
                        {isVerifyingLocation ? (
                          <i className="fa-solid fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fa-solid fa-location-crosshairs"></i>
                        )}
                        Detect Distance
                      </button>
                      <span id="location-status" style={{ fontSize: '0.82rem', fontWeight: 500, color: locationStatusColor }}>
                        {isVerifyingLocation ? 'Checking GPS...' : locationStatusText}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.3 }}>
                      Note: Delivery is free within 4km from Varevva. If GPS fails, manual override is allowed.
                    </p>
                  </div>
                </div>
              )}

              <button type="submit" className="btn-submit-order">
                <span>Get Token & Order on WhatsApp</span>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
            </form>
          </>
        ) : (
          <div className="order-success-screen">
            <div className="success-icon">
              <i className="fa-solid fa-check"></i>
            </div>
            <h3>Order Generated!</h3>
            <p className="success-desc">Click the button below to send your order on WhatsApp to confirm.</p>
            
            <div className="token-box">
              <div className="token-title">Your Order Token</div>
              <div className="token-number">{generatedToken}</div>
            </div>
            
            <div style={{ margin: '15px 0', textAlign: 'center', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Digital Bill Link: </span>
              <a 
                href={verificationUrl}
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--primary-color)', fontWeight: 600, textDecoration: 'underline' }}
              >
                Click to Verify Bill
              </a>
            </div>
            
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-submit-order"
              id="btn-send-whatsapp-now"
              style={{ width: '100%', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <i className="fa-brands fa-whatsapp" style={{ fontSize: '1.3rem' }}></i>
              <span>Send on WhatsApp</span>
            </a>
            
            <button className="btn-success-done" onClick={handleFinish} style={{ width: '100%' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
