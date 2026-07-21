import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Boxes, Users, ShoppingCart, FileText, Settings, LogOut, Menu, Bell, Search } from 'lucide-react';

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
  const pageTitle = menu.find((item) => item.to === location.pathname)?.label || 'Dashboard';

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand-mark">L</div>
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
          <button className="btn btn-outline-light btn-sm w-100">
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
            <button className="btn btn-light border-0 position-relative">
              <Bell size={18} />
              <span className="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle">3</span>
            </button>
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
