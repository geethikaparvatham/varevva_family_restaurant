import { useState, useEffect } from 'react';
import { useAdmin } from '../context/AdminContext';
import { fetchSpecials, saveSpecials } from '../data/db';
import type { SpecialItem } from '../data/db';

const Specials = () => {
  const { isAdmin, setIsLoginModalOpen, logout } = useAdmin();
  const [specials, setSpecials] = useState<SpecialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal open states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  // Form states for Add/Edit
  const [selectedSpecial, setSelectedSpecial] = useState<SpecialItem | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState<'veg' | 'non-veg'>('non-veg');
  const [tag, setTag] = useState('');
  const [tagIcon, setTagIcon] = useState('fa-fire');
  const [image, setImage] = useState('');
  const [description, setDescription] = useState('');

  // Firebase Config Form States
  const [apiKey, setApiKey] = useState('');
  const [databaseURL, setDatabaseURL] = useState('');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    loadSpecials();
    loadFirebaseConfig();
  }, []);

  const loadSpecials = async () => {
    setIsLoading(true);
    const data = await fetchSpecials();
    setSpecials(data);
    setIsLoading(false);
  };

  const loadFirebaseConfig = async () => {
    try {
      const res = await fetch('/firebase-config.json');
      if (res.ok) {
        const config = await res.json();
        setApiKey(config.apiKey || '');
        setDatabaseURL(config.databaseURL || '');
        setProjectId(config.projectId || '');
      }
    } catch (e) {
      console.log("No existing Firebase configuration found.");
    }
  };

  const handleRemove = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from specials recommendations?`)) return;
    const updated = specials.filter(item => item.id !== id);
    setSpecials(updated);
    await saveSpecials(updated);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (specials.find(item => item.name.toLowerCase() === name.toLowerCase().trim())) {
      alert('A special with this name already exists!');
      return;
    }

    const newItem: SpecialItem = {
      id: `special-cust-${Date.now()}`,
      name: name.trim(),
      price: price.trim(),
      type,
      tag: tag.trim(),
      tagIcon,
      image: image.trim() || 'https://varevva-family-restaurant.vercel.app/assets/chicken_dum_biryani.png',
      description: description.trim()
    };

    const updated = [...specials, newItem];
    setSpecials(updated);
    await saveSpecials(updated);
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditClick = (item: SpecialItem) => {
    setSelectedSpecial(item);
    setName(item.name);
    setPrice(item.price);
    setType(item.type);
    setTag(item.tag);
    setTagIcon(item.tagIcon);
    setImage(item.image);
    setDescription(item.description);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecial) return;

    const updated = specials.map(item => {
      if (item.id === selectedSpecial.id) {
        return {
          ...item,
          name: name.trim(),
          price: price.trim(),
          type,
          tag: tag.trim(),
          tagIcon,
          image: image.trim(),
          description: description.trim()
        };
      }
      return item;
    });

    setSpecials(updated);
    await saveSpecials(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const handleImageClick = (item: SpecialItem) => {
    setSelectedSpecial(item);
    setImage(item.image);
    setIsImageOpen(true);
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSpecial) return;

    const updated = specials.map(item => {
      if (item.id === selectedSpecial.id) {
        return { ...item, image: image.trim() };
      }
      return item;
    });

    setSpecials(updated);
    await saveSpecials(updated);
    setIsImageOpen(false);
    resetForm();
  };

  const handleSyncSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const config = { apiKey: apiKey.trim(), databaseURL: databaseURL.trim(), projectId: projectId.trim() };
    
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      try {
        const res = await fetch('/api/save-firebase-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ config })
        });
        if (res.ok) {
          alert('Firebase Database Configuration saved successfully!\n\nTo apply sync to live site, deploy your code.');
          setIsSyncOpen(false);
          window.location.reload();
        } else {
          const err = await res.json();
          alert(`Failed to save: ${err.message}`);
        }
      } catch (err: any) {
        alert(`API Error: ${err.message}`);
      }
    } else {
      alert(`WARNING: You are currently on the live site.\n\nTo save database settings permanently, please run the website locally on localhost first, link the database there, and redeploy.`);
    }
  };

  const resetForm = () => {
    setSelectedSpecial(null);
    setName('');
    setPrice('');
    setType('non-veg');
    setTag('');
    setTagIcon('fa-fire');
    setImage('');
    setDescription('');
  };

  return (
    <>
      {/* Specials Banner */}
      <header style={{
        background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url('https://varevva-family-restaurant.vercel.app/assets/chicken_dum_biryani.png') center/cover`,
        padding: '120px 0 60px',
        textAlign: 'center',
        color: 'white'
      }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-header)', fontSize: '2.8rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>Chef's Recommendations</h1>
          <p style={{ fontFamily: 'var(--font-accent)', fontStyle: 'italic', fontSize: '1.2rem', color: 'var(--primary-color)' }}>Handpicked local delicacies cooked with home-style care</p>
        </div>
      </header>

      {/* Specials Grid */}
      <section className="specials-section" id="specials" style={{ padding: '80px 0' }}>
        <div className="container">
          <div id="specials-controls" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '30px' }}>
            <button
              onClick={() => {
                if (isAdmin) {
                  if (confirm("Are you sure you want to log out from the Owner Portal?")) {
                    logout();
                  }
                } else {
                  setIsLoginModalOpen(true);
                }
              }}
              className={`btn-admin-portal ${isAdmin ? 'logged-in' : ''}`}
            >
              {isAdmin ? (
                <>
                  <i className="fa-solid fa-right-from-bracket"></i> <span>Owner Logout</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-lock"></i> <span>Owner Login</span>
                </>
              )}
            </button>
          </div>

          {isAdmin && (
            <div className="admin-toolbar" style={{ marginBottom: '24px' }}>
              <div className="admin-toolbar-title">
                <i className="fa-solid fa-user-shield" style={{ color: 'var(--primary-color)' }}></i>
                <span>Owner Portal Active</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn-admin-add-item" onClick={() => { resetForm(); setIsAddOpen(true); }}>
                  <i className="fa-solid fa-plus"></i> Add New Special
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="specials-grid">
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: 'var(--font-header)' }}>
                <i className="fa-solid fa-spinner fa-spin"></i> Loading Chef's Recommendations...
              </div>
            </div>
          ) : (
            <div className="specials-grid">
              {specials.map((item) => (
                <div className={`special-card card-${item.type}`} key={item.id}>
                  <div className="special-img-wrapper" style={{ position: 'relative', overflow: 'hidden', height: '230px' }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'var(--transition-smooth)' }}
                      onError={(e) => {
                        (e.target as any).onerror = null;
                        (e.target as any).src = item.type === 'veg' ? 'https://varevva-family-restaurant.vercel.app/assets/paneer_butter_masala.png' : 'https://varevva-family-restaurant.vercel.app/assets/chicken_dum_biryani.png';
                      }}
                    />
                    <span className={`diet-badge ${item.type === 'veg' ? 'veg' : 'nonveg'}`}>
                      <span className="dot"></span>
                      {item.type === 'veg' ? 'Veg' : 'Non-Veg'}
                    </span>
                  </div>
                  <div className="special-body" style={{ padding: '24px' }}>
                    <div className="special-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <span className="special-price" style={{ marginBottom: 0 }}>{item.price}</span>
                    </div>
                    <h3 style={{ marginTop: 0, fontSize: '1.3rem', transition: 'var(--transition-smooth)' }}>{item.name}</h3>
                    <p style={{ marginBottom: '20px' }}>{item.description}</p>
                    <div className="special-footer">
                      <span className="special-tag"><i className={`fa-solid ${item.tagIcon || 'fa-fire'}`}></i> {item.tag}</span>
                      <a href={`https://wa.me/916302019925?text=Hi%20Varevva%20Restaurant,%20I%20would%20like%20to%20order%20${encodeURIComponent(item.name)}`} target="_blank" rel="noopener noreferrer" className="btn-icon-order" title="Order via WhatsApp">
                        <i className="fa-brands fa-whatsapp"></i>
                      </a>
                    </div>
                    
                    {isAdmin && (
                      <div className="special-card-admin-actions" style={{ marginTop: '15px', borderTop: '1px dashed rgba(0, 0, 0, 0.08)', paddingTop: '15px', display: 'flex', flexWrap: 'wrap', gap: '12px', width: '100%' }}>
                        <button className="btn-admin-edit" style={{ flex: 1, minWidth: '70px' }} onClick={() => handleEditClick(item)}>
                          <i className="fa-solid fa-pen-to-square"></i> Edit
                        </button>
                        <button className="btn-admin-edit-image" style={{ flex: 1, minWidth: '100px' }} onClick={() => handleImageClick(item)}>
                          <i className="fa-solid fa-image"></i> Image
                        </button>
                        <button className="btn-admin-delete" onClick={() => handleRemove(item.id, item.name)}>
                          <i className="fa-solid fa-trash-can"></i> Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add Special Modal */}
      {isAddOpen && (
        <div className="order-modal-overlay admin-add-item-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Add New Special</h3>
              <button className="btn-close-modal" onClick={() => setIsAddOpen(false)}>&times;</button>
            </div>
            <form className="admin-modal-form" onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label htmlFor="special-name">Special Name</label>
                <input type="text" id="special-name" placeholder="e.g. Special Chicken Dum Biryani" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              
              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="special-price">Price Display (e.g. ₹200 / ₹350)</label>
                  <input type="text" id="special-price" placeholder="e.g. ₹200 / ₹350" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="special-diet">Diet Type</label>
                  <select id="special-diet" value={type} onChange={(e) => setType(e.target.value as any)} required>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="veg">Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="special-tag-text">Badge Tag Text</label>
                  <input type="text" id="special-tag-text" placeholder="e.g. Best Seller" value={tag} onChange={(e) => setTag(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="special-tag-icon">Badge Icon</label>
                  <select id="special-tag-icon" value={tagIcon} onChange={(e) => setTagIcon(e.target.value)} required>
                    <option value="fa-fire">Fire</option>
                    <option value="fa-pepper-hot">Pepper</option>
                    <option value="fa-leaf">Leaf</option>
                    <option value="fa-star">Star</option>
                    <option value="fa-thumbs-up">Thumbs Up</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="special-image">Special Image URL / Path (Optional)</label>
                <input type="text" id="special-image" placeholder="e.g. /assets/chicken_dum_biryani.png" value={image} onChange={(e) => setImage(e.target.value)} />
              </div>

              <div className="form-group">
                <label htmlFor="special-description">Description</label>
                <textarea id="special-description" placeholder="Aromatic description..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              </div>

              <button type="submit" className="btn-admin-submit">Add Special</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Special Modal */}
      {isEditOpen && (
        <div className="order-modal-overlay admin-edit-special-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Edit Special</h3>
              <button className="btn-close-modal" onClick={() => setIsEditOpen(false)}>&times;</button>
            </div>
            <form className="admin-modal-form" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-special-name">Special Name</label>
                <input type="text" id="edit-special-name" placeholder="e.g. Special Chicken Dum Biryani" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              
              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="edit-special-price">Price Display (e.g. ₹200 / ₹350)</label>
                  <input type="text" id="edit-special-price" placeholder="e.g. ₹200 / ₹350" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-special-diet">Diet Type</label>
                  <select id="edit-special-diet" value={type} onChange={(e) => setType(e.target.value as any)} required>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="veg">Vegetarian</option>
                  </select>
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="edit-special-tag-text">Badge Tag Text</label>
                  <input type="text" id="edit-special-tag-text" placeholder="e.g. Best Seller" value={tag} onChange={(e) => setTag(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-special-tag-icon">Badge Icon</label>
                  <select id="edit-special-tag-icon" value={tagIcon} onChange={(e) => setTagIcon(e.target.value)} required>
                    <option value="fa-fire">Fire</option>
                    <option value="fa-pepper-hot">Pepper</option>
                    <option value="fa-leaf">Leaf</option>
                    <option value="fa-star">Star</option>
                    <option value="fa-thumbs-up">Thumbs Up</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-special-image">Special Image URL / Path (Optional)</label>
                <input type="text" id="edit-special-image" placeholder="e.g. /assets/chicken_dum_biryani.png" value={image} onChange={(e) => setImage(e.target.value)} />
              </div>

              <div className="form-group">
                <label htmlFor="edit-special-description">Description</label>
                <textarea id="edit-special-description" placeholder="Aromatic description..." rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
              </div>

              <button type="submit" className="btn-admin-submit">Save Special Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {isImageOpen && (
        <div className="order-modal-overlay admin-edit-image-overlay" onClick={() => setIsImageOpen(false)}>
          <div className="order-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Edit Image: {selectedSpecial?.name}</h3>
              <button className="btn-close-modal" onClick={() => setIsImageOpen(false)}>&times;</button>
            </div>
            <form className="admin-modal-form" onSubmit={handleImageSubmit}>
              <div className="form-group">
                <label htmlFor="edit-image-url">Image URL or Local Path</label>
                <input type="text" id="edit-image-url" placeholder="e.g. /assets/dish.png or online URL" value={image} onChange={(e) => setImage(e.target.value)} required />
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: 1.4 }}>
                  <i className="fa-solid fa-info-circle"></i> Enter an online link or a local static path. This will be saved permanently.
                </p>
              </div>
              <button type="submit" className="btn-admin-submit" style={{ backgroundColor: '#8b5cf6' }}>Save Image</button>
            </form>
          </div>
        </div>
      )}

      {/* Database Sync Modal */}
      {isSyncOpen && (
        <div className="order-modal-overlay admin-firebase-config-overlay" onClick={() => setIsSyncOpen(false)}>
          <div className="order-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Database Sync Configuration</h3>
              <button className="btn-close-modal" onClick={() => setIsSyncOpen(false)}>&times;</button>
            </div>
            <form className="admin-modal-form" onSubmit={handleSyncSubmit}>
              <div className="form-group">
                <label htmlFor="fb-api-key">Firebase Web API Key</label>
                <input type="text" id="fb-api-key" placeholder="AIzaSy..." value={apiKey} onChange={(e) => setApiKey(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="fb-db-url">Firebase Database URL</label>
                <input type="url" id="fb-db-url" placeholder="https://your-db.firebaseio.com" value={databaseURL} onChange={(e) => setDatabaseURL(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="fb-project-id">Firebase Project ID</label>
                <input type="text" id="fb-project-id" placeholder="varevva-family-restaurant" value={projectId} onChange={(e) => setProjectId(e.target.value)} required />
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '8px 0 16px', lineHeight: 1.4 }}>
                <i className="fa-solid fa-circle-info"></i> Connecting to Firebase Realtime Database allows changes made on one device to sync to all customers' browsers and all devices instantly!
              </p>
              <button type="submit" className="btn-admin-submit" style={{ backgroundColor: '#f59e0b' }}>Link Database</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Specials;
