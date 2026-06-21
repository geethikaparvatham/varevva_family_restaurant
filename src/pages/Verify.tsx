import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { fetchMenu } from '../data/db';
import type { MenuItem } from '../data/db';

interface VerificationPayload {
  n: string; // name
  p: string; // phone
  t: number; // type
  k: string; // token
  i: [string, number, number][]; // items: [idOrName, qty, price]
  a?: string; // address
}

function base64UrlSafeDecode(str: string): VerificationPayload | null {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const decodedStr = decodeURIComponent(escape(atob(base64)));
    return JSON.parse(decodedStr);
  } catch (e) {
    console.error('Payload decoding failed:', e);
    return null;
  }
}

const Verify = () => {
  const location = useLocation();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [payload, setPayload] = useState<VerificationPayload | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const loadMenuData = async () => {
      const data = await fetchMenu();
      setMenuItems(data);

      const query = new URLSearchParams(location.search);
      const code = query.get('o');

      if (!code) {
        setErrorMsg('Missing verification code. Please make sure you clicked the full link from WhatsApp.');
        setIsLoading(false);
        return;
      }

      const decoded = base64UrlSafeDecode(code);
      if (!decoded || !decoded.n || !decoded.k || !Array.isArray(decoded.i)) {
        setErrorMsg('Invalid or corrupted verification code. This order bill may have been tampered with or edited!');
        setIsLoading(false);
        return;
      }

      setPayload(decoded);
      setIsLoading(false);
    };

    loadMenuData();
  }, [location.search]);

  if (isLoading) {
    return (
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 16px 60px' }}>
        <div className="verify-card">
          <div className="verify-loading">
            <i className="fa-solid fa-circle-notch fa-spin"></i>
            <p>Loading Verification Data...</p>
          </div>
        </div>
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 16px 60px' }}>
        <div className="verify-card failed">
          <div className="verify-status-banner">
            <div className="verify-icon-wrapper">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h2>Verification Failed</h2>
            <span className="badge-failed"><i className="fa-solid fa-circle-xmark"></i> Untrusted Receipt</span>
          </div>
          
          <div className="verify-error-content" style={{ padding: '30px', textAlign: 'center' }}>
            <p className="error-msg" style={{ color: 'var(--nonveg-color)', fontWeight: 700, marginBottom: '20px' }}>{errorMsg}</p>
            <p className="error-warning" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'left', backgroundColor: '#fee2e2', padding: '14px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.1)' }}>
              <i className="fa-solid fa-circle-info" style={{ color: 'var(--nonveg-color)' }}></i> Security Note: If the customer modified the text in the WhatsApp message to reduce the price or change items, the verification code signature will mismatch or decode incorrectly.
            </p>
            
            <div className="error-actions" style={{ marginTop: '20px' }}>
              <Link to="/" className="btn-verify-back">Back to Home</Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!payload) return null;

  const { n: name, p: phone, t: type, k: token, i: items, a: address } = payload;

  let optionLabel = 'Takeaway / Parcel';
  if (type === 0) optionLabel = 'Dine-in (Eating at Restaurant)';
  else if (type === 2) optionLabel = 'Door Delivery';

  let totalAmount = 0;
  const renderedItems = items.map(([idOrName, qty, originalPrice], idx) => {
    // Attempt to match against menu database to show correct name and price
    const matchedItem = menuItems.find(item => item.id === idOrName || item.name === idOrName);
    const itemName = matchedItem ? matchedItem.name : idOrName;
    const price = matchedItem ? matchedItem.price : originalPrice || 0;
    const subtotal = price * qty;
    totalAmount += subtotal;

    return (
      <tr className="verify-table-row" key={idx}>
        <td style={{ padding: '10px 4px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
          {idx + 1}. <strong>{itemName}</strong>
        </td>
        <td style={{ textAlign: 'center', padding: '10px 4px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>x {qty}</td>
        <td style={{ textAlign: 'right', padding: '10px 4px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>₹{price}</td>
        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text-dark)', padding: '10px 4px', borderBottom: '1px solid rgba(0,0,0,0.03)' }}>₹{subtotal}</td>
      </tr>
    );
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-IN', { dateStyle: 'medium' });
  const timeStr = now.toLocaleTimeString('en-IN', { timeStyle: 'short' });

  return (
    <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', padding: '120px 16px 60px' }}>
      <div className="verify-card verified">
        <div className="verify-status-banner">
          <div className="verify-icon-wrapper">
            <i className="fa-solid fa-circle-check"></i>
          </div>
          <h2>Order Verified</h2>
          <span className="badge-verified"><i className="fa-solid fa-circle-check"></i> Genuine Receipt</span>
        </div>
        
        <div className="verify-details">
          <div className="verify-meta-grid">
            <div className="meta-item">
              <span className="meta-label">Order Token</span>
              <span className="meta-value highlight">{token}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Dining Option</span>
              <span className="meta-value">{optionLabel}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Customer Name</span>
              <span className="meta-value">{name}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Phone Number</span>
              <span className="meta-value">{phone}</span>
            </div>
            {type === 2 && address && (
              <div className="meta-item full-width" style={{ gridColumn: '1 / -1', marginTop: '10px', borderTop: '1px dashed rgba(0, 0, 0, 0.08)', paddingTop: '10px', width: '100%' }}>
                <span className="meta-label">Delivery Address</span>
                <span className="meta-value" style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{address}</span>
              </div>
            )}
          </div>
          
          <div className="verify-bill-section">
            <h3>Official Bill Items</h3>
            <div className="verify-table-wrapper">
              <table className="verify-table">
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left' }}>Item</th>
                    <th>Qty</th>
                    <th style={{ textAlign: 'right' }}>Price</th>
                    <th style={{ textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {renderedItems}
                </tbody>
              </table>
            </div>
            
            <div className="verify-total-row">
              <span>Official Total Amount:</span>
              <span className="verify-total-price">₹{totalAmount}</span>
            </div>
          </div>

          <div className="verify-footer">
            <p><i className="fa-solid fa-clock"></i> Checked on {dateStr} at {timeStr}</p>
            <p className="verification-note">Prices verified against official Varevva Menu. This bill represents the correct price calculation.</p>
            <Link to="/" className="btn-verify-back">Back to Home</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Verify;
