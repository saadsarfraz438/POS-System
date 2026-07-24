import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Boxes, Users, ShoppingCart, FileText, Settings, LogOut, Menu, Bell, Search, Moon, Sun } from 'lucide-react';
import { clearSession, getRoleMenu, getStoredSession, getStoredSettings, SETTINGS_KEY } from '../lib/auth.js';

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
  const session = getStoredSession();
  const role = session?.role || 'salesperson';
  const basePath = role === 'admin' ? '/admin' : '/sales';
  const menu = getRoleMenu(role).map((item) => ({ ...item, to: `${basePath}/${item.to}`, icon: iconMap[item.icon] }));
  const pageTitle = menu.find((item) => location.pathname === item.to)?.label || 'Point of Sale';
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadNotifications = () => {
      if (typeof window === 'undefined') return;
      try {
        const settings = JSON.parse(window.localStorage.getItem(SETTINGS_KEY) || '{}');
        if (settings.notificationsEnabled === false) {
          setNotifications([]);
          return;
        }
        const stored = JSON.parse(window.localStorage.getItem('lumensoft-notifications') || '[]');
        setNotifications(stored);
      } catch {
        setNotifications([]);
      }
    };

    const syncTheme = () => {
      if (typeof window === 'undefined') return;
      const settings = getStoredSettings();
      const isDark = settings.darkMode === true;
      document.documentElement.classList.toggle('theme-dark', isDark);
      setDarkMode(isDark);
    };

    loadNotifications();
    syncTheme();
    window.addEventListener('lumensoft:notifications', loadNotifications);
    window.addEventListener('lumensoft:settings', syncTheme);
    window.addEventListener('storage', loadNotifications);
    return () => {
      window.removeEventListener('lumensoft:notifications', loadNotifications);
      window.removeEventListener('lumensoft:settings', syncTheme);
      window.removeEventListener('storage', loadNotifications);
    };
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const toggleTheme = () => {
    const nextValue = !darkMode;
    setDarkMode(nextValue);
    document.documentElement.classList.toggle('theme-dark', nextValue);
    const settings = { ...getStoredSettings(), darkMode: nextValue };
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event('lumensoft:settings'));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">LS</div>
          <div>
            <h4 className="mb-0">Lumensoft</h4>
            <small>{role === 'admin' ? 'Admin Panel' : 'Sales Panel'}</small>
          </div>
        </div>

        <nav className="nav-links">
          {menu.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
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

      <main className="content-area">
        <header className="topbar">
          <div className="d-flex align-items-center gap-3">
            <button className="btn btn-light border-0 d-lg-none" type="button">
              <Menu size={18} />
            </button>
            <div>
              <h4 className="mb-0">{pageTitle}</h4>
              <small className="text-muted text-uppercase">{role}</small>
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
            <button className="btn btn-light border-0 position-relative" onClick={() => setShowNotifications((current) => !current)}>
              <Bell size={18} />
              {notifications.length > 0 ? <span className="badge rounded-pill bg-danger notification-badge">{notifications.length}</span> : null}
            </button>
          </div>
        </header>

        {showNotifications ? (
          <div className="notification-panel shadow-sm">
            <h6 className="mb-3">Notifications</h6>
            {notifications.length === 0 ? (
              <p className="text-muted mb-0">No notifications available.</p>
            ) : (
              <div className="list-group list-group-flush">
                {notifications.map((notification) => (
                  <div key={notification.id} className="list-group-item px-0">
                    <div className="fw-semibold">{notification.message}</div>
                    <small className="text-muted">{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : null}

        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
