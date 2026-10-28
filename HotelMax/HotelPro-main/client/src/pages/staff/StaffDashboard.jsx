import React, { useState, useEffect } from 'react';
import { Compass, Users, CheckSquare, Sparkles, Bell, Search, Check, LogOut, ArrowRight, Bed, Clock, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('operations'); // 'operations', 'arrivals', 'departures', 'rooms', 'housekeeping', 'requests'

  // Summary Metrics
  const [operations, setOperations] = useState(null);
  const [arrivals, setArrivals] = useState([]);
  const [departures, setDepartures] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [housekeeping, setHousekeeping] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMsg, setActionMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchOperationsSummary();
  }, []);

  useEffect(() => {
    if (activeTab === 'arrivals') fetchArrivals();
    if (activeTab === 'departures') fetchDepartures();
    if (activeTab === 'rooms') fetchRooms();
    if (activeTab === 'housekeeping') fetchHousekeeping();
    if (activeTab === 'requests') fetchRequests();
  }, [activeTab]);

  const fetchOperationsSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/staff/operations');
      if (res.data && res.data.data) {
        setOperations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load operational metrics', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchArrivals = async () => {
    try {
      const res = await api.get('/staff/arrivals', { params: { search: searchQuery || undefined } });
      if (res.data && res.data.data) {
        setArrivals(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load arrivals', err);
    }
  };

  const fetchDepartures = async () => {
    try {
      const res = await api.get('/staff/departures');
      if (res.data && res.data.data) {
        setDepartures(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load departures', err);
    }
  };

  const fetchRooms = async () => {
    try {
      const res = await api.get('/rooms', { params: { limit: 50 } });
      if (res.data && res.data.data) {
        setRooms(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load rooms', err);
    }
  };

  const fetchHousekeeping = async () => {
    try {
      const res = await api.get('/staff/housekeeping');
      if (res.data && res.data.data) {
        setHousekeeping(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load housekeeping tasks', err);
    }
  };

  const fetchRequests = async () => {
    try {
      const res = await api.get('/staff/service-requests');
      if (res.data && res.data.data) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load service requests', err);
    }
  };

  // Staff Actions
  const handleCheckIn = async (bookingId) => {
    try {
      await api.post(`/staff/bookings/${bookingId}/check-in`);
      setActionMsg({ type: 'success', text: 'Guest checked in successfully. Room physical status set to Occupied.' });
      fetchArrivals();
      fetchOperationsSummary();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Check-in failed' });
    }
  };

  const handleCheckOut = async (bookingId) => {
    try {
      await api.post(`/staff/bookings/${bookingId}/check-out`);
      setActionMsg({ type: 'success', text: 'Guest checked out. Housekeeping cleaning task automatically dispatched.' });
      fetchDepartures();
      fetchOperationsSummary();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Check-out failed' });
    }
  };

  const handleUpdateRoomStatus = async (roomId, physicalStatus) => {
    try {
      await api.put(`/staff/rooms/${roomId}/status`, { physicalStatus });
      setActionMsg({ type: 'success', text: `Room status updated to ${physicalStatus}.` });
      fetchRooms();
      fetchOperationsSummary();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to update room' });
    }
  };

  const handleUpdateHousekeeping = async (taskId, status) => {
    try {
      await api.put(`/staff/housekeeping/${taskId}`, { status });
      setActionMsg({ type: 'success', text: `Housekeeping task marked as ${status}.` });
      fetchHousekeeping();
      fetchOperationsSummary();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to update task' });
    }
  };

  const handleResolveRequest = async (requestId) => {
    try {
      await api.put(`/staff/service-requests/${requestId}`, { status: 'resolved' });
      setActionMsg({ type: 'success', text: 'Guest service request resolved.' });
      fetchRequests();
      fetchOperationsSummary();
    } catch (err) {
      setActionMsg({ type: 'danger', text: err.response?.data?.message || 'Failed to resolve request' });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Connecting to Hotel Operations Hub..." />;
  }

  return (
    <div className="staff-dashboard py-5 bg-light min-vh-100">
      <div className="container">
        {/* Top Header */}
        <div className="card hp-card p-4 border-0 shadow-sm mb-4 bg-white">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <div>
              <span className="badge bg-info text-dark text-uppercase px-2 py-1 small fw-bold">
                Hotel Staff Operations Hub
              </span>
              <h2 className="brand-font fw-bold text-dark mb-1 mt-1">Daily Front-Desk & Housekeeping Desk</h2>
              <span className="text-secondary small">Real-time room turns, guest arrivals, and service tickets</span>
            </div>
            <button onClick={fetchOperationsSummary} className="btn btn-outline-secondary btn-sm">
              Refresh Live Data
            </button>
          </div>
        </div>

        {actionMsg.text && (
          <div className={`alert alert-${actionMsg.type} alert-dismissible fade show mb-4`} role="alert">
            {actionMsg.text}
            <button type="button" className="btn-close" onClick={() => setActionMsg({ type: '', text: '' })}></button>
          </div>
        )}

        {/* Operational Overview KPIs */}
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-sm-6">
            <div className="card hp-card p-3 border-0 shadow-sm text-center">
              <div className="small text-muted mb-1">Today's Expected Arrivals</div>
              <h3 className="fw-bold text-dark mb-0">{operations?.arrivalsCount || 0}</h3>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="card hp-card p-3 border-0 shadow-sm text-center">
              <div className="small text-muted mb-1">Departures / Active Stays</div>
              <h3 className="fw-bold text-dark mb-0">{operations?.departuresCount || 0}</h3>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="card hp-card p-3 border-0 shadow-sm text-center">
              <div className="small text-muted mb-1">Occupancy Rate</div>
              <h3 className="fw-bold text-warning mb-0">{operations?.occupancyRate || 0}%</h3>
              <div className="small text-muted" style={{ fontSize: '11px' }}>
                {operations?.occupiedRooms} / {operations?.totalRooms} Rooms Occupied
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6">
            <div className="card hp-card p-3 border-0 shadow-sm text-center">
              <div className="small text-muted mb-1">Rooms in Housekeeping</div>
              <h3 className="fw-bold text-info mb-0">{operations?.cleaningRooms || 0}</h3>
              <div className="small text-muted" style={{ fontSize: '11px' }}>
                {operations?.pendingRequests || 0} Pending Service Requests
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="card hp-card p-2 border-0 shadow-sm mb-4">
          <div className="d-flex flex-wrap gap-2">
            {[
              { id: 'operations', label: 'Overview', count: null },
              { id: 'arrivals', label: 'Guest Check-In', count: arrivals.length },
              { id: 'departures', label: 'Guest Check-Out', count: departures.length },
              { id: 'rooms', label: 'Room Physical Status', count: rooms.length },
              { id: 'housekeeping', label: 'Housekeeping Dispatch', count: housekeeping.length },
              { id: 'requests', label: 'Guest Requests', count: requests.length }
            ].map((tab) => (
              <button
                key={tab.id}
                className={`btn btn-sm ${activeTab === tab.id ? 'btn-navy fw-bold' : 'btn-light text-secondary'}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} {tab.count !== null && <span className="badge bg-secondary ms-1">{tab.count}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Overview Tab */}
        {activeTab === 'operations' && (
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card hp-card p-4 border-0 shadow-sm h-100">
                <h5 className="fw-bold text-dark mb-3">Front-Desk Checklist</h5>
                <ul className="list-group list-group-flush small">
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Verify arriving guest government ID upon key handover</span>
                    <span className="badge bg-light text-dark border">Standard Protocol</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Ensure departing rooms are marked 'Cleaning' for turn service</span>
                    <span className="badge bg-light text-dark border">Automated</span>
                  </li>
                  <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                    <span>Check VIP special requests for late check-out or champagne</span>
                    <span className="badge bg-light text-dark border">Priority</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card hp-card p-4 border-0 shadow-sm h-100">
                <h5 className="fw-bold text-dark mb-3">Housekeeping & Maintenance Overview</h5>
                <p className="text-secondary small mb-3">
                  Rooms currently under maintenance or deep sanitization:
                </p>
                <div className="d-flex gap-3">
                  <div className="p-3 bg-light rounded-3 text-center flex-fill border">
                    <div className="fs-4 fw-bold text-dark">{operations?.cleaningRooms}</div>
                    <div className="small text-muted">Cleaning Required</div>
                  </div>
                  <div className="p-3 bg-light rounded-3 text-center flex-fill border">
                    <div className="fs-4 fw-bold text-danger">{operations?.maintenanceRooms}</div>
                    <div className="small text-muted">In Maintenance</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Arrivals (Check-in) */}
        {activeTab === 'arrivals' && (
          <div className="card hp-card p-4 border-0 shadow-sm">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold text-dark mb-0">Guest Arrivals & Check-in Desk</h5>
              <div className="input-group" style={{ maxWidth: '280px' }}>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search by ref or guest..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button onClick={fetchArrivals} className="btn btn-outline-secondary btn-sm">
                  <Search size={14} />
                </button>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    <th>Guest</th>
                    <th>Suite / Room</th>
                    <th>Check-in Window</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {arrivals.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No pending arrivals found.
                      </td>
                    </tr>
                  ) : (
                    arrivals.map((b) => (
                      <tr key={b._id}>
                        <td className="fw-bold font-monospace">{b.bookingReference}</td>
                        <td>
                          <div className="fw-bold text-dark">{b.guestDetails?.fullName}</div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>{b.guestDetails?.phone}</div>
                        </td>
                        <td>
                          {b.room?.title} <span className="badge bg-light text-dark border">Room {b.room?.roomNumber}</span>
                        </td>
                        <td>{new Date(b.checkInDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`badge ${b.status === 'confirmed' ? 'badge-status-confirmed' : 'badge-status-pending'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {b.status !== 'checked_in' && (
                            <button
                              onClick={() => handleCheckIn(b._id)}
                              className="btn btn-success btn-sm d-inline-flex align-items-center gap-1"
                            >
                              <Check size={14} /> Verify & Check-in
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Departures (Check-out) */}
        {activeTab === 'departures' && (
          <div className="card hp-card p-4 border-0 shadow-sm">
            <h5 className="fw-bold text-dark mb-4">Checked-In Guests & Departure Processing</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Reference</th>
                    <th>Guest</th>
                    <th>Suite / Room</th>
                    <th>Departure Date</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {departures.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No checked-in guests currently.
                      </td>
                    </tr>
                  ) : (
                    departures.map((b) => (
                      <tr key={b._id}>
                        <td className="fw-bold font-monospace">{b.bookingReference}</td>
                        <td>
                          <div className="fw-bold text-dark">{b.guestDetails?.fullName}</div>
                          <div className="text-muted" style={{ fontSize: '11px' }}>{b.guestDetails?.phone}</div>
                        </td>
                        <td>
                          {b.room?.title} <span className="badge bg-light text-dark border">Room {b.room?.roomNumber}</span>
                        </td>
                        <td>{new Date(b.checkOutDate).toLocaleDateString()}</td>
                        <td>
                          <span className="badge badge-status-checked-in">In-House</span>
                        </td>
                        <td className="text-end">
                          <button
                            onClick={() => handleCheckOut(b._id)}
                            className="btn btn-navy btn-sm d-inline-flex align-items-center gap-1"
                          >
                            <LogOut size={14} /> Process Check-out
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Room Physical Status Toggle */}
        {activeTab === 'rooms' && (
          <div className="card hp-card p-4 border-0 shadow-sm">
            <h5 className="fw-bold text-dark mb-3">Room Physical Housekeeping Status</h5>
            <p className="text-secondary small mb-4">
              Physical status tracks cleanliness and maintenance. Note: Changing physical status does not alter calendar booking availability!
            </p>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Suite Title</th>
                    <th>Category</th>
                    <th>Physical Status</th>
                    <th className="text-end">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.map((r) => (
                    <tr key={r._id}>
                      <td className="fw-bold">Room {r.roomNumber}</td>
                      <td>{r.title}</td>
                      <td className="text-capitalize">{r.type}</td>
                      <td>
                        <span
                          className={`badge text-capitalize ${
                            r.physicalStatus === 'available'
                              ? 'bg-success'
                              : r.physicalStatus === 'occupied'
                              ? 'bg-primary'
                              : r.physicalStatus === 'cleaning'
                              ? 'bg-warning text-dark'
                              : 'bg-danger'
                          }`}
                        >
                          {r.physicalStatus}
                        </span>
                      </td>
                      <td className="text-end">
                        <select
                          className="form-select form-select-sm d-inline-block w-auto text-capitalize"
                          value={r.physicalStatus}
                          onChange={(e) => handleUpdateRoomStatus(r._id, e.target.value)}
                        >
                          <option value="available">Available</option>
                          <option value="occupied">Occupied</option>
                          <option value="cleaning">Cleaning</option>
                          <option value="maintenance">Maintenance</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 5: Housekeeping Tasks */}
        {activeTab === 'housekeeping' && (
          <div className="card hp-card p-4 border-0 shadow-sm">
            <h5 className="fw-bold text-dark mb-4">Housekeeping Task Board</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Task Type</th>
                    <th>Priority</th>
                    <th>Notes</th>
                    <th>Status</th>
                    <th className="text-end">Mark Status</th>
                  </tr>
                </thead>
                <tbody>
                  {housekeeping.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No active housekeeping tasks.
                      </td>
                    </tr>
                  ) : (
                    housekeeping.map((t) => (
                      <tr key={t._id}>
                        <td className="fw-bold">Room {t.room?.roomNumber}</td>
                        <td className="text-capitalize">{t.taskType}</td>
                        <td>
                          <span className={`badge ${t.priority === 'urgent' || t.priority === 'high' ? 'bg-danger' : 'bg-secondary'}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="text-secondary">{t.notes}</td>
                        <td>
                          <span className={`badge text-capitalize ${t.status === 'completed' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {t.status !== 'completed' ? (
                            <button
                              onClick={() => handleUpdateHousekeeping(t._id, 'completed')}
                              className="btn btn-outline-success btn-sm"
                            >
                              <Check size={14} className="me-1" /> Mark Cleaned
                            </button>
                          ) : (
                            <span className="text-success small fw-bold">✓ Done</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 6: Guest Service Requests */}
        {activeTab === 'requests' && (
          <div className="card hp-card p-4 border-0 shadow-sm">
            <h5 className="fw-bold text-dark mb-4">Guest Concierge & Service Tickets</h5>
            <div className="table-responsive">
              <table className="table table-hover align-middle small">
                <thead className="table-light">
                  <tr>
                    <th>Room</th>
                    <th>Guest</th>
                    <th>Request Category</th>
                    <th>Details</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-4 text-muted">
                        No service requests at this time.
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req._id}>
                        <td className="fw-bold">Room {req.room?.roomNumber}</td>
                        <td>{req.guest?.name}</td>
                        <td className="text-capitalize">{req.requestType.replace('_', ' ')}</td>
                        <td>{req.description}</td>
                        <td>
                          <span className={`badge ${req.status === 'resolved' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="text-end">
                          {req.status !== 'resolved' && (
                            <button
                              onClick={() => handleResolveRequest(req._id)}
                              className="btn btn-success btn-sm"
                            >
                              Resolve Ticket
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDashboard;
