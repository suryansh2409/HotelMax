const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

/**
 * Export all bookings to CSV format
 */
const exportBookingsCsv = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('room', 'roomNumber title type')
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    const headers = [
      'Booking Reference',
      'Guest Name',
      'Guest Email',
      'Guest Phone',
      'Room Number',
      'Room Type',
      'Check-in Date',
      'Check-out Date',
      'Total Nights',
      'Nightly Rate ($)',
      'Subtotal ($)',
      'Taxes ($)',
      'Cleaning Fee ($)',
      'Total Amount ($)',
      'Status',
      'Created At'
    ];

    const rows = bookings.map((b) => [
      b.bookingReference,
      `"${b.guestDetails.fullName || (b.user ? b.user.name : '')}"`,
      `"${b.guestDetails.email || (b.user ? b.user.email : '')}"`,
      `"${b.guestDetails.phone || (b.user ? b.user.phone : '')}"`,
      b.room ? b.room.roomNumber : 'N/A',
      b.room ? b.room.type : 'N/A',
      new Date(b.checkInDate).toISOString().split('T')[0],
      new Date(b.checkOutDate).toISOString().split('T')[0],
      b.totalNights,
      b.priceBreakdown.nightlyRate,
      b.priceBreakdown.subtotal,
      b.priceBreakdown.taxes,
      b.priceBreakdown.cleaningFee,
      b.priceBreakdown.totalAmount,
      b.status,
      new Date(b.createdAt).toISOString()
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hotelpro-bookings-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

/**
 * Export financial / revenue transactions to CSV format
 */
const exportRevenueCsv = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .populate('booking', 'bookingReference')
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const headers = [
      'Transaction ID',
      'Booking Reference',
      'Customer Name',
      'Customer Email',
      'Amount ($)',
      'Currency',
      'Provider',
      'Payment Method',
      'Card Last 4',
      'Status',
      'Transaction Date'
    ];

    const rows = payments.map((p) => [
      p.transactionId,
      p.booking ? p.booking.bookingReference : 'N/A',
      `"${p.user ? p.user.name : ''}"`,
      `"${p.user ? p.user.email : ''}"`,
      p.amount,
      p.currency,
      p.provider,
      p.paymentMethod,
      p.cardLast4 || 'N/A',
      p.status,
      new Date(p.createdAt).toISOString()
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=hotelpro-revenue-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  exportBookingsCsv,
  exportRevenueCsv
};
