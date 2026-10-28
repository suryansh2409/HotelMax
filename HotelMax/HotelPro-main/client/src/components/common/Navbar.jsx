import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Building2, Bell, User, LogOut, Shield, Compass, CalendarCheck, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';

const Navbar = () => {
  const { user, isAuthenticated, isCustomer, isStaff, isAdmin, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifs, setShowNotifs] = useState(false);
  const [navCollapsed, setNavCollapsed] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data && res.data.data) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch {
      // Ignore background notification fetch errors
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/all/read');
      setUnreadCount(0);
      fetchNotifications();
    } catch {
      // Ignore
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar navbar-expand-lg hp-navbar sticky-top">
      <div className="container">
        {/* Brand Logo */}
        <Link className="navbar-brand d-flex align-items-center text-white text-decoration-none" to="/">
          <div className="bg-warning text-dark p-2 rounded-3 me-2 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)' }}>
            <Building2 size={22} color="#0e1e38" />
          </div>
          <span className="brand-font fs-3 fw-bold text-white">Hotel<span style={{ color: '#d4af37' }}>Pro</span></span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler border-secondary text-white"
          type="button"
          onClick={() => setNavCollapsed(!navCollapsed)}
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        {/* Nav Links */}
        <div className={`collapse navbar-collapse ${navCollapsed ? '' : 'show'}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end onClick={() => setNavCollapsed(true)}>Home</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/rooms" onClick={() => setNavCollapsed(true)}>Explore Rooms</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/about" onClick={() => setNavCollapsed(true)}>About Us</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/contact" onClick={() => setNavCollapsed(true)}>Contact & Concierge</NavLink>
            </li>

            {/* Role-Specific Links */}
            {isCustomer && (
              <li className="nav-item">
                <NavLink className="nav-link text-warning fw-semibold" to="/my-bookings" onClick={() => setNavCollapsed(true)}>
                  <CalendarCheck size={16} className="me-1" /> My Bookings
                </NavLink>
              </li>
            )}
            {isStaff && (
              <li className="nav-item">
                <NavLink className="nav-link text-info fw-semibold" to="/staff" onClick={() => setNavCollapsed(true)}>
                  <Compass size={16} className="me-1" /> Staff Portal
                </NavLink>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <NavLink className="nav-link text-warning fw-semibold" to="/admin" onClick={() => setNavCollapsed(true)}>
                  <Shield size={16} className="me-1" /> Admin Center
                </NavLink>
              </li>
            )}
          </ul>

          {/* Right Action / Auth */}
          <div className="d-flex align-items-center gap-3">
            {isAuthenticated ? (
              <>
                {/* Notification Dropdown */}
                <div className="dropdown position-relative">
                  <button
                    className="btn btn-link text-white p-2 position-relative text-decoration-none"
                    type="button"
                    onClick={() => setShowNotifs(!showNotifs)}
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifs && (
                    <div className="dropdown-menu dropdown-menu-end show p-0 shadow-lg border-0 mt-2" style={{ width: '320px', zIndex: 1050, background: '#ffffff', borderRadius: '10px' }}>
                      <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-light">
                        <span className="fw-bold fs-6 text-dark">Notifications</span>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="btn btn-sm text-primary p-0 border-0" style={{ fontSize: '12px' }}>
                            Mark all read
                          </button>
                        )}
                      </div>
                      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                          <div className="p-3 text-center text-muted" style={{ fontSize: '13px' }}>
                            No notifications yet
                          </div>
                        ) : (
                          notifications.slice(0, 5).map((n) => (
                            <div key={n._id} className={`p-3 border-bottom ${n.isRead ? '' : 'bg-light'}`} style={{ fontSize: '13px' }}>
                              <div className="fw-bold text-dark">{n.title}</div>
                              <div className="text-secondary mt-1">{n.message}</div>
                              <div className="text-muted mt-1" style={{ fontSize: '11px' }}>
                                {new Date(n.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-outline-light btn-sm d-flex align-items-center gap-2 dropdown-toggle"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <img
                      src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                      alt={user?.name}
                      className="rounded-circle"
                      style={{ width: '26px', height: '26px', objectFit: 'cover' }}
                    />
                    <span className="d-none d-sm-inline">{user?.name}</span>
                    <span className="badge bg-warning text-dark text-capitalize ms-1" style={{ fontSize: '11px' }}>
                      {user?.role}
                    </span>
                  </button>
                  <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                    <li>
                      <Link className="dropdown-item py-2" to="/dashboard">
                        <User size={16} className="me-2 text-secondary" /> Profile & Account
                      </Link>
                    </li>
                    {isCustomer && (
                      <li>
                        <Link className="dropdown-item py-2" to="/my-bookings">
                          <CalendarCheck size={16} className="me-2 text-secondary" /> My Reservations
                        </Link>
                      </li>
                    )}
                    {isStaff && (
                      <li>
                        <Link className="dropdown-item py-2" to="/staff">
                          <Compass size={16} className="me-2 text-secondary" /> Staff Dashboard
                        </Link>
                      </li>
                    )}
                    {isAdmin && (
                      <li>
                        <Link className="dropdown-item py-2" to="/admin">
                          <Shield size={16} className="me-2 text-secondary" /> Admin Console
                        </Link>
                      </li>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger py-2" onClick={handleLogout}>
                        <LogOut size={16} className="me-2" /> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to="/login" className="btn btn-outline-light btn-sm px-3">
                  Sign In
                </Link>
                <Link to="/register" className="btn btn-gold btn-sm px-3">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
