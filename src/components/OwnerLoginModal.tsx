import { useState } from 'react';
import { useAdmin } from '../context/AdminContext';

const OwnerLoginModal = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, login } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'admin' && login(password)) {
      setError(false);
      setIsLoginModalOpen(false);
      setUsername('');
      setPassword('');
    } else {
      setError(true);
      setPassword('');
    }
  };

  return (
    <div className="order-modal-overlay admin-login-overlay" onClick={() => setIsLoginModalOpen(false)}>
      <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="order-modal-header">
          <h3>Owner Login</h3>
          <button className="btn-close-modal" id="btn-close-admin-login" onClick={() => setIsLoginModalOpen(false)}>&times;</button>
        </div>
        <form className="admin-modal-form" id="admin-login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="admin-username">Username</label>
            <input
              type="text"
              id="admin-username"
              placeholder="Enter username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              required
              autoComplete="username"
            />
          </div>
          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              type="password"
              id="admin-password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              required
              autoComplete="current-password"
            />
          </div>
          {error && (
            <div id="admin-login-error" style={{ color: '#ef4444', fontSize: '0.85rem', display: 'block', textAlign: 'center', marginBottom: '10px' }}>
              <i className="fa-solid fa-circle-exclamation"></i> Invalid username or password!
            </div>
          )}
          <button type="submit" className="btn-admin-submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default OwnerLoginModal;
