import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Users, Home, Search, Star, Award, Sparkles, Coffee, ShieldCheck, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { SkeletonCard } from '../../components/common/LoadingSpinner';

const HomePage = () => {
  const navigate = useNavigate();

  // Search parameters
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(nextWeek);
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('all');

  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/rooms/featured');
        if (res.data && res.data.data) {
          setFeaturedRooms(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load featured rooms', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams({
      checkInDate,
      checkOutDate,
      guests,
      type: roomType
    }).toString();
    navigate(`/rooms?${query}`);
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <span className="badge bg-warning text-dark px-3 py-2 text-uppercase fw-bold mb-3 d-inline-flex align-items-center gap-1" style={{ letterSpacing: '0.1em' }}>
                <Sparkles size={14} /> Uncompromising Luxury Hospitality
              </span>
              <h1 className="display-3 fw-bold mb-3 text-white">
                Experience Timeless Elegance & Bespoke Comfort
              </h1>
              <p className="lead text-light opacity-90 mx-auto mb-4" style={{ maxWidth: '720px' }}>
                Welcome to HotelPro. Where refined architectural grandeur meets world-class personalized service along pristine ocean shores.
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to="/rooms" className="btn btn-gold btn-lg px-4">
                  Browse Accommodations
                </Link>
                <Link to="/about" className="btn btn-outline-light btn-lg px-4">
                  Our Heritage
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Search Form Bar */}
      <div className="container">
        <div className="booking-search-bar">
          <form onSubmit={handleSearch} className="row g-3 align-items-end">
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-bold text-secondary mb-1">
                <Calendar size={14} className="me-1 text-warning" /> Check-in Date
              </label>
              <input
                type="date"
                className="form-control"
                min={today}
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                required
              />
            </div>
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-bold text-secondary mb-1">
                <Calendar size={14} className="me-1 text-warning" /> Check-out Date
              </label>
              <input
                type="date"
                className="form-control"
                min={checkInDate || today}
                value={checkOutDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                required
              />
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label small fw-bold text-secondary mb-1">
                <Users size={14} className="me-1 text-warning" /> Guests
              </label>
              <select className="form-select" value={guests} onChange={(e) => setGuests(e.target.value)}>
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="3">3 Guests</option>
                <option value="4">4+ Guests</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-6">
              <label className="form-label small fw-bold text-secondary mb-1">
                <Home size={14} className="me-1 text-warning" /> Room Category
              </label>
              <select className="form-select text-capitalize" value={roomType} onChange={(e) => setRoomType(e.target.value)}>
                <option value="all">All Suites</option>
                <option value="single">Single</option>
                <option value="double">Double</option>
                <option value="deluxe">Deluxe</option>
                <option value="suite">Executive Suite</option>
                <option value="presidential">Presidential</option>
              </select>
            </div>
            <div className="col-lg-2 col-md-12">
              <button type="submit" className="btn btn-gold w-100 d-flex align-items-center justify-content-center gap-2 py-2">
                <Search size={16} /> Search Rooms
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Featured Suites Section */}
      <section className="py-5 my-4">
        <div className="container">
          <div className="text-center mb-5">
            <span className="section-tag">Curated Collections</span>
            <h2 className="section-title">Signature Suites & Residences</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Handcrafted sanctuaries blending architectural warmth, natural textures, and panoramic vistas.
            </p>
          </div>

          <div className="row g-4">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="col-lg-4 col-md-6">
                  <SkeletonCard />
                </div>
              ))
            ) : featuredRooms.length === 0 ? (
              <div className="col-12 text-center py-5">
                <p className="text-muted">No rooms currently featured. Please check our full catalog.</p>
                <Link to="/rooms" className="btn btn-navy">View All Rooms</Link>
              </div>
            ) : (
              featuredRooms.map((room) => (
                <div key={room._id} className="col-lg-4 col-md-6">
                  <div className="card hp-card h-100 overflow-hidden d-flex flex-column">
                    <div className="position-relative overflow-hidden" style={{ height: '240px' }}>
                      <img
                        src={room.photos[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'}
                        alt={room.title}
                        className="w-100 h-100 object-fit-cover transition-transform"
                      />
                      <span className="position-absolute top-0 end-0 m-3 badge bg-dark bg-opacity-75 text-warning px-3 py-2 fw-semibold text-capitalize">
                        {room.type} Room
                      </span>
                    </div>
                    <div className="card-body p-4 d-flex flex-column">
                      <div className="d-flex align-items-center gap-1 text-warning mb-2 small">
                        <Star size={14} fill="#d4af37" color="#d4af37" />
                        <span className="fw-bold text-dark">4.9</span>
                        <span className="text-muted">(Verified Stay Reviews)</span>
                      </div>
                      <h4 className="fw-bold text-dark mb-2">{room.title}</h4>
                      <p className="text-secondary small mb-3 flex-grow-1" style={{ lineHeight: '1.6' }}>
                        {room.description.length > 120 ? `${room.description.substring(0, 120)}...` : room.description}
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
                        <Link to={`/rooms/${room._id}`} className="btn btn-outline-gold btn-sm d-flex align-items-center gap-1">
                          View Details <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center mt-5">
            <Link to="/rooms" className="btn btn-navy px-4 py-2">
              Explore All Suites & Availability
            </Link>
          </div>
        </div>
      </section>

      {/* Amenities & Experience Grid */}
      <section className="py-5 bg-white border-top border-bottom">
        <div className="container py-4">
          <div className="text-center mb-5">
            <span className="section-tag">Hospitality Redefined</span>
            <h2 className="section-title">The HotelPro Experience</h2>
            <p className="text-muted mx-auto" style={{ maxWidth: '640px' }}>
              Every touchpoint is thoughtfully curated to provide peace of mind, restorative wellness, and unmatched culinary journeys.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-lg-3 col-md-6">
              <div className="p-4 rounded-3 h-100 border text-center hover-shadow transition">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-inline-flex mb-3">
                  <Award size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Michelin Dining</h5>
                <p className="text-secondary small mb-0">
                  Savor farm-to-table tasting menus curated by acclaimed chefs, paired with international sommelier selections.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="p-4 rounded-3 h-100 border text-center hover-shadow transition">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-inline-flex mb-3">
                  <Sparkles size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Thermal Spa & Baths</h5>
                <p className="text-secondary small mb-0">
                  Rejuvenate with bespoke holistic therapies, mineral salt plunge pools, and Scandinavian steam sanctuaries.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="p-4 rounded-3 h-100 border text-center hover-shadow transition">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-inline-flex mb-3">
                  <Coffee size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">24/7 Butler Service</h5>
                <p className="text-secondary small mb-0">
                  From unpacking your luggage to arranging private sunset yacht charters, our concierge caters to every desire.
                </p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="p-4 rounded-3 h-100 border text-center hover-shadow transition">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-inline-flex mb-3">
                  <ShieldCheck size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Zero-Stress Booking</h5>
                <p className="text-secondary small mb-0">
                  Transparent itemized rates with no surprise checkout fees and flexible 24-hour cancellation policies.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-5" style={{ background: 'linear-gradient(135deg, #0e1e38 0%, #162a4d 100%)' }}>
        <div className="container py-4 text-center text-white">
          <span className="badge bg-warning text-dark px-3 py-2 fw-bold text-uppercase mb-3">
            Limited Time Offer
          </span>
          <h2 className="display-5 fw-bold mb-3">Complimentary Spa Credit on 3+ Nights</h2>
          <p className="lead text-light opacity-90 mx-auto mb-4" style={{ maxWidth: '650px' }}>
            Book your stay directly on HotelPro to receive a complimentary $150 wellness credit and priority sunset dining reservations.
          </p>
          <Link to="/rooms" className="btn btn-gold btn-lg px-5">
            Book Your Getaway
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
