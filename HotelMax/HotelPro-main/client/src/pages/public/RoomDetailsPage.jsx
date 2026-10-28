import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Star, Users, Maximize2, Bed, Check, ShieldCheck, Calendar, ArrowRight, MessageSquare } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const RoomDetailsPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [checkInDate, setCheckInDate] = useState(searchParams.get('checkInDate') || today);
  const [checkOutDate, setCheckOutDate] = useState(searchParams.get('checkOutDate') || nextWeek);
  const [guests, setGuests] = useState(searchParams.get('guests') || '2');

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ totalReviews: 0, averageRating: 5.0 });
  const [activePhoto, setActivePhoto] = useState(0);

  const [pricing, setPricing] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchRoomDetails();
  }, [id]);

  useEffect(() => {
    if (room && checkInDate && checkOutDate) {
      calculateLivePrice();
    }
  }, [room, checkInDate, checkOutDate, guests]);

  const fetchRoomDetails = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/rooms/${id}`);
      if (res.data && res.data.data) {
        setRoom(res.data.data.room);
        setReviews(res.data.data.reviews || []);
        setReviewStats(res.data.data.reviewStats || { totalReviews: 0, averageRating: 5.0 });
      }
    } catch (err) {
      console.error('Failed to load room details', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateLivePrice = async () => {
    setCalculating(true);
    try {
      const res = await api.post('/rooms/calculate-price', {
        roomId: id,
        checkInDate,
        checkOutDate,
        guests: parseInt(guests, 10)
      });
      if (res.data && res.data.data) {
        setPricing(res.data.data.pricing);
        setIsAvailable(res.data.data.isAvailable);
      }
    } catch (err) {
      console.error('Error calculating price', err);
    } finally {
      setCalculating(false);
    }
  };

  const handleProceedToBooking = () => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/checkout&roomId=${id}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guests=${guests}`);
      return;
    }
    navigate(`/checkout?roomId=${id}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}&guests=${guests}`);
  };

  if (loading) {
    return <LoadingSpinner text="Fetching suite accommodations & gallery..." />;
  }

  if (!room) {
    return (
      <div className="container py-5 text-center">
        <h3 className="fw-bold text-dark">Suite Not Found</h3>
        <p className="text-muted">The requested room does not exist or has been archived.</p>
        <Link to="/rooms" className="btn btn-navy">Browse Other Suites</Link>
      </div>
    );
  }

  return (
    <div className="room-details-page py-5">
      <div className="container">
        {/* Navigation Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none">Home</Link></li>
            <li className="breadcrumb-item"><Link to="/rooms" className="text-secondary text-decoration-none">Accommodations</Link></li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">{room.title}</li>
          </ol>
        </nav>

        {/* Title Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-end mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge bg-warning text-dark text-capitalize px-3 py-1 fw-bold">
                {room.type} Suite
              </span>
              <span className="text-secondary small">Room No. {room.roomNumber}</span>
              <div className="d-flex align-items-center gap-1 text-warning small ms-2">
                <Star size={16} fill="#d4af37" color="#d4af37" />
                <span className="fw-bold text-dark">{reviewStats.averageRating}</span>
                <span className="text-muted">({reviewStats.totalReviews} guest reviews)</span>
              </div>
            </div>
            <h1 className="display-5 fw-bold text-dark mb-0">{room.title}</h1>
          </div>
          <div className="text-md-end mt-3 mt-md-0">
            <span className="text-secondary small">From</span>
            <div className="d-flex align-items-baseline gap-1">
              <span className="display-6 fw-bold text-dark">${room.basePrice}</span>
              <span className="text-muted"> / night</span>
            </div>
          </div>
        </div>

        {/* Photo Gallery */}
        <div className="row g-3 mb-5">
          <div className="col-lg-8">
            <div className="rounded-4 overflow-hidden shadow-sm" style={{ height: '480px' }}>
              <img
                src={room.photos[activePhoto] || room.photos[0]}
                alt={room.title}
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="row g-3">
              {room.photos.map((photo, index) => (
                <div key={index} className="col-6 col-lg-12">
                  <div
                    className={`rounded-3 overflow-hidden cursor-pointer border ${activePhoto === index ? 'border-warning border-3' : 'border-transparent'}`}
                    style={{ height: '148px', cursor: 'pointer' }}
                    onClick={() => setActivePhoto(index)}
                  >
                    <img src={photo} alt="" className="w-100 h-100 object-fit-cover" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Layout */}
        <div className="row g-5">
          {/* Left Details */}
          <div className="col-lg-7">
            {/* Room Features Bar */}
            <div className="d-flex flex-wrap gap-4 p-3 bg-white rounded-3 border mb-4">
              <div className="d-flex align-items-center gap-2">
                <Users size={20} className="text-warning" />
                <div>
                  <div className="small text-muted">Capacity</div>
                  <div className="fw-bold text-dark">Up to {room.capacity.maxGuests} Guests</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Bed size={20} className="text-warning" />
                <div>
                  <div className="small text-muted">Bedding</div>
                  <div className="fw-bold text-dark">{room.bedType}</div>
                </div>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Maximize2 size={20} className="text-warning" />
                <div>
                  <div className="small text-muted">Dimensions</div>
                  <div className="fw-bold text-dark">{room.sizeSqFt} sq. ft.</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <h4 className="fw-bold text-dark mb-3">Suite Overview</h4>
            <p className="text-secondary leading-relaxed mb-5" style={{ fontSize: '1.05rem', lineHeight: '1.8' }}>
              {room.description}
            </p>

            {/* Amenities List */}
            <h4 className="fw-bold text-dark mb-3">Amenities & Hospitality Inclusions</h4>
            <div className="row g-3 mb-5">
              {room.amenities.map((item, idx) => (
                <div key={idx} className="col-sm-6">
                  <div className="d-flex align-items-center gap-2 text-secondary">
                    <div className="bg-warning bg-opacity-10 text-warning p-1 rounded-circle">
                      <Check size={16} />
                    </div>
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Policies */}
            <div className="p-4 bg-light rounded-3 mb-5 border">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <ShieldCheck size={20} className="text-warning" /> Stay Policies
              </h5>
              <ul className="small text-secondary mb-0 list-unstyled d-flex flex-column gap-2">
                <li>• <strong>Check-in:</strong> 15:00 onwards. Express digital check-in available.</li>
                <li>• <strong>Check-out:</strong> Until 11:00. Late check-out subject to availability.</li>
                <li>• <strong>Cancellation:</strong> Free cancellation up to 24 hours prior to scheduled arrival.</li>
                <li>• <strong>Smoking & Pets:</strong> 100% smoke-free suites. Service animals warmly welcomed.</li>
              </ul>
            </div>

            {/* Verified Reviews Section */}
            <div>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                  <MessageSquare size={22} className="text-warning" /> Verified Guest Reviews
                </h4>
                <span className="badge bg-light text-dark border">
                  {reviewStats.totalReviews} Total Reviews
                </span>
              </div>

              {reviews.length === 0 ? (
                <div className="p-4 text-center bg-white border rounded-3 text-muted small">
                  No written reviews yet for this suite. Be the first to experience it!
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-4 bg-white border rounded-3 shadow-sm">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={rev.user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                            alt={rev.user?.name}
                            className="rounded-circle"
                            style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                          />
                          <div>
                            <div className="fw-bold text-dark small">{rev.user?.name || 'Verified Guest'}</div>
                            <div className="text-muted" style={{ fontSize: '11px' }}>
                              {new Date(rev.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="d-flex text-warning">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} fill="#d4af37" color="#d4af37" />
                          ))}
                        </div>
                      </div>
                      <h6 className="fw-bold text-dark mb-1">{rev.title}</h6>
                      <p className="text-secondary small mb-0">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Live Booking Widget */}
          <div className="col-lg-5">
            <div className="card hp-card p-4 sticky-top border-0 shadow-lg" style={{ top: '100px' }}>
              <h4 className="fw-bold text-dark mb-1">Reserve Your Stay</h4>
              <p className="text-muted small mb-4">Select your dates to view transparent pricing breakdown</p>

              {/* Date pickers */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    <Calendar size={14} className="me-1 text-warning" /> Check-in
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkInDate}
                    min={today}
                    onChange={(e) => setCheckInDate(e.target.value)}
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-bold text-secondary mb-1">
                    <Calendar size={14} className="me-1 text-warning" /> Check-out
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={checkOutDate}
                    min={checkInDate || today}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Guests Selection */}
              <div className="mb-4">
                <label className="form-label small fw-bold text-secondary mb-1">
                  <Users size={14} className="me-1 text-warning" /> Total Guests
                </label>
                <select
                  className="form-select"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                >
                  {[...Array(room.capacity.maxGuests)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1} Guest{i > 0 ? 's' : ''} {i + 1 === room.capacity.maxGuests ? '(Max)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Availability Status */}
              <div className="mb-4">
                {isAvailable ? (
                  <div className="alert alert-success d-flex align-items-center gap-2 py-2 small mb-0">
                    <Check size={16} /> Room is available for your dates!
                  </div>
                ) : (
                  <div className="alert alert-danger py-2 small mb-0">
                    This suite is currently reserved for the selected dates. Please adjust dates.
                  </div>
                )}
              </div>

              {/* Itemized Price Breakdown */}
              {calculating ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-warning me-2"></div>
                  <span className="small text-muted">Calculating exact rates...</span>
                </div>
              ) : pricing ? (
                <div className="bg-light p-3 rounded-3 mb-4">
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>${pricing.nightlyRate} × {pricing.totalNights} night{pricing.totalNights > 1 ? 's' : ''}</span>
                    <span className="fw-semibold text-dark">${pricing.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Hospitality Tax ({pricing.taxRatePercentage}%)</span>
                    <span className="fw-semibold text-dark">${pricing.taxes.toFixed(2)}</span>
                  </div>
                  <div className="d-flex justify-content-between small text-secondary mb-2">
                    <span>Cleaning & Sanitization</span>
                    <span className="fw-semibold text-dark">${pricing.cleaningFee.toFixed(2)}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-dark">Estimated Total:</span>
                    <span className="fs-4 fw-bold text-warning">${pricing.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ) : null}

              {/* Action Button */}
              <button
                className="btn btn-gold w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                onClick={handleProceedToBooking}
                disabled={!isAvailable || calculating}
              >
                Proceed to Checkout <ArrowRight size={18} />
              </button>

              <div className="text-center mt-3">
                <span className="text-muted small">You won't be charged until the final review step.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetailsPage;
