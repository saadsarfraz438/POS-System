import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@lumensoft.com');
  const [password, setPassword] = useState('admin123');
  const navigate = useNavigate();

  const handleLogin = (event) => {
    event.preventDefault();
    if (email && password) {
      window.localStorage.setItem('lumensoft-auth', 'true');
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="card shadow border-0" style={{ width: '100%', maxWidth: 420 }}>
        <div className="card-body p-4">
          <h3 className="mb-1">Welcome back</h3>
          <p className="text-muted">Sign in to Lumensoft POS</p>
          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button className="btn btn-primary w-100">Login</button>
          </form>
        </div>
      </div>
    </div>
  );
}
