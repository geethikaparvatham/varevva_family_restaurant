import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { fetchMenu, saveMenu } from '../data/db';
import type { MenuItem } from '../data/db';
import { Link, useLocation } from 'react-router-dom';

const Menu = () => {
  const { cart, addToCart, updateQuantity, setIsCheckoutOpen } = useCart();
  const { isAdmin, setIsLoginModalOpen, logout } = useAdmin();
  const location = useLocation();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDiet, setSelectedDiet] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal open states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [isSyncOpen, setIsSyncOpen] = useState(false);

  // Form states for Add/Edit
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [dishName, setDishName] = useState('');
  const [dishPrice, setDishPrice] = useState<number | ''>('');
  const [dishCategory, setDishCategory] = useState<'biryani' | 'starters' | 'curries' | 'chinese-rice' | 'rotis'>('biryani');
  const [dishDiet, setDishDiet] = useState<'veg' | 'non-veg'>('non-veg');
  const [dishPopular, setDishPopular] = useState(false);
  const [dishImage, setDishImage] = useState('');
  const [dishDescription, setDishDescription] = useState('');

  // Firebase Config Form States
  const [apiKey, setApiKey] = useState('');
  const [databaseURL, setDatabaseURL] = useState('');
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    loadMenu();
    loadFirebaseConfig();
  }, []);

  useEffect(() => {
    // Open checkout directly if directed via query parameter ?checkout=true
    const query = new URLSearchParams(location.search);
    if (query.get('checkout') === 'true') {
      setIsCheckoutOpen(true);
    }
  }, [location.search, setIsCheckoutOpen]);

  const loadMenu = async () => {
    setIsLoading(true);
    const data = await fetchMenu();
    setMenuItems(data);
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
      console.log("No Firebase config found.");
    }
  };

  const handleToggleStock = async (name: string) => {
    const updated = menuItems.map(item => {
      if (item.name === name) {
        return { ...item, outOfStock: !item.outOfStock };
      }
      return item;
    });
    setMenuItems(updated);
    await saveMenu(updated);
  };

  const handleRemoveDish = async (name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from the menu?`)) return;
    const updated = menuItems.filter(item => item.name !== name);
    setMenuItems(updated);
    await saveMenu(updated);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (menuItems.find(item => item.name.toLowerCase() === dishName.toLowerCase().trim())) {
      alert('A dish with this name already exists!');
      return;
    }

    const typePrefix = dishDiet === 'veg' ? 'v' : 'nv';
    const catPrefix = dishCategory.substring(0, 3);
    const newItem: MenuItem = {
      id: `cust-${typePrefix}-${catPrefix}-${Date.now()}`,
      name: dishName.trim(),
      price: Number(dishPrice),
      category: dishCategory,
      type: dishDiet,
      description: dishDescription.trim(),
      popular: dishPopular,
      image: dishImage.trim(),
      outOfStock: false
    };

    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    await saveMenu(updated);
    setIsAddOpen(false);
    resetForm();
  };

  const handleEditClick = (item: MenuItem) => {
    setSelectedItem(item);
    setDishName(item.name);
    setDishPrice(item.price);
    setDishCategory(item.category);
    setDishDiet(item.type);
    setDishPopular(item.popular);
    setDishImage(item.image);
    setDishDescription(item.description);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const updated = menuItems.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          name: dishName.trim(),
          price: Number(dishPrice),
          category: dishCategory,
          type: dishDiet,
          popular: dishPopular,
          image: dishImage.trim(),
          description: dishDescription.trim()
        };
      }
      return item;
    });

    setMenuItems(updated);
    await saveMenu(updated);
    setIsEditOpen(false);
    resetForm();
  };

  const handleImageClick = (item: MenuItem) => {
    setSelectedItem(item);
    setDishImage(item.image);
    setIsImageOpen(true);
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    const updated = menuItems.map(item => {
      if (item.id === selectedItem.id) {
        return { ...item, image: dishImage.trim() };
      }
      return item;
    });

    setMenuItems(updated);
    await saveMenu(updated);
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
      alert(`WARNING: You are currently on the live site.\n\nTo save database settings permanently, link on localhost first.`);
    }
  };

  const resetForm = () => {
    setSelectedItem(null);
    setDishName('');
    setDishPrice('');
    setDishCategory('biryani');
    setDishDiet('non-veg');
    setDishPopular(false);
    setDishImage('');
    setDishDescription('');
  };

  const getCategoryLabel = (cat: string) => {
    return {
      biryani: 'Biryani Special',
      starters: 'Starters',
      curries: 'Rich Curries',
      'chinese-rice': 'Chinese & Rice',
      rotis: 'Rotis & Breads'
    }[cat] || cat;
  };

  const categories = ['all', 'biryani', 'starters', 'curries', 'chinese-rice', 'rotis'];
  const diets = [
    { value: 'all', label: 'All Dishes', icon: 'fa-utensils' },
    { value: 'veg', label: 'Veg Only', icon: 'fa-leaf', className: 'text-veg' },
    { value: 'non-veg', label: 'Non-Veg Only', icon: 'fa-circle', className: 'text-nonveg' }
  ];

  // Filtering Logic
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesDiet = selectedDiet === 'all' || item.type === selectedDiet;
    const matchesSearch = searchQuery === '' || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesDiet && matchesSearch;
  });

  return (
    <>
      {/* Menu Header Page Banner */}
      <header style={{
        background: `var(--light-bg)`,
        padding: '105px 24px 15px',
        textAlign: 'left',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        color: 'var(--text-dark)'
      }}>
        <div className="container" style={{ padding: 0 }}>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-dark)', marginBottom: '4px', fontWeight: 800, letterSpacing: '-0.5px' }}>Food Menu</h1>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>Spice up your day with authentic Telangana Ruchulu</p>
        </div>
      </header>

      {/* Menu Main Section */}
      <section className="menu-section" style={{ padding: '24px 0' }}>
        <div className="container">
          
          {/* Controls: Search & Filters */}
          <div className="menu-controls">
            <div className="menu-search-wrapper">
              <i className="fa-solid fa-magnifying-glass search-icon"></i>
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')}>
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              )}
            </div>

            <div className="menu-filters-wrapper">
              <div className="diet-filter-buttons">
                {diets.map(diet => (
                  <button
                    key={diet.value}
                    className={`btn-filter-diet ${selectedDiet === diet.value ? 'active' : ''}`}
                    onClick={() => setSelectedDiet(diet.value)}
                  >
                    <i className={`fa-solid ${diet.icon} ${diet.className || ''}`}></i>
                    <span>{diet.label}</span>
                  </button>
                ))}
              </div>
              <button
                className={`btn-admin-portal ${isAdmin ? 'logged-in' : ''}`}
                onClick={() => {
                  if (isAdmin) {
                    if (confirm("Are you sure you want to log out from the Owner Portal?")) {
                      logout();
                    }
                  } else {
                    setIsLoginModalOpen(true);
                  }
                }}
                style={{ marginLeft: '12px' }}
              >
                {isAdmin ? (
                  <>
                    <i className="fa-solid fa-right-from-bracket"></i>
                    <span>Owner Logout</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-user-lock"></i>
                    <span>Owner Login</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="menu-tabs-container">
            <div className="menu-tabs">
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`menu-tab-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat === 'all' ? 'All Items' : getCategoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          {isAdmin && (
            <div className="admin-toolbar">
              <div className="admin-toolbar-title">
                <i className="fa-solid fa-user-shield" style={{ color: 'var(--primary-color)' }}></i>
                <span>Owner Portal Active</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button className="btn-admin-add-item" onClick={() => { resetForm(); setIsAddOpen(true); }}>
                  <i className="fa-solid fa-plus"></i> Add New Dish
                </button>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="menu-grid">
              <div className="menu-loading">
                <i className="fa-solid fa-spinner fa-spin"></i>
                <span>Loading Menu...</span>
              </div>
            </div>
          ) : (
            <div className="menu-grid">
              {filteredItems.length === 0 ? (
                <div className="menu-empty">
                  <i className="fa-solid fa-utensils"></i>
                  <h3>No Dishes Found</h3>
                  <p>We couldn't find any dishes matching "{searchQuery}". Try adjusting your filters or search keywords.</p>
                </div>
              ) : (
                filteredItems.map(item => {
                  const isVeg = item.type === 'veg';
                  const inCartItem = cart[item.name];

                  return (
                    <div className={`menu-item-card ${item.outOfStock ? 'out-of-stock' : ''}`} key={item.id}>
                      <div className="menu-item-main-row">
                        <div className="menu-item-text">
                          <div className="item-meta-row">
                            <span className={`diet-badge-fssai ${isVeg ? 'veg' : 'non-veg'}`} title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}>
                              <span className="diet-dot"></span>
                            </span>
                            {item.popular && (
                              <span className="popular-pill">
                                <i className="fa-solid fa-fire"></i> Highly Reordered
                              </span>
                            )}
                            {item.outOfStock && (
                              <span className="badge-out-of-stock">
                                <i className="fa-solid fa-circle-xmark"></i> Out of Stock
                              </span>
                            )}
                          </div>
                          
                          <Link to={`/item/${item.id}`} className="item-name-link">
                            <h3 className="item-name">{item.name}</h3>
                          </Link>
                          <span className="item-price">₹{item.price}</span>
                          <p className="item-desc">{item.description || 'Delicately cooked using traditional recipes with freshly ground spices.'}</p>
                          <span className="item-category-tag-desktop">{getCategoryLabel(item.category)}</span>
                        </div>

                        <div className="menu-item-action-side">
                          <div className="menu-item-image-wrapper">
                            <Link to={`/item/${item.id}`}>
                              <img
                                className="menu-item-img"
                                src={item.image || (isVeg ? 'https://varevva-family-restaurant.vercel.app/assets/paneer_butter_masala.png' : 'https://varevva-family-restaurant.vercel.app/assets/chicken_dum_biryani.png')}
                                alt={item.name}
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as any).onerror = null;
                                  (e.target as any).src = isVeg ? 'https://varevva-family-restaurant.vercel.app/assets/paneer_butter_masala.png' : 'https://varevva-family-restaurant.vercel.app/assets/chicken_dum_biryani.png';
                                }}
                              />
                            </Link>
                            <div className="menu-item-action-button-container">
                              {item.outOfStock ? (
                                <button className="btn-add-zomato" disabled style={{ backgroundColor: '#9ca3af', borderColor: '#9ca3af', color: 'white', cursor: 'not-allowed' }}>
                                  SOLD OUT
                                </button>
                              ) : inCartItem ? (
                                <div className="qty-selector-zomato">
                                  <button className="btn-qty-minus" onClick={() => updateQuantity(item.name, -1)}>-</button>
                                  <span className="qty-value">{inCartItem.quantity}</span>
                                  <button className="btn-qty-plus" onClick={() => addToCart(item.name, item.price)}>+</button>
                                </div>
                              ) : (
                                <button className="btn-add-zomato" onClick={() => addToCart(item.name, item.price)} title={`Add ${item.name} to order`}>
                                  ADD <i className="fa-solid fa-plus" style={{ fontSize: '0.75rem', marginLeft: '2px' }}></i>
                                </button>
                              )}
                            </div>
                          </div>
                          <span className="item-disclaimer-zomato">customisable</span>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="admin-card-controls">
                          <button className={`btn-admin-stock ${item.outOfStock ? 'btn-stock-out' : 'btn-stock-in'}`} onClick={() => handleToggleStock(item.name)}>
                            <i className={`fa-solid ${item.outOfStock ? 'fa-eye' : 'fa-eye-slash'}`}></i>
                            <span>{item.outOfStock ? 'Mark In Stock' : 'Mark Out of Stock'}</span>
                          </button>
                          <button className="btn-admin-edit" onClick={() => handleEditClick(item)}>
                            <i className="fa-solid fa-pen-to-square"></i>
                            <span>Edit</span>
                          </button>
                          <button className="btn-admin-edit-image" onClick={() => handleImageClick(item)}>
                            <i className="fa-solid fa-image"></i>
                            <span>Edit Image</span>
                          </button>
                          <button className="btn-admin-delete" onClick={() => handleRemoveDish(item.name)}>
                            <i className="fa-solid fa-trash-can"></i>
                            <span>Remove</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Menu Disclaimer Section */}
          <div className="menu-disclaimer">
            <p><i className="fa-solid fa-heart-pulse"></i> Healthy guidelines strictly enforced: <strong>No Artificial Food Colors & No MSG / Tasting Salt</strong> used.</p>
            <p><i className="fa-solid fa-circle-info"></i> All prices are inclusive of taxes. Parcels are packed in secure, hygienic food-grade boxes.</p>
          </div>
        </div>
      </section>

      {/* Add Dish Modal */}
      {isAddOpen && (
        <div className="order-modal-overlay admin-add-item-overlay" onClick={() => setIsAddOpen(false)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Add New Dish</h3>
              <button className="btn-close-modal" onClick={() => setIsAddOpen(false)}>&times;</button>
            </div>
            <form className="admin-modal-form" onSubmit={handleAddSubmit}>
              <div className="form-group">
                <label htmlFor="dish-name">Dish Name</label>
                <input type="text" id="dish-name" placeholder="e.g. Gongura Chicken Fry" value={dishName} onChange={(e) => setDishName(e.target.value)} required />
              </div>
              
              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="dish-price">Price (₹)</label>
                  <input type="number" id="dish-price" placeholder="e.g. 250" min="1" value={dishPrice} onChange={(e) => setDishPrice(Number(e.target.value) || '')} required />
                </div>
                <div className="form-group">
                  <label htmlFor="dish-category">Category</label>
                  <select id="dish-category" value={dishCategory} onChange={(e) => setDishCategory(e.target.value as any)} required>
                    <option value="biryani">Biryani Specials</option>
                    <option value="starters">Starters</option>
                    <option value="curries">Rich Curries</option>
                    <option value="chinese-rice">Chinese & Rice</option>
                    <option value="rotis">Rotis & Breads</option>
                  </select>
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="dish-diet">Diet Type</label>
                  <select id="dish-diet" value={dishDiet} onChange={(e) => setDishDiet(e.target.value as any)} required>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="veg">Vegetarian</option>
                  </select>
                </div>
                <div className="form-group checkbox-group" style={{ marginTop: '24px' }}>
                  <input type="checkbox" id="dish-popular" checked={dishPopular} onChange={(e) => setDishPopular(e.target.checked)} />
                  <label htmlFor="dish-popular">Highly Reordered</label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="dish-image">Dish Image URL / Path (Optional)</label>
                <input type="text" id="dish-image" placeholder="e.g. /assets/spicy_chicken_fry.png" value={dishImage} onChange={(e) => setDishImage(e.target.value)} />
              </div>

              <div className="form-group">
                <label htmlFor="dish-description">Description</label>
                <textarea id="dish-description" placeholder="Brief description of the dish..." rows={3} value={dishDescription} onChange={(e) => setDishDescription(e.target.value)} required></textarea>
              </div>

              <button type="submit" className="btn-admin-submit">Add to Menu</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Dish Modal */}
      {isEditOpen && (
        <div className="order-modal-overlay admin-edit-item-overlay" onClick={() => setIsEditOpen(false)}>
          <div className="order-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Edit Dish: {selectedItem?.name}</h3>
              <button className="btn-close-modal" onClick={() => setIsEditOpen(false)}>&times;</button>
            </div>
            <form className="admin-modal-form" onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label htmlFor="edit-dish-name">Dish Name</label>
                <input type="text" id="edit-dish-name" placeholder="e.g. Gongura Chicken Fry" value={dishName} onChange={(e) => setDishName(e.target.value)} required />
              </div>
              
              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="edit-dish-price">Price (₹)</label>
                  <input type="number" id="edit-dish-price" placeholder="e.g. 250" min="1" value={dishPrice} onChange={(e) => setDishPrice(Number(e.target.value) || '')} required />
                </div>
                <div className="form-group">
                  <label htmlFor="edit-dish-category">Category</label>
                  <select id="edit-dish-category" value={dishCategory} onChange={(e) => setDishCategory(e.target.value as any)} required>
                    <option value="biryani">Biryani Specials</option>
                    <option value="starters">Starters</option>
                    <option value="curries">Rich Curries</option>
                    <option value="chinese-rice">Chinese & Rice</option>
                    <option value="rotis">Rotis & Breads</option>
                  </select>
                </div>
              </div>

              <div className="form-row-grid">
                <div className="form-group">
                  <label htmlFor="edit-dish-diet">Diet Type</label>
                  <select id="edit-dish-diet" value={dishDiet} onChange={(e) => setDishDiet(e.target.value as any)} required>
                    <option value="non-veg">Non-Vegetarian</option>
                    <option value="veg">Vegetarian</option>
                  </select>
                </div>
                <div className="form-group checkbox-group" style={{ marginTop: '24px' }}>
                  <input type="checkbox" id="edit-dish-popular" checked={dishPopular} onChange={(e) => setDishPopular(e.target.checked)} />
                  <label htmlFor="edit-dish-popular">Highly Reordered</label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-dish-image">Dish Image URL / Path (Optional)</label>
                <input type="text" id="edit-dish-image" placeholder="e.g. /assets/spicy_chicken_fry.png" value={dishImage} onChange={(e) => setDishImage(e.target.value)} />
              </div>

              <div className="form-group">
                <label htmlFor="edit-dish-description">Description</label>
                <textarea id="edit-dish-description" placeholder="Brief description of the dish..." rows={3} value={dishDescription} onChange={(e) => setDishDescription(e.target.value)} required></textarea>
              </div>

              <button type="submit" className="btn-admin-submit">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Image Modal */}
      {isImageOpen && (
        <div className="order-modal-overlay admin-edit-image-overlay" onClick={() => setIsImageOpen(false)}>
          <div className="order-modal-card" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="order-modal-header">
              <h3>Edit Image: {selectedItem?.name}</h3>
              <button className="btn-close-modal" onClick={() => setIsImageOpen(false)}>&times;</button>
            </div>
            <form className="admin-modal-form" onSubmit={handleImageSubmit}>
              <div className="form-group">
                <label htmlFor="edit-dish-image-url">Image URL or Local Path</label>
                <input type="text" id="edit-dish-image-url" placeholder="e.g. /assets/dish.png or online URL" value={dishImage} onChange={(e) => setDishImage(e.target.value)} required />
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

export default Menu;
