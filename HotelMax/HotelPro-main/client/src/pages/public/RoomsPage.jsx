import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, RotateCcw, Users, Calendar, ArrowRight, Star } from 'lucide-react';
import api from '../../services/api';
import { SkeletonCard } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const RoomsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Filters state
  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkInDate') || today);
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOutDate') || nextWeek);
  const [guests, setGuests] = useState(searchParams.get('guests') || '1');
  const [type, setType] = useState(searchParams.get('type') || 'all');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'basePrice');
  const [sortOrder, setSortOrder] = useState(searchParams.get('sortOrder') || 'asc');
  const [page, setPage] = useState(1);

  const [rooms, setRooms] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [checkInDate, checkOutDate, guests, type, maxPrice, sortBy, sortOrder, page]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = {
        checkInDate,
        checkOutDate,
        guests,
        type: type !== 'all' ? type : undefined,
        maxPrice: maxPrice || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 9
      };

      const res = await api.get('/rooms', { params });
      if (res.data && res.data.data) {
        setRooms(res.data.data);
        setPagination(res.data.meta || { total: res.data.data.length, page: 1, totalPages: 1 });
      }
    } catch (err) {
      console.error('Failed to load rooms', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setCheckInDate(today);
    setCheckOutDate(nextWeek);
    setGuests('1');
    setType('all');
    setMaxPrice('');
    setSortBy('basePrice');
    setSortOrder('asc');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="rooms-page py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="section-tag">Accommodations</span>
          <h1 className="section-title">Explore Suites & Residences</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Choose from intimate boutique quarters to grand oceanfront presidential penthouses.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="card hp-card p-4 mb-5 border-0 shadow-sm">
          <div className="row g-3 align-items-end">
            <div className="col-lg-2 col-md-4">
              <label className="form-label small fw-bold text-secondary mb-1">
                <Calendar size={14} className="me-1 text-warning" /> Check-in
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={checkInDate}
                min={today}
                onChange={(e) => setCheckInDate(e.target.value)}
              />
            </div>
            <div className="col-lg-2 col-md-4">
              <label className="form-label small fw-bold text-secondary mb-1">
                <Calendar size={14} className="me-1 text-warning" /> Check-out
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={checkOutDate}
                min={checkInDate || today}
                onChange={(e) => setCheckOutDate(e.target.value)}
              />
            </div>
            <div className="col-lg-2 col-md-4">
              <label className="form-label small fw-bold text-secondary mb-1">
                <Users size={14} className="me-1 text-warning" /> Min Capacity
              </label>
              <select
                className="form-select form-select-sm"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-4">
              <label className="form-label small fw-bold text-secondary mb-1">
                Room Category
              </label>
              <select
                className="form-select form-select-sm text-capitalize"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="all">All Categories</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Executive Suite</option>
                <option value="presidential">Presidential</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-4">
              <label className="form-label small fw-bold text-secondary mb-1">
                Max Price ($/night)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                className="form-control form-control-sm"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
            <div className="col-lg-2 col-md-4">
              <label className="form-label small fw-bold text-secondary mb-1">
                Sort By
              </label>
              <select
                className="form-select form-select-sm"
                value={`${sortBy}_${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('_');
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <option value="basePrice_asc">Price: Low to High</option>
                <option value="basePrice_desc">Price: High to Low</option>
                <option value="capacity.maxGuests_desc">Capacity: High to Low</option>
              </select>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <span className="small text-secondary">
              Showing <strong>{rooms.length}</strong> of <strong>{pagination.total}</strong> available rooms
            </span>
            <button
              onClick={handleResetFilters}
              className="btn btn-link text-secondary btn-sm p-0 d-flex align-items-center gap-1 text-decoration-none"
            >
              <RotateCcw size={14} /> Reset Filters
            </button>
          </div>
        </div>

        {/* Room List Grid */}
        {loading ? (
          <div className="row g-4">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="col-lg-4 col-md-6">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : rooms.length === 0 ? (
          <EmptyState
            title="No Accommodations Found"
            description="We could not find rooms matching your selected filters and dates. Please adjust dates or clear filters."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="row g-4">
            {rooms.map((room) => (
              <div key={room._id} className="col-lg-4 col-md-6">
                <div className="card hp-card h-100 overflow-hidden d-flex flex-column">
                  <div className="position-relative overflow-hidden" style={{ height: '240px' }}>
                    <img
                      src={room.photos[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                      alt={room.title}
                      className="w-100 h-100 object-fit-cover transition-transform"
                    />
                    <span className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 text-warning px-3 py-2 fw-semibold text-capitalize">
                      {room.type}
                    </span>
                    <span className="position-absolute bottom-0 start-0 m-3 badge bg-light text-dark fw-bold px-2 py-1 small">
                      Room {room.roomNumber}
                    </span>
                  </div>

                  <div className="card-body p-4 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="d-flex align-items-center gap-1 text-warning small">
                        <Star size={14} fill="#d4af37" color="#d4af37" />
                        <span className="fw-bold text-dark">4.9</span>
                        <span className="text-muted">(Verified)</span>
                      </div>
                      <span className="small text-secondary">Up to {room.capacity.maxGuests} guests</span>
                    </div>

                    <h4 className="fw-bold text-dark mb-2">{room.title}</h4>
                    <p className="text-secondary small mb-3 flex-grow-1" style={{ lineHeight: '1.6' }}>
                      {room.description.length > 110 ? `${room.description.substring(0, 110)}...` : room.description}
                    </p>

                    <div className="d-flex flex-wrap gap-1 mb-4">
                      {room.amenities.slice(0, 3).map((a, i) => (
                        <span key={i} className="badge bg-light text-secondary border small">
                          {a}
                        </span>
                      ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-3 border-top mt-auto">
                      <div>
                        <span className="text-muted small">From </span>
                        <span className="fs-4 fw-bold text-dark">${room.basePrice}</span>
                        <span className="text-muted small"> / night</span>
                      </div>
                      <Link
                        to={`/rooms/${room._id}?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guests=${guests}`}
                        className="btn btn-gold btn-sm d-flex align-items-center gap-1"
                      >
                        Reserve <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <nav className="d-flex justify-content-center mt-5">
            <ul className="pagination">
              <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
              </li>
              {[...Array(pagination.totalPages)].map((_, i) => (
                <li key={i} className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => setPage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${pagination.page === pagination.totalPages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default RoomsPage;
