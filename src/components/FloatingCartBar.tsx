import { useCart } from '../context/CartContext';

const FloatingCartBar = () => {
  const { cartCount, cartTotal, setIsCheckoutOpen } = useCart();

  if (cartCount === 0) return null;

  return (
    <div className="floating-cart-bar">
      <div className="cart-info">
        <div className="cart-icon-wrapper">
          <i className="fa-solid fa-cart-shopping"></i>
          <span className="cart-badge">{cartCount}</span>
        </div>
        <span>{cartCount} Item{cartCount > 1 ? 's' : ''} | ₹{cartTotal}</span>
      </div>
      <button className="cart-btn-order" id="btn-cart-whatsapp-order" onClick={() => setIsCheckoutOpen(true)}>
        <span>Order on WhatsApp</span>
        <i className="fa-solid fa-arrow-right"></i>
      </button>
    </div>
  );
};

export default FloatingCartBar;
