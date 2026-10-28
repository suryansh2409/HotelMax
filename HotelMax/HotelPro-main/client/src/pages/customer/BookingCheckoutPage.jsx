import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, CreditCard, Calendar, Users, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const BookingCheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const roomId = searchParams.get('roomId');
  const checkInDate = searchParams.get('checkInDate');
  const checkOutDate = searchParams.get('checkOutDate');
  const guestsCount = parseInt(searchParams.get('guests') || '1', 10);

  const [room, setRoom] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Confirmed booking state
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Form details
  const [guestDetails, setGuestDetails] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    specialRequests: ''
  });

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '•••• •••• •••• 4242',
    cardExpiry: '12/28',
    cardCvc: '•••',
    cardName: user?.name || 'Alexander Wright'
  });

  useEffect(() => {
    if (!roomId || !checkInDate || !checkOutDate) {
      navigate('/rooms');
      return;
    }
    fetchCheckoutData();
  }, [roomId, checkInDate, checkOutDate]);

  const fetchCheckoutData = async () => {
    setLoading(true);
    try {
      const [roomRes, priceRes] = await Promise.all([
        api.get(`/rooms/${roomId}`),
        api.post('/rooms/calculate-price', {
          roomId,
          checkInDate,
          checkOutDate,
          guests: guestsCount
        })
      ]);

      if (roomRes.data && roomRes.data.data) {
        setRoom(roomRes.data.data.room);
      }
      if (priceRes.data && priceRes.data.data) {
        setPricing(priceRes.data.data.pricing);
        if (!priceRes.data.data.isAvailable) {
          setError('This room has just been reserved for your selected dates. Please choose another date or room.');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize reservation checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReservation = async (e) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      // 1. Create Booking in database
      const bookingPayload = {
        roomId,
        checkInDate,
        checkOutDate,
        guests: { adults: guestsCount, children: 0 },
        guestDetails,
        paymentMethod
      };

      const bookingRes = await api.post('/bookings', bookingPayload);
      const newBooking = bookingRes.data.data.booking;

      // 2. Process sandbox payment transaction
      const paymentRes = await api.post('/payments/process', {
        bookingId: newBooking._id,
        paymentMethod,
        cardLast4: '4242',
        cardBrand: 'Visa'
      });

      // 3. Trigger celebration confetti
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Confetti fallback
      }

      setConfirmedBooking({
        ...newBooking,
        status: 'confirmed',
        payment: paymentRes.data.data.payment
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Reservation failed. Please verify dates and try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Preparing secure reservation checkout..." />;
  }

  // Confirmation Success View
  if (confirmedBooking) {
    return (
      <div className="py-5 bg-light min-vh-100">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card hp-card p-4 p-md-5 border-0 shadow-lg text-center">
                <div className="bg-success bg-opacity-10 text-success p-3 rounded-circle d-inline-flex mx-auto mb-3">
                  <CheckCircle size={48} />
                </div>
                <span className="section-tag">Reservation Confirmed</span>
                <h2 className="display-6 fw-bold text-dark mb-2">We Look Forward to Welcoming You</h2>
                <p className="text-secondary mb-4">
                  Your reservation is secured under booking reference{' '}
                  <span className="badge bg-warning text-dark fs-5 fw-bold ms-1">
                    {confirmedBooking.bookingReference}
                  </span>
                </p>

                {/* Summary Box */}
                <div className="bg-light p-4 rounded-3 text-start mb-4 border">
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <div className="small text-muted">Accommodations</div>
                      <div className="fw-bold text-dark">{room?.title} (Room {room?.roomNumber})</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="small text-muted">Primary Guest</div>
                      <div className="fw-bold text-dark">{guestDetails.fullName}</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="small text-muted">Stay Dates</div>
                      <div className="fw-bold text-dark">
                        {new Date(checkInDate).toLocaleDateString()} — {new Date(checkOutDate).toLocaleDateString()}
                      </div>
                      <div className="small text-muted">{pricing?.totalNights} Night(s)</div>
                    </div>
                    <div className="col-sm-6">
                      <div className="small text-muted">Amount Paid (USD)</div>
                      <div className="fs-5 fw-bold text-success">${pricing?.totalAmount.toFixed(2)}</div>
                      <div className="small text-muted">Status: Captured (Sandbox Visa •••• 4242)</div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Link to="/my-bookings" className="btn btn-gold px-4">
                    View in My Bookings
                  </Link>
                  <a
                    href={`/api/v1/bookings/${confirmedBooking._id}/invoice?format=html`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline-secondary px-4"
                  >
                    Print Official Tax Invoice
                  </a>
                  <Link to="/" className="btn btn-light px-4">
                    Return to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page py-5 bg-light">
      <div className="container">
        <Link to={`/rooms/${roomId}`} className="btn btn-link text-secondary text-decoration-none p-0 mb-4 d-inline-flex align-items-center gap-1">
          <ArrowLeft size={16} /> Back to Suite Details
        </Link>

        <h2 className="brand-font fw-bold text-dark mb-4">Complete Your Reservation</h2>

        {error && (
          <div className="alert alert-danger d-flex align-items-center gap-2 mb-4">
            <AlertCircle size={20} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleConfirmReservation}>
          <div className="row g-4">
            {/* Left Column: Guest & Payment Info */}
            <div className="col-lg-7">
              {/* Guest Information Card */}
              <div className="card hp-card p-4 border-0 shadow-sm mb-4">
                <h5 className="fw-bold text-dark mb-3">1. Guest Information</h5>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-secondary">Full Legal Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={guestDetails.fullName}
                    onChange={(e) => setGuestDetails({ ...guestDetails, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">Contact Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={guestDetails.email}
                      onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-secondary">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={guestDetails.phone}
                      onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label small fw-bold text-secondary">Special Requests (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="2"
                    placeholder="e.g. Feather-free pillows, late arrival notification, high floor"
                    value={guestDetails.specialRequests}
                    onChange={(e) => setGuestDetails({ ...guestDetails, specialRequests: e.target.value })}
                  ></textarea>
                </div>
              </div>

              {/* Payment Details Card */}
              <div className="card hp-card p-4 border-0 shadow-sm mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">2. Payment Method</h5>
                  <span className="badge bg-success bg-opacity-10 text-success border border-success px-2 py-1 small">
                    <ShieldCheck size={14} className="me-1" /> 256-bit Sandbox Secured
                  </span>
                </div>

                {/* Payment Selection Tabs */}
                <div className="d-flex gap-2 mb-4">
                  <button
                    type="button"
                    className={`btn btn-sm ${paymentMethod === 'card' ? 'btn-navy' : 'btn-outline-secondary'}`}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard size={14} className="me-1" /> Credit / Debit Card (Sandbox)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${paymentMethod === 'sandbox' ? 'btn-navy' : 'btn-outline-secondary'}`}
                    onClick={() => setPaymentMethod('sandbox')}
                  >
                    ⚡ Instant Sandbox One-Click
                  </button>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="p-3 bg-light rounded-3 border">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Cardholder Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={cardDetails.cardName}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardName: e.target.value })}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Card Number</label>
                      <input
                        type="text"
                        className="form-control font-monospace"
                        value={cardDetails.cardNumber}
                        readOnly
                      />
                      <span className="text-muted small" style={{ fontSize: '11px' }}>
                        Preloaded sandbox Visa card (ends in 4242)
                      </span>
                    </div>
                    <div className="row g-2">
                      <div className="col-6">
                        <label className="form-label small fw-bold text-secondary">Expires</label>
                        <input type="text" className="form-control" value={cardDetails.cardExpiry} readOnly />
                      </div>
                      <div className="col-6">
                        <label className="form-label small fw-bold text-secondary">CVC / CVV</label>
                        <input type="text" className="form-control" value={cardDetails.cardCvc} readOnly />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-light rounded-3 border text-secondary small">
                    Instant sandbox simulation mode is activated. Click 'Confirm & Pay' below to simulate a successful payment order and instantly lock in your confirmed reservation.
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-gold btn-lg w-100 py-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                disabled={processing}
              >
                {processing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                    Securing Reservation & Payment...
                  </>
                ) : (
                  `Confirm & Pay $${pricing?.totalAmount.toFixed(2)}`
                )}
              </button>
            </div>

            {/* Right Column: Reservation Summary Card */}
            <div className="col-lg-5">
              <div className="card hp-card p-4 border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
                <h5 className="fw-bold text-dark mb-3">Reservation Summary</h5>

                <div className="d-flex gap-3 mb-3 pb-3 border-bottom">
                  <img
                    src={room?.photos[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=300&q=80'}
                    alt={room?.title}
                    className="rounded-3 object-fit-cover"
                    style={{ width: '80px', height: '80px' }}
                  />
                  <div>
                    <h6 className="fw-bold text-dark mb-1">{room?.title}</h6>
                    <span className="badge bg-light text-dark border text-capitalize small">
                      {room?.type} Suite • Room {room?.roomNumber}
                    </span>
                  </div>
                </div>

                <div className="mb-3 pb-3 border-bottom small">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary"><Calendar size={14} className="me-1" /> Check-in:</span>
                    <span className="fw-bold text-dark">{new Date(checkInDate).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary"><Calendar size={14} className="me-1" /> Check-out:</span>
                    <span className="fw-bold text-dark">{new Date(checkOutDate).toLocaleDateString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-secondary"><Users size={14} className="me-1" /> Guests:</span>
                    <span className="fw-bold text-dark">{guestsCount} Guest(s)</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-secondary">Duration:</span>
                    <span className="fw-bold text-dark">{pricing?.totalNights} Night(s)</span>
                  </div>
                </div>

                {/* Price Itemization */}
                {pricing && (
                  <div className="small mb-4">
                    <div className="d-flex justify-content-between text-secondary mb-2">
                      <span>Room Subtotal (${pricing.nightlyRate} × {pricing.totalNights}n)</span>
                      <span className="fw-bold text-dark">${pricing.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-secondary mb-2">
                      <span>Hospitality Tax ({pricing.taxRatePercentage}%)</span>
                      <span className="fw-bold text-dark">${pricing.taxes.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between text-secondary mb-2">
                      <span>Deep Sanitization & Cleaning Fee</span>
                      <span className="fw-bold text-dark">${pricing.cleaningFee.toFixed(2)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="d-flex justify-content-between fs-5 fw-bold text-dark pt-1">
                      <span>Total Amount:</span>
                      <span className="text-warning">${pricing.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-light rounded-3 small text-secondary">
                  <strong>Cancellation Policy:</strong> Free cancellation up to 24 hours prior to check-in. Seamless in-app cancellation and automatic refund processing.
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingCheckoutPage;
