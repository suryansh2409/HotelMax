import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, CalendarCheck, CreditCard, Bell, Shield, Edit2, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const CustomerDashboard = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({ totalBookings: 0, activeBookings: 0, cancelledBookings: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Profile modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    currentPassword: '',
    newPassword: ''
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [profRes, notifRes] = await Promise.all([
        api.get('/auth/profile'),
        api.get('/notifications')
      ]);

      if (profRes.data && profRes.data.data) {
        setProfileData(profRes.data.data.user);
        setStats(profRes.data.data.stats || { totalBookings: 0, activeBookings: 0, cancelledBookings: 0 });
        setEditForm({
          name: profRes.data.data.user.name,
          phone: profRes.data.data.user.phone,
          currentPassword: '',
          newPassword: ''
        });
      }

      if (notifRes.data && notifRes.data.data) {
        setNotifications(notifRes.data.data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    try {
      const payload = {
        name: editForm.name,
        phone: editForm.phone
      };

      if (editForm.newPassword) {
        payload.currentPassword = editForm.currentPassword;
        payload.newPassword = editForm.newPassword;
      }

      const res = await api.put('/auth/profile', payload);
      if (res.data && res.data.data) {
        updateUser(res.data.data.user);
        setProfileData(res.data.data.user);
        setMsg({ type: 'success', text: 'Profile updated successfully!' });
        setEditOpen(false);
      }
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Retrieving guest profile and statistics..." />;
  }

  return (
    <div className="customer-dashboard py-5 bg-light min-vh-100">
      <div className="container">
        {/* Welcome Banner */}
        <div className="card hp-card p-4 p-md-5 border-0 shadow-sm mb-4 bg-white">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div className="d-flex align-items-center gap-3">
              <img
                src={profileData?.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                alt={profileData?.name}
                className="rounded-circle shadow-sm"
                style={{ width: '64px', height: '64px', objectFit: 'cover' }}
              />
              <div>
                <span className="badge bg-warning text-dark text-uppercase px-2 py-1 small fw-bold">
                  {profileData?.role || 'Guest'} Member
                </span>
                <h2 className="brand-font fw-bold text-dark mb-0 mt-1">
                  Hi, {profileData?.name || user?.name}!
                </h2>
                <span className="text-secondary small">{profileData?.email || user?.email}</span>
              </div>
            </div>

            <div className="d-flex gap-2">
              <button onClick={() => setEditOpen(true)} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
                <Edit2 size={14} /> Edit Profile
              </button>
              <Link to="/rooms" className="btn btn-gold btn-sm d-flex align-items-center gap-1">
                Reserve a Suite <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {msg.text && (
          <div className={`alert alert-${msg.type} alert-dismissible fade show`} role="alert">
            {msg.text}
            <button type="button" className="btn-close" onClick={() => setMsg({ type: '', text: '' })}></button>
          </div>
        )}

        {/* Stats Row */}
        <div className="row g-4 mb-4">
          <div className="col-md-4">
            <div className="card hp-card p-4 border-0 shadow-sm text-center">
              <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-inline-flex mx-auto mb-2">
                <CalendarCheck size={28} />
              </div>
              <h3 className="fw-bold text-dark mb-0">{stats.totalBookings}</h3>
              <div className="text-secondary small">Total Reservations Placed</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card hp-card p-4 border-0 shadow-sm text-center">
              <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle d-inline-flex mx-auto mb-2">
                <Shield size={28} />
              </div>
              <h3 className="fw-bold text-dark mb-0">{stats.activeBookings}</h3>
              <div className="text-secondary small">Confirmed Active Stays</div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card hp-card p-4 border-0 shadow-sm text-center">
              <div className="bg-danger bg-opacity-10 text-danger p-3 rounded-circle d-inline-flex mx-auto mb-2">
                <CreditCard size={28} />
              </div>
              <h3 className="fw-bold text-dark mb-0">{stats.cancelledBookings}</h3>
              <div className="text-secondary small">Cancelled / Refunded Stays</div>
            </div>
          </div>
        </div>

        {/* Quick Nav & Notifications */}
        <div className="row g-4">
          <div className="col-lg-6">
            <div className="card hp-card p-4 border-0 shadow-sm h-100">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold text-dark mb-0">My Reservations</h5>
                <Link to="/my-bookings" className="small text-warning fw-bold text-decoration-none">
                  View All & Manage &rarr;
                </Link>
              </div>
              <p className="text-secondary small mb-4">
                Access your upcoming itineraries, printable tax invoices, and cancellation options.
              </p>
              <Link to="/my-bookings" className="btn btn-navy w-100 py-2">
                Go to My Bookings Hub
              </Link>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card hp-card p-4 border-0 shadow-sm h-100">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <Bell size={18} className="text-warning" /> In-App Activity & Alerts
              </h5>
              {notifications.length === 0 ? (
                <div className="text-center py-4 text-muted small">No notifications at this time.</div>
              ) : (
                <div className="d-flex flex-column gap-2" style={{ maxHeight: '240px', overflowY: 'auto' }}>
                  {notifications.slice(0, 4).map((n) => (
                    <div key={n._id} className="p-2 border rounded-2 bg-light small">
                      <div className="fw-bold text-dark">{n.title}</div>
                      <div className="text-secondary">{n.message}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {editOpen && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-dark">Update Profile Information</h5>
                  <button type="button" className="btn-close" onClick={() => setEditOpen(false)}></button>
                </div>
                <form onSubmit={handleUpdateProfile}>
                  <div className="modal-body py-3">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <hr className="my-3" />
                    <div className="small fw-bold text-secondary mb-2">Change Password (Optional)</div>
                    <div className="mb-2">
                      <label className="form-label small text-secondary">Current Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Required only to change password"
                        value={editForm.currentPassword}
                        onChange={(e) => setEditForm({ ...editForm, currentPassword: e.target.value })}
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small text-secondary">New Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="New password (min 6 chars)"
                        value={editForm.newPassword}
                        onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setEditOpen(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gold" disabled={saving}>
                      {saving ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;
