import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AUTH_PROFILES, getDefaultPathForRole, getStoredSession, saveSession } from '../lib/auth.js';

export default function LoginPage() {
  const session = getStoredSession();
  const navigate = useNavigate();
  const [role, setRole] = useState('admin');
  const [email, setEmail] = useState(AUTH_PROFILES.admin.email);
  const [password, setPassword] = useState(AUTH_PROFILES.admin.password);
  const [error, setError] = useState('');

  useEffect(() => {
    if (session) {
      navigate(getDefaultPathForRole(session.role), { replace: true });
    }
  }, [navigate, session]);

  const loadRole = (nextRole) => {
    setRole(nextRole);
    setEmail(AUTH_PROFILES[nextRole].email);
    setPassword(AUTH_PROFILES[nextRole].password);
    setError('');
  };

  const handleLogin = (event) => {
    event.preventDefault();
    const profile = AUTH_PROFILES[role];

    if (email.trim().toLowerCase() !== profile.email.toLowerCase() || password !== profile.password) {
      setError('Invalid email or password for the selected panel.');
      return;
    }

    saveSession({ role: profile.role, email: profile.email });
    navigate(getDefaultPathForRole(profile.role), { replace: true });
  };

  return (
    <div className="auth-page min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow border-0 auth-card">
        <div className="card-body p-4 p-md-5">
          <div className="mb-4">
            <span className="badge rounded-pill text-bg-primary mb-3">Lumensoft POS</span>
            <h3 className="mb-1">Choose your panel</h3>
            <p className="text-muted mb-0">Admin gets full access. Salesperson gets POS, products, and settings only.</p>
          </div>

          <div className="btn-group w-100 mb-4 auth-role-toggle" role="tablist" aria-label="Select login role">
            <button type="button" className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => loadRole('admin')}>Admin</button>
            <button type="button" className={`btn ${role === 'salesperson' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => loadRole('salesperson')}>Salesperson</button>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">{role === 'admin' ? 'Admin Email' : 'Salesperson Email'}</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            {error ? <div className="alert alert-danger py-2">{error}</div> : null}
            <div className="small text-muted mb-3">
              Admin: {AUTH_PROFILES.admin.email} / {AUTH_PROFILES.admin.password}<br />
              Salesperson: {AUTH_PROFILES.salesperson.email} / {AUTH_PROFILES.salesperson.password}
            </div>
            <button className="btn btn-primary w-100" type="submit">Sign In</button>
          </form>
        </div>
      </div>
    </div>
  );
}
