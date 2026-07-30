import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Boxes, Users, ShoppingCart, FileText, Settings, LogOut, Menu, Bell, Search, Moon, Sun } from 'lucide-react';
import { clearSession, getRoleMenu, getStoredSession, getStoredSettings, SETTINGS_KEY } from '../lib/auth.js';
import Footer from '../components/Footer.jsx';

const iconMap = {
  dashboard: LayoutDashboard,
  boxes: Boxes,
  users: Users,
  cart: ShoppingCart,
  receipt: FileText,
  settings: Settings,
};

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 1. Session & Routing Config
  const session = getStoredSession();
  const role = session?.role || 'salesperson';
  const basePath = role === 'admin' ? '/admin' : '/sales';
  
  // Map menu options and attach corresponding icons
  const menu = getRoleMenu(role).map((item) => ({
    ...item,
    to: `${basePath}/${item.to}`,
    icon: iconMap[item.icon]
  }));
  
  const pageTitle = menu.find((item) => location.pathname === item.to)?.label || 'Point of Sale';

  // 2. Component State
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // 3. Side Effects (Notifications & Theme Sync)
  useEffect(() => {
    const loadNotifications = () => {
      try {
        const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
        if (settings.notificationsEnabled === false) {
          return setNotifications([]);
        }
        const stored = JSON.parse(localStorage.getItem('lumensoft-notifications') || '[]');
        setNotifications(stored);
      } catch {
        setNotifications([]);
      }
    };

    const syncTheme = () => {
      const isDark = getStoredSettings().darkMode === true;
      document.documentElement.classList.toggle('theme-dark', isDark);
      setDarkMode(isDark);
    };

    // Initial load
    loadNotifications();
    syncTheme();

    // Event listeners for real-time updates
    window.addEventListener('lumensoft:notifications', loadNotifications);
    window.addEventListener('lumensoft:settings', syncTheme);
    window.addEventListener('storage', loadNotifications);

    return () => {
      window.removeEventListener('lumensoft:notifications', loadNotifications);
      window.removeEventListener('lumensoft:settings', syncTheme);
      window.removeEventListener('storage', loadNotifications);
    };
  }, []);

  // 4. Action Handlers
  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const toggleTheme = () => {
    const nextValue = !darkMode;
    setDarkMode(nextValue);
    document.documentElement.classList.toggle('theme-dark', nextValue);
    
    const settings = { ...getStoredSettings(), darkMode: nextValue };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('lumensoft:settings'));
  };

  return (
    <div className="app-shell">
      {/* Sidebar Layout */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">POS</div>
          <div>
            <h4 className="mb-0">Lumensoft</h4>
            <small>{role === 'admin' ? ' ADMIN' : 'SALESPERSON '}</small>
          </div>
        </div>
        
        <nav className="nav-links">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.to} 
                to={item.to} 
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        
        <div className="sidebar-footer">
          <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
            <LogOut size={16} className="me-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Topbar & Page View */}
      <main className="content-area">
        <header className="topbar">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light border-0 d-lg-none" type="button">
              <Menu size={18} />
            </button>
            <div>
              <h4 className="mb-0">{pageTitle}</h4>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            <div className="topbar-search">
              <Search size={16} />
              <input type="text" placeholder="Search" />
            </div>
            
            <button className="btn btn-light border-0" onClick={toggleTheme}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button className="btn btn-light border-0 position-relative" onClick={() => setShowNotifications(!showNotifications)}>
              <Bell size={18} />
              {notifications.length > 0 && (
                <span className="badge rounded-pill bg-danger notification-badge">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Notification Popover */}
        {showNotifications && (
          <div className="notification-panel shadow-sm">
            <h6 className="mb-3">Notifications</h6>
            {notifications.length === 0 ? (
              <p className="text-muted mb-0">No notifications available.</p>
            ) : (
              <div className="list-group list-group-flush">
                {notifications.map((n) => (
                  <div key={n.id} className="list-group-item px-0">
                    <div className="fw-semibold">{n.message}</div>
                    <small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="page-content">
          <Outlet />
        </div>

        <Footer />
      </main>
    </div>
  );
}
