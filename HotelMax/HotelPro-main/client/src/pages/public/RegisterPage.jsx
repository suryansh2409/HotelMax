import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score: 1, text: 'Weak', color: 'bg-danger' };
    if (score <= 4) return { score: 2, text: 'Medium', color: 'bg-warning' };
    return { score: 3, text: 'Strong', color: 'bg-success' };
  };

  const strength = getPasswordStrength(formData.password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/dashboard?welcome=true');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page py-5 bg-light min-vh-100 d-flex align-items-center">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card hp-card p-4 p-sm-5 border-0 shadow-lg">
              {/* Header */}
              <div className="text-center mb-4">
                <div className="bg-warning text-dark p-2 rounded-3 mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px' }}>
                  <Building2 size={26} color="#0e1e38" />
                </div>
                <h2 className="brand-font fw-bold text-dark mb-1">Join HotelPro Privileges</h2>
                <p className="text-muted small">Create your complimentary guest account for effortless booking</p>
              </div>

              {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 py-2 small mb-4">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Full Legal Name</label>
                  <div className="input-group">
                    <span className="input-group-text bg-white text-muted">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. Eleanor Vance"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">Email Address</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="name@domain.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">Phone Number</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">
                        <Phone size={16} />
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="row g-2 mb-2">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        placeholder="Min 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">Confirm Password</label>
                    <div className="input-group">
                      <span className="input-group-text bg-white text-muted">
                        <Lock size={16} />
                      </span>
                      <input
                        type="password"
                        name="confirmPassword"
                        className="form-control"
                        placeholder="Re-type password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password strength visual indicator */}
                {formData.password && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="text-muted" style={{ fontSize: '11px' }}>Password Strength:</span>
                      <span className="fw-bold" style={{ fontSize: '11px' }}>{strength.text}</span>
                    </div>
                    <div className="progress" style={{ height: '4px' }}>
                      <div
                        className={`progress-bar ${strength.color}`}
                        role="progressbar"
                        style={{ width: `${(strength.score / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="form-check mb-4">
                  <input className="form-check-input" type="checkbox" id="termsCheck" required />
                  <label className="form-check-label small text-secondary" htmlFor="termsCheck">
                    I agree to the <Link to="/terms-privacy" target="_blank" className="text-warning">Terms of Service</Link> and <Link to="/terms-privacy" target="_blank" className="text-warning">Privacy Policy</Link>.
                  </label>
                </div>

                <button type="submit" className="btn btn-gold w-100 py-2 fw-bold" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Registering Account...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              </form>

              <div className="text-center mt-4 pt-3 border-top">
                <span className="text-muted small">Already a registered guest? </span>
                <Link to="/login" className="small fw-bold text-warning text-decoration-none">
                  Sign In Here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
