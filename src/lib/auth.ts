export const AUTH_SESSION_KEY = 'lumensoft-session';
export const AUTH_FLAG_KEY = 'lumensoft-auth';
export const SETTINGS_KEY = 'lumensoft-settings';

export type AppRole = 'admin' | 'salesperson';

export const AUTH_PROFILES = {
  admin: {
    role: 'admin' as const,
    label: 'Admin',
    email: 'admin@lumensoft.com',
    password: 'admin123',
    defaultPath: '/admin/dashboard',
  },
  salesperson: {
    role: 'salesperson' as const,
    label: 'Salesperson',
    email: 'salesperson@lumensoft.com',
    password: 'sales123',
    defaultPath: '/sales/pos',
  },
};

export const ROLE_MENUS = {
  admin: [
    { to: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { to: 'products', label: 'Products', icon: 'boxes' },
    { to: 'salespersons', label: 'Salespersons', icon: 'users' },
    { to: 'pos', label: 'Point of Sale', icon: 'cart' },
    { to: 'sales-records', label: 'Sales Records', icon: 'receipt' },
    { to: 'settings', label: 'Settings', icon: 'settings' },
  ],
  salesperson: [
    { to: 'pos', label: 'Point of Sale', icon: 'cart' },
    { to: 'products', label: 'Products', icon: 'boxes' },
    { to: 'settings', label: 'Settings', icon: 'settings' },
  ],
};

export const DEFAULT_SETTINGS = {
  companyName: 'Lumensoft POS',
  currency: 'PKR',
  taxRate: 0,
  notificationsEnabled: true,
  showRecentSalesChart: true,
  printEnabled: true,
  discountEnabled: true,
  discountMode: 'percentage',
  darkMode: false,
};

const readJson = (key: string, fallback: unknown) => {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const getStoredSettings = () => ({ ...DEFAULT_SETTINGS, ...readJson(SETTINGS_KEY, {}) });

export const getStoredSession = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const stored = readJson(AUTH_SESSION_KEY, null) as { role?: AppRole; email?: string } | null;
  if (stored?.role && stored?.email) {
    return stored;
  }

  if (window.localStorage.getItem(AUTH_FLAG_KEY) === 'true') {
    return { role: 'admin' as const, email: AUTH_PROFILES.admin.email };
  }

  return null;
};

export const saveSession = (session: { role: AppRole; email: string }) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  window.localStorage.setItem(AUTH_FLAG_KEY, 'true');
};

export const clearSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
  window.localStorage.removeItem(AUTH_FLAG_KEY);
};

export const getDefaultPathForRole = (role: AppRole) => AUTH_PROFILES[role]?.defaultPath || '/login';

export const getRoleMenu = (role: AppRole) => ROLE_MENUS[role] || ROLE_MENUS.salesperson;
