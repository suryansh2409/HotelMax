import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Fast test credential quick-fillers
  const fillCredentials = (type) => {
    if (type === 'customer') {
      setEmail('guest@hotelpro.com');
      setPassword('Guest@HotelPro2026');
    } else if (type === 'staff') {
      setEmail('staff@hotelpro.com');
      setPassword('Staff@HotelPro2026');
    } else if (type === 'admin') {
      setEmail('admin@hotelpro.com');
      setPassword('Admin@HotelPro2026');
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);

      // Check for redirect param
      const searchParams = new URLSearchParams(location.search);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl) {
        const queryParams = searchParams.toString();
        navigate(queryParams ? `${redirectUrl}?${queryParams}` : redirectUrl);
        return;
      }

      // Default role-based routing
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'staff') {
        navigate('/staff');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="card hp-card p-4 p-sm-5 border-0 shadow-lg">
              {/* Brand Header */}
              <div className="text-center mb-4">
                <div className="bg-warning text-dark p-2 rounded-3 mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <Building2 size={26} color="#0e1e38" />
                </div>
                <h2 className="brand-font fw-bold text-dark mb-1">Welcome to HotelPro</h2>
                <p className="text-muted small">Sign in to manage your reservations and guest preferences</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-4">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Quick Fill Credentials Pills for Mentor & Demo */}
              <div className="p-3 bg-light rounded-3 mb-4 border">
                <div className="small fw-bold text-secondary mb-2 text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em' }}>
                  Demo Accounts (1-Click Fill)
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => fillCredentials('customer')}
                    className="btn btn-outline-secondary btn-sm small py-1"
                  >
                    👤 Guest
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('staff')}
                    className="btn btn-outline-info btn-sm small py-1"
                  >
                    🛎️ Hotel Staff
                  </button>
                  <button
                    type="button"
                    onClick={() => fillCredentials('admin')}
                    className="btn btn-outline-warning btn-sm small py-1"
                  >
                    🛡️ Administrator
                  </button>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Email Address</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">
                      <Mail size={16} />
                    </span>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label className="form-label small fw-bold text-secondary mb-0">Password</label>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">
                      <Lock size={16} />
                    </span>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-gold w-100 py-2 fw-bold" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Authenticating...
                    </>
                  ) : (
                    'Sign In to HotelPro'
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted small">Don't have an account yet? </span>
                <Link to="/register" className="small fw-bold text-warning text-decoration-none">
                  Create Guest Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
