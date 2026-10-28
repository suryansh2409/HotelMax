import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, FileText, Ban, Star, CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState({ show: false, booking: null });
  const [cancelReason, setCancelReason] = useState('Change of travel schedule');
  const [cancelling, setCancelling] = useState(false);

  // Review modal state
  const [reviewModal, setReviewModal] = useState({ show: false, booking: null });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('Exceptional Hospitality');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchBookings();
  }, [filterStatus]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/bookings/my-bookings', {
        params: { status: filterStatus !== 'all' ? filterStatus : undefined }
      });
      if (res.data && res.data.data) {
        setBookings(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModal.booking) return;
    setCancelling(true);

    try {
      await api.post(`/bookings/${cancelModal.booking._id}/cancel`, {
        reason: cancelReason
      });
      setCancelModal({ show: false, booking: null });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel reservation');
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenReview = (booking) => {
    setReviewModal({ show: true, booking });
    setReviewRating(5);
    setReviewTitle('Exceptional Hospitality');
    setReviewComment('');
    setReviewSuccess('');
    setReviewError('');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModal.booking) return;
    setSubmittingReview(true);
    setReviewError('');

    try {
      await api.post('/reviews', {
        bookingId: reviewModal.booking._id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      setReviewSuccess('Thank you! Your verified review has been submitted.');
      setTimeout(() => {
        setReviewModal({ show: false, booking: null });
      }, 1500);
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    const config = {
      confirmed: { label: 'Confirmed', className: 'badge-status-confirmed' },
      checked_in: { label: 'Checked In', className: 'badge-status-checked-in' },
      completed: { label: 'Completed Stay', className: 'badge-status-completed' },
      cancelled: { label: 'Cancelled', className: 'badge-status-cancelled' },
      pending_payment: { label: 'Payment Pending', className: 'badge-status-pending' }
    };
    const s = config[status] || { label: status, className: 'badge-status-pending' };
    return <span className={`badge ${s.className} px-3 py-2 text-capitalize`}>{s.label}</span>;
  };

  return (
    <div className="my-bookings-page py-5 bg-light min-vh-100">
      <div className="container">
        {/* Header */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div>
            <Link to="/dashboard" className="btn btn-link text-secondary text-decoration-none p-0 mb-2 d-inline-flex align-items-center gap-1">
              <ArrowLeft size={16} /> Back to Dashboard
            </Link>
            <h1 className="brand-font fw-bold text-dark mb-0">My Reservations</h1>
          </div>
          <Link to="/rooms" className="btn btn-gold btn-sm px-4 mt-3 mt-md-0">
            Book Another Suite
          </Link>
        </div>

        {/* Status Filter Tabs */}
        <div className="d-flex flex-wrap gap-2 mb-4">
          {[
            { key: 'all', label: 'All Reservations' },
            { key: 'confirmed', label: 'Confirmed Stays' },
            { key: 'completed', label: 'Completed' },
            { key: 'cancelled', label: 'Cancelled' }
          ].map((tab) => (
            <button
              key={tab.key}
              className={`btn btn-sm ${filterStatus === tab.key ? 'btn-navy fw-bold' : 'btn-outline-secondary'}`}
              onClick={() => setFilterStatus(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {loading ? (
          <LoadingSpinner text="Retrieving reservations history..." />
        ) : bookings.length === 0 ? (
          <EmptyState
            title="No Bookings Found"
            description="You have no reservations matching this category. Ready to plan your next retreat?"
            actionLabel="Explore Suites & Rooms"
            actionLink="/rooms"
          />
        ) : (
          <div className="d-flex flex-column gap-4">
            {bookings.map((booking) => (
              <div key={booking._id} className="card hp-card p-4 border-0 shadow-sm">
                <div className="row g-4 align-items-center">
                  {/* Photo & Basic Details */}
                  <div className="col-md-3">
                    <img
                      src={booking.room?.photos?.[0] || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80'}
                      alt={booking.room?.title}
                      className="rounded-3 w-100 object-fit-cover"
                      style={{ height: '160px' }}
                    />
                  </div>

                  {/* Middle: Details */}
                  <div className="col-md-5">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <span className="fw-bold font-monospace text-dark fs-6">
                        {booking.bookingReference}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>

                    <h4 className="fw-bold text-dark mb-1">{booking.room?.title || 'Suite Room'}</h4>
                    <p className="text-secondary small mb-3">
                      Room No. {booking.room?.roomNumber} • {booking.room?.type?.toUpperCase()}
                    </p>

                    <div className="small text-secondary d-flex flex-column gap-1">
                      <div>
                        <Calendar size={14} className="me-1 text-warning" />
                        <strong>Stay Dates:</strong> {new Date(booking.checkInDate).toLocaleDateString()} — {new Date(booking.checkOutDate).toLocaleDateString()} ({booking.totalNights} Nights)
                      </div>
                      <div>
                        <Users size={14} className="me-1 text-warning" />
                        <strong>Guest:</strong> {booking.guestDetails?.fullName} ({booking.guestDetails?.phone})
                      </div>
                    </div>
                  </div>

                  {/* Right: Pricing & Actions */}
                  <div className="col-md-4 text-md-end border-start-md ps-md-4">
                    <div className="mb-3">
                      <div className="small text-muted">Total Snapshot Price</div>
                      <div className="fs-4 fw-bold text-dark">
                        ${booking.priceBreakdown?.totalAmount?.toFixed(2)}
                      </div>
                      <div className="small text-muted" style={{ fontSize: '12px' }}>
                        Includes 12% tax & cleaning
                      </div>
                    </div>

                    <div className="d-flex flex-wrap justify-content-md-end gap-2">
                      {/* Printable Tax Invoice */}
                      <a
                        href={`/api/v1/bookings/${booking._id}/invoice?format=html`}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                      >
                        <FileText size={14} /> Tax Invoice
                      </a>

                      {/* Write Review for completed or confirmed stays */}
                      {(booking.status === 'completed' || booking.status === 'confirmed') && (
                        <button
                          className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1"
                          onClick={() => handleOpenReview(booking)}
                        >
                          <Star size={14} /> Review
                        </button>
                      )}

                      {/* Cancel Booking (if eligible) */}
                      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                        <button
                          className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                          onClick={() => setCancelModal({ show: true, booking })}
                        >
                          <Ban size={14} /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Confirmation Modal */}
        <ConfirmModal
          show={cancelModal.show}
          title={`Cancel Reservation ${cancelModal.booking?.bookingReference}`}
          message={`Are you sure you wish to cancel this booking for ${cancelModal.booking?.room?.title}? If cancelled outside the 24h arrival window, your payment of $${cancelModal.booking?.priceBreakdown?.totalAmount?.toFixed(2)} will be refunded.`}
          confirmText="Yes, Cancel Reservation"
          confirmVariant="danger"
          loading={cancelling}
          onConfirm={handleCancelBooking}
          onCancel={() => setCancelModal({ show: false, booking: null })}
        />

        {/* Write Review Modal */}
        {reviewModal.show && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                <div className="modal-header">
                  <h5 className="modal-title fw-bold text-dark">
                    Review Your Stay — {reviewModal.booking?.room?.title}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setReviewModal({ show: false, booking: null })}></button>
                </div>
                <form onSubmit={handleSubmitReview}>
                  <div className="modal-body py-3">
                    {reviewSuccess && (
                      <div className="alert alert-success d-flex align-items-center gap-2 small">
                        <CheckCircle size={16} /> {reviewSuccess}
                      </div>
                    )}
                    {reviewError && (
                      <div className="alert alert-danger d-flex align-items-center gap-2 small">
                        <AlertCircle size={16} /> {reviewError}
                      </div>
                    )}

                    <div className="mb-3 text-center">
                      <label className="form-label small fw-bold text-secondary mb-2 d-block">Overall Rating</label>
                      <div className="d-flex justify-content-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={28}
                            className="cursor-pointer"
                            fill={star <= reviewRating ? '#d4af37' : 'none'}
                            color="#d4af37"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setReviewRating(star)}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Review Headline</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. Unforgettable Oceanfront Retreat"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Your Feedback & Experience</label>
                      <textarea
                        className="form-control"
                        rows="4"
                        placeholder="Share your experience regarding the suite, amenities, and staff hospitality..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <button type="button" className="btn btn-light" onClick={() => setReviewModal({ show: false, booking: null })}>
                      Close
                    </button>
                    <button type="submit" className="btn btn-gold" disabled={submittingReview}>
                      {submittingReview ? 'Submitting...' : 'Post Review'}
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

export default MyBookingsPage;
