import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Boxes, Users, ShoppingCart, FileText, Settings, LogOut, Menu, Bell, Search, Moon, Sun } from 'lucide-react';

const menu = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Boxes },
  { to: '/salespersons', label: 'Salespersons', icon: Users },
  { to: '/pos', label: 'Point of Sale', icon: ShoppingCart },
  { to: '/sales-records', label: 'Sales Records', icon: FileText },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = menu.find((item) => item.to === location.pathname)?.label || 'Dashboard';
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadNotifications = () => {
      if (typeof window === 'undefined') return;
      try {
        const settings = JSON.parse(window.localStorage.getItem('lumensoft-settings') || '{}');
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
      try {
        const settings = JSON.parse(window.localStorage.getItem('lumensoft-settings') || '{}');
        const isDark = settings.darkMode === true;
        document.documentElement.classList.toggle('theme-dark', isDark);
        setDarkMode(isDark);
      } catch {
        document.documentElement.classList.remove('theme-dark');
        setDarkMode(false);
      }
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
    window.localStorage.removeItem('lumensoft-auth');
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">LS</div>
          <div>
            <h4 className="mb-0">Lumensoft</h4>
            <small>POS Admin</small>
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
            <h4 className="mb-0">{pageTitle}</h4>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div className="topbar-search">
              <Search size={16} />
              <input type="text" placeholder="Search" />
            </div>
            <button className="btn btn-light border-0" onClick={() => {
              const nextValue = !darkMode;
              setDarkMode(nextValue);
              document.documentElement.classList.toggle('theme-dark', nextValue);
              const settings = JSON.parse(window.localStorage.getItem('lumensoft-settings') || '{}');
              const updatedSettings = { ...settings, darkMode: nextValue };
              window.localStorage.setItem('lumensoft-settings', JSON.stringify(updatedSettings));
              window.dispatchEvent(new Event('lumensoft:settings'));
            }}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="position-relative">
              <button className="btn btn-light border-0 position-relative" onClick={() => setShowNotifications((value) => !value)}>
                <Bell size={18} />
                <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">{notifications.length}</span>
              </button>
              {showNotifications && (
                <div className="position-absolute end-0 mt-2 bg-white border rounded shadow-sm p-2" style={{ width: 260, zIndex: 10 }}>
                  <div className="fw-semibold mb-2">Notifications</div>
                  {notifications.length === 0 ? (
                    <div className="text-muted small">No notifications yet.</div>
                  ) : (
                    notifications.map((notification) => (
                      <div key={notification.id} className="small border-bottom py-2">
                        <div>{notification.message}</div>
                        <div className="text-muted">{new Date(notification.createdAt).toLocaleString()}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
            <div className="user-pill">
              <div className="avatar">A</div>
              <div>
                <div className="fw-semibold">Admin</div>
                <small className="text-muted">Super Admin</small>
              </div>
            </div>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
