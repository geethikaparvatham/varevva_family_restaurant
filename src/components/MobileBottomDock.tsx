import { Link, useLocation } from 'react-router-dom';

const MobileBottomDock = () => {
  const location = useLocation();

  const dockLinks = [
    { path: '/', icon: 'fa-house', label: 'Home' },
    { path: '/menu', icon: 'fa-utensils', label: 'Menu' },
    { path: '/specials', icon: 'fa-fire', label: 'Specials' },
    { path: '/ambience', icon: 'fa-images', label: 'Ambience' },
    { path: '/contact', icon: 'fa-map-location-dot', label: 'Contact' },
  ];

  return (
    <div className="mobile-bottom-dock">
      {dockLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className={`dock-item ${location.pathname === link.path ? 'active' : ''}`}
        >
          <i className={`fa-solid ${link.icon}`}></i>
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default MobileBottomDock;
