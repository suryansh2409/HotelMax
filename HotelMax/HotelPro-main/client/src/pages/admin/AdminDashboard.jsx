import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';
import {
  LayoutDashboard, BedDouble, CalendarCheck, Users, Download, Settings, Plus, Edit2, Trash2, Check, Ban, DollarSign, Activity, FileSpreadsheet
} from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'rooms', 'bookings', 'users', 'reports', 'settings'

  // Datasets
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [settings, setSettings] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Alerts
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  // Add/Edit Room Modal
  const [roomModal, setRoomModal] = useState({ show: false, mode: 'create', room: null });
  const [roomForm, setRoomForm] = useState({
    roomNumber: '',
    title: '',
    type: 'deluxe',
    basePrice: 250,
    capacity: { adults: 2, children: 1, maxGuests: 3 },
    bedType: '1 King Bed',
    sizeSqFt: 450,
    description: '',
    photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
    amenities: ['High-speed WiFi', 'Smart TV', 'Air Conditioning', 'Minibar']
  });

  // Add Staff Modal
  const [staffModal, setStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'staff'
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === 'rooms') fetchRooms();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/analytics')
      ]);

      if (statsRes.data && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
      if (analyticsRes.data && analyticsRes.data.data) {
        setAnalytics(analyticsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms', { params: { limit: 50 } });
      if (res.data && res.data.data) setRooms(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await api.get('/admin/bookings', { params: { limit: 50 } });
      if (res.data && res.data.data) setBookings(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users', { params: { limit: 50 } });
      if (res.data && res.data.data) setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSettings = async () => {
    try {
      const [settingsRes, logsRes] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/audit-logs')
      ]);
      if (settingsRes.data && settingsRes.data.data) setSettings(settingsRes.data.data);
      if (logsRes.data && logsRes.data.data) setAuditLogs(logsRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for Rooms
  const handleOpenRoomModal = (mode = 'create', room = null) => {
    if (mode === 'edit' && room) {
      setRoomForm({
        roomNumber: room.roomNumber,
        title: room.title,
        type: room.type,
        basePrice: room.basePrice,
        capacity: room.capacity || { adults: 2, children: 0, maxGuests: 2 },
        bedType: room.bedType || 'King Bed',
        sizeSqFt: room.sizeSqFt || 400,
        description: room.description || '',
        photos: room.photos || ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
        amenities: room.amenities || ['High-speed WiFi']
      });
    } else {
      setRoomForm({
        roomNumber: '',
        title: '',
        type: 'deluxe',
        basePrice: 250,
        capacity: { adults: 2, children: 1, maxGuests: 3 },
        bedType: '1 King Bed',
        sizeSqFt: 450,
        description: '',
        photos: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'],
        amenities: ['High-speed WiFi', 'Smart TV', 'Air Conditioning', 'Minibar']
      });
    }
    setRoomModal({ show: true, mode, room });
  };

  const handleSaveRoom = async (e) => {
    e.preventDefault();
    try {
      if (roomModal.mode === 'create') {
        await api.post('/rooms', roomForm);
        setActionMsg({ type: 'success', text: 'New room created successfully!' });
      } else {
        await api.put(`/rooms/${roomModal.room._id}`, roomForm);
        setActionMsg({ type: 'success', text: 'Room updated successfully!' });
      }
      setRoomModal({ show: false, mode: 'create', room: null });
      fetchRooms();
      fetchInitialData();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to save room' });
    }
  };

  const handleArchiveRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to archive this room?')) return;
    try {
      await api.delete(`/rooms/${roomId}`);
      setActionMsg({ type: 'success', text: 'Room archived.' });
      fetchRooms();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to archive room' });
    }
  };

  // Handlers for Staff
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users/staff', staffForm);
      setActionMsg({ type: 'success', text: 'Staff account created successfully!' });
      setStaffModal(false);
      setStaffForm({ name: '', email: '', phone: '', password: '', role: 'staff' });
      fetchUsers();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to create staff account' });
    }
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      setActionMsg({ type: 'success', text: 'User status updated.' });
      fetchUsers();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to toggle status' });
    }
  };

  // Handlers for Settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', settings);
      setActionMsg({ type: 'success', text: 'Hotel settings updated!' });
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to save settings' });
    }
  };

  // Handlers for CSV Downloads
  const downloadCsv = (endpoint, filename) => {
    const token = localStorage.getItem('hotelpro_token');
    const url = `/api/v1/reports/${endpoint}`;
    fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        link.click();
      })
      .catch((err) => console.error(err));
  };

  if (loading) {
    return <LoadingSpinner text="Loading Executive Admin Analytics & Controls..." />;
  }

  return (
    <div className="admin-dashboard py-5 bg-light min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="card hp-card p-4 border-0 shadow-sm mb-4 bg-white">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <span className="badge bg-warning text-dark text-uppercase px-2 py-1 small fw-bold">
                Executive Control Center
              </span>
              <h2 className="brand-font fw-bold text-dark mb-1 mt-1">HotelPro System Administration</h2>
              <span className="text-secondary small">Complete inventory, analytics, users, and audit logs</span>
            </div>
            <div className="d-flex gap-2">
              <button onClick={() => downloadCsv('bookings/csv', `bookings-${Date.now()}.csv`)} className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
                <FileSpreadsheet size={14} /> Export Bookings CSV
              </button>
              <button onClick={() => downloadCsv('revenue/csv', `revenue-${Date.now()}.csv`)} className="btn btn-navy btn-sm d-flex align-items-center gap-1">
                <Download size={14} /> Export Revenue CSV
              </button>
            </div>
          </div>
        </div>

        {actionMsg.text && (
          <div className={`alert alert-${actionMsg.type} alert-dismissible fade show mb-4`} role="alert">
            {actionMsg.text}
            <button type="button" className="btn-close" onClick={() => setActionMsg({ type: '', text: '' })}></button>
          </div>
        )}

        {/* Admin Navigation Pills */}
        <div className="card hp-card p-2 border-0 shadow-sm mb-4">
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: 'overview', label: 'Executive KPIs & Charts', icon: LayoutDashboard },
              { id: 'rooms', label: 'Rooms & Inventory', icon: BedDouble },
              { id: 'bookings', label: 'All Reservations', icon: CalendarCheck },
              { id: 'users', label: 'Users & Staff', icon: Users },
              { id: 'reports', label: 'Financial Reports', icon: FileSpreadsheet },
              { id: 'settings', label: 'Policies & Audit Trail', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`btn btn-sm d-flex align-items-center gap-1 ${activeTab === tab.id ? 'btn-gold fw-bold' : 'btn-light text-secondary'}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={14} /> {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Executive Overview */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div className="row g-3 mb-4">
              <div className="col-lg-3 col-sm-6">
                <div className="card hp-card p-3 border-0 shadow-sm text-center">
                  <div className="small text-muted mb-1">Gross Paid Revenue</div>
                  <h3 className="fw-bold text-success mb-0">${stats?.totalRevenue?.toLocaleString()}</h3>
                  <div className="small text-muted" style={{ fontSize: '11px' }}>Real database transactions</div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6">
                <div className="card hp-card p-3 border-0 shadow-sm text-center">
                  <div className="small text-muted mb-1">Total Reservations</div>
                  <h3 className="fw-bold text-dark mb-0">{stats?.totalBookings}</h3>
                  <div className="small text-muted" style={{ fontSize: '11px' }}>All booking records</div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6">
                <div className="card hp-card p-3 border-0 shadow-sm text-center">
                  <div className="small text-muted mb-1">Occupancy Rate</div>
                  <h3 className="fw-bold text-warning mb-0">{stats?.occupancyRate}%</h3>
                  <div className="small text-muted" style={{ fontSize: '11px' }}>
                    {stats?.occupiedRooms} / {stats?.totalRooms} Rooms Occupied
                  </div>
                </div>
              </div>
              <div className="col-lg-3 col-sm-6">
                <div className="card hp-card p-3 border-0 shadow-sm text-center">
                  <div className="small text-muted mb-1">Registered Guests</div>
                  <h3 className="fw-bold text-dark mb-0">{stats?.totalCustomers}</h3>
                  <div className="small text-muted" style={{ fontSize: '11px' }}>Verified customer accounts</div>
                </div>
              </div>
            </div>

            {/* Recharts Analytics Charts */}
            <div className="row g-4 mb-4">
              <div className="col-lg-7">
                <div className="card hp-card p-4 border-0 shadow-sm">
                  <h5 className="fw-bold text-dark mb-3">Revenue Performance Trends ($)</h5>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <AreaChart data={analytics?.monthlyTrends || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Area type="monotone" dataKey="revenue" stroke="#b8860b" fill="#fbf6e8" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="col-lg-5">
                <div className="card hp-card p-4 border-0 shadow-sm">
                  <h5 className="fw-bold text-dark mb-3">Room Inventory by Category</h5>
                  <div style={{ width: '100%', height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={analytics?.roomCategories || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#0e1e38" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Audit Activity */}
            <div className="card hp-card p-4 border-0 shadow-sm">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <Activity size={18} className="text-warning" /> Recent Administrative Activity
              </h5>
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle small">
                  <thead className="table-light">
                    <tr>
                      <th>Time</th>
                      <th>Action</th>
                      <th>Entity</th>
                      <th>Operator</th>
                      <th>IP Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats?.recentActivity || []).slice(0, 6).map((log) => (
                      <tr key={log._id}>
                        <td>{new Date(log.createdAt).toLocaleString()}</td>
                        <td><span className="badge bg-light text-dark border">{log.action}</span></td>
                        <td>{log.entity}</td>
                        <td>{log.userName} ({log.userRole})</td>
                        <td className="text-muted font-monospace">{log.ipAddress}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Room Management */}
        {activeTab === 'rooms' && (
          <div className="card hp-card p-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold text-dark mb-0">Suites & Room Inventory</h5>
                <span className="text-secondary small">Add, update pricing, amenities, and room status</span>
              </div>
              <button onClick={() => handleOpenRoomModal('create')} className="btn btn-gold btn-sm d-flex align-items-center gap-1">
                <Plus size={16} /> Add New Suite
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Suite Title</th>
                    <th>Category</th>
                    <th>Price / Night</th>
                    <th>Capacity</th>
                    <th>Physical Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r._id}>
                      <td className="fw-bold">Room {r.roomNumber}</td>
                      <td>
                        <div className="fw-bold text-dark">{r.title}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>{r.bedType} • {r.sizeSqFt} sq.ft.</div>
                      </td>
                      <td className="text-capitalize">{r.type}</td>
                      <td className="fw-bold">${r.basePrice}</td>
                      <td>{r.capacity?.maxGuests} guests</td>
                      <td>
                        <span className={`badge ${r.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {r.isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleOpenRoomModal('edit', r)}
                          className="btn btn-outline-secondary btn-sm me-1"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleArchiveRoom(r._id)}
                          className="btn btn-outline-danger btn-sm"
                        >
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: All Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="card hp-card p-4 border-0 shadow-sm">
            <h5 className="fw-bold text-dark mb-4">Global Reservations Ledger</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    <th>Guest Details</th>
                    <th>Suite / Room</th>
                    <th>Dates</th>
                    <th>Amount ($)</th>
                    <th>Status</th>
                    <th className="text-end">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-bold font-monospace">{b.bookingReference}</td>
                      <td>
                        <div className="fw-bold text-dark">{b.guestDetails?.fullName}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>{b.guestDetails?.email}</div>
                      </td>
                      <td>Room {b.room?.roomNumber} ({b.room?.type})</td>
                      <td>
                        {new Date(b.checkInDate).toLocaleDateString()} — {new Date(b.checkOutDate).toLocaleDateString()}
                      </td>
                      <td className="fw-bold">${b.priceBreakdown?.totalAmount?.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${b.status === 'confirmed' ? 'badge-status-confirmed' : b.status === 'cancelled' ? 'badge-status-cancelled' : 'badge-status-pending'}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="text-end">
                        <a
                          href={`/api/v1/bookings/${b._id}/invoice?format=html`}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-outline-secondary btn-sm py-0"
                        >
                          Invoice
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: User & Staff Management */}
        {activeTab === 'users' && (
          <div className="card hp-card p-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold text-dark mb-0">System Users & Staff Directory</h5>
                <span className="text-secondary small">Manage access control and operational roles</span>
              </div>
              <button onClick={() => setStaffModal(true)} className="btn btn-gold btn-sm d-flex align-items-center gap-1">
                <Plus size={16} /> Add Staff Account
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>User</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>
                        <div className="fw-bold text-dark">{u.name}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Joined: {new Date(u.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span className={`badge text-capitalize ${u.role === 'admin' ? 'bg-warning text-dark' : u.role === 'staff' ? 'bg-info text-dark' : 'bg-light text-dark border'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${u.isActive ? 'bg-success' : 'bg-danger'}`}>
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          onClick={() => handleToggleUserStatus(u._id)}
                          className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Financial Reports & CSV Export */}
        {activeTab === 'reports' && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card hp-card p-4 border-0 shadow-sm h-100">
                <h5 className="fw-bold text-dark mb-2">Bookings & Reservations Export</h5>
                <p className="text-secondary small mb-4">
                  Export complete historical records including guest details, stay dates, nightly snapshots, and booking states to CSV.
                </p>
                <button onClick={() => downloadCsv('bookings/csv', `hotelpro-bookings-${Date.now()}.csv`)} className="btn btn-gold w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                  <Download size={16} /> Download Full Bookings CSV
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card hp-card p-4 border-0 shadow-sm h-100">
                <h5 className="fw-bold text-dark mb-2">Revenue & Payment Ledger Export</h5>
                <p className="text-secondary small mb-4">
                  Download itemized payment transactions, captured payments, provider receipts, card brand breakdowns, and refund events.
                </p>
                <button onClick={() => downloadCsv('revenue/csv', `hotelpro-revenue-${Date.now()}.csv`)} className="btn btn-navy w-100 py-2 d-flex align-items-center justify-content-center gap-2">
                  <Download size={16} /> Download Financial Revenue CSV
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: System Settings & Audit Logs */}
        {activeTab === 'settings' && (
          <div className="row g-4">
            <div className="col-lg-5">
              <div className="card hp-card p-4 border-0 shadow-sm">
                <h5 className="fw-bold text-dark mb-3">Hotel Policies & Settings</h5>
                {settings && (
                  <form onSubmit={handleSaveSettings}>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Hotel Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={settings.hotelName || ''}
                        onChange={(e) => setSettings({ ...settings, hotelName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <label className="form-label small fw-bold text-secondary">Tax Percentage (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={settings.taxPercentage || 12}
                          onChange={(e) => setSettings({ ...settings, taxPercentage: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold text-secondary">Cleaning Fee ($)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={settings.cleaningFee || 35}
                          onChange={(e) => setSettings({ ...settings, cleaningFee: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Free Cancellation Window (Hours)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={settings.cancellationWindowHours || 24}
                        onChange={(e) => setSettings({ ...settings, cancellationWindowHours: parseInt(e.target.value, 10) })}
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label small fw-bold text-secondary">Support Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={settings.supportEmail || ''}
                        onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-gold w-100 py-2 fw-bold">
                      Save Hotel Settings
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="col-lg-7">
              <div className="card hp-card p-4 border-0 shadow-sm">
                <h5 className="fw-bold text-dark mb-3">Immutable Audit Trail</h5>
                <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table className="table table-sm table-hover align-middle small">
                    <thead className="table-light">
                      <tr>
                        <th>Time</th>
                        <th>Action</th>
                        <th>Operator</th>
                        <th>IP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log._id}>
                          <td>{new Date(log.createdAt).toLocaleString()}</td>
                          <td><span className="badge bg-light text-dark border">{log.action}</span></td>
                          <td>{log.userName}</td>
                          <td className="text-muted font-monospace">{log.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Room Modal */}
        {roomModal.show && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-dark">
                    {roomModal.mode === 'create' ? 'Add New Accommodations Suite' : 'Edit Suite Details'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setRoomModal({ show: false, mode: 'create', room: null })}></button>
                </div>
                <form onSubmit={handleSaveRoom}>
                  <div className="modal-body py-3">
                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-secondary">Room Number</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 308"
                          value={roomForm.roomNumber}
                          onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-5">
                        <label className="form-label small fw-bold text-secondary">Suite Title</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Deluxe Ocean View Suite"
                          value={roomForm.title}
                          onChange={(e) => setRoomForm({ ...roomForm, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label small fw-bold text-secondary">Category</label>
                        <select
                          className="form-select text-capitalize"
                          value={roomForm.type}
                          onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
                        >
                          <option value="single">Single</option>
                          <option value="double">Double</option>
                          <option value="deluxe">Deluxe</option>
                          <option value="suite">Suite</option>
                          <option value="presidential">Presidential</option>
                        </select>
                      </div>
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-secondary">Base Price ($/night)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={roomForm.basePrice}
                          onChange={(e) => setRoomForm({ ...roomForm, basePrice: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-secondary">Max Guests</label>
                        <input
                          type="number"
                          className="form-control"
                          value={roomForm.capacity.maxGuests}
                          onChange={(e) => setRoomForm({ ...roomForm, capacity: { ...roomForm.capacity, maxGuests: parseInt(e.target.value, 10) } })}
                          required
                        />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label small fw-bold text-secondary">Dimensions (sq.ft.)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={roomForm.sizeSqFt}
                          onChange={(e) => setRoomForm({ ...roomForm, sizeSqFt: parseInt(e.target.value, 10) })}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Description</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Comprehensive details and features of this suite..."
                        value={roomForm.description}
                        onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                        required
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Primary Photo URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://..."
                        value={roomForm.photos[0] || ''}
                        onChange={(e) => setRoomForm({ ...roomForm, photos: [e.target.value] })}
                        required
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setRoomModal({ show: false, mode: 'create', room: null })}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gold">
                      Save Suite
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Staff Account Modal */}
        {staffModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-dark">Create Staff or Admin Account</h5>
                  <button type="button" className="btn-close" onClick={() => setStaffModal(false)}></button>
                </div>
                <form onSubmit={handleCreateStaff}>
                  <div className="modal-body py-3">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Maria Gonzalez"
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="maria@hotelpro.com"
                        value={staffForm.email}
                        onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={staffForm.phone}
                        onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Initial Password</label>
                      <input
                        type="password"
                        className="form-control"
                        placeholder="Min 6 characters"
                        value={staffForm.password}
                        onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Assigned Role</label>
                      <select
                        className="form-select"
                        value={staffForm.role}
                        onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                      >
                        <option value="staff">Hotel Staff</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setStaffModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-gold">
                      Create Account
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

export default AdminDashboard;
