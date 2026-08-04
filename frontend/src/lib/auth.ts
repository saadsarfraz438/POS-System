export const AUTH_SESSION_KEY = 'lumensoft-session';
export const AUTH_FLAG_KEY = 'lumensoft-auth';
export const SETTINGS_KEY = 'lumensoft-settings';

export type AppRole = 'admin' | 'salesperson';

export type AuthSession = {
  token: string;
  role: AppRole;
  email: string;
  displayName: string;
  salespersonId?: number | null;
};

export const DEFAULT_PATHS: Record<AppRole, string> = {
  admin: '/admin/dashboard',
  salesperson: '/sales/pos',
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

  const stored = readJson(AUTH_SESSION_KEY, null) as AuthSession | null;
  if (stored?.role && stored?.email && stored?.token) {
    return stored;
  }

  return null;
};

export const saveSession = (session: AuthSession) => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
};

export const clearSession = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_KEY);
};

export const getDefaultPathForRole = (role: AppRole) => DEFAULT_PATHS[role] || '/login';

export const getRoleMenu = (role: AppRole) => ROLE_MENUS[role] || ROLE_MENUS.salesperson;
