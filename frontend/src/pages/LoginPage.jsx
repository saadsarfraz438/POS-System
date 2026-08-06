import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField.jsx';
import { getDefaultPathForRole, getStoredSession, saveSession } from '../lib/auth.ts';
import { login } from '../services/api.js';

export default function LoginPage({ portalRole = null }) {
  const session = getStoredSession(portalRole || undefined);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const heading = portalRole === 'admin' ? 'Admin Login' : portalRole === 'salesperson' ? 'Salesperson Login' : 'Login';
  const roleHint = portalRole === 'admin' ? 'Use admin credentials for this portal.' : portalRole === 'salesperson' ? 'Use salesperson credentials for this portal.' : 'Use your account credentials.';

  useEffect(() => {
    if (session?.token && session.role) {
      navigate(getDefaultPathForRole(session.role), { replace: true });
    }
  }, [navigate, session]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await login({ email, password });
      const user = response.data?.user;
      if (!response.data?.token || !user?.role) {
        throw new Error('Login failed.');
      }

      if (portalRole && user.role !== portalRole) {
        const requiredRoleName = portalRole === 'admin' ? 'admin' : 'salesperson';
        const message = `This link accepts ${requiredRoleName} credentials only.`;
        setError(message);
        Swal.fire('Wrong portal', message, 'warning');
        return;
      }

      saveSession({
        token: response.data.token,
        role: user.role,
        email: user.email,
        displayName: user.displayName || user.email,
        salespersonId: user.salespersonId ?? null,
      }, user.role);
      navigate(getDefaultPathForRole(user.role), { replace: true });
    } catch (loginError) {
      const message = loginError?.response?.data?.message || 'Invalid email or password.';
      setError(message);
      Swal.fire('Login failed', message, 'error');
      return;
    }
  };

  return (
    <div className="auth-page min-vh-100 d-flex align-items-center justify-content-center">
      <div className="card shadow border-0 auth-card">
        <div className="card-body p-4 p-md-5">
          <div className="mb-4 text-center">
            <span className="badge rounded-pill text-bg-primary mb-3 fs-5 px-4 py-2">Lumensoft POS</span>
          </div>

          <div className="mb-4 text-center">
            <h5 className="mb-1">{heading}</h5>
            <p className="text-muted mb-0">{roleHint}</p>
          </div>

          <form onSubmit={handleLogin}>
            <FormField label="Email">
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" placeholder="name@example.com" />
            </FormField>
            <FormField label="Password" className="mt-3">
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="Enter your password" />
            </FormField>
            {error ? <div className="alert alert-danger py-2">{error}</div> : null}
            <div className="small text-muted mb-3 text-center">
              Passwords for salespersons are managed by the admin panel.
            </div>
            <button className="btn btn-primary w-100" type="submit">Login</button>
            <div className="small text-center mt-3">
              <Link to="/admin/login">Admin login</Link>
              {' | '}
              <Link to="/sales/login">Salesperson login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
