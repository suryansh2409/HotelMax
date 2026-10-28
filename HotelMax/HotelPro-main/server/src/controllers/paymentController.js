const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { processPaymentTransaction, processRefund } = require('../services/paymentService');
const { sendNotification } = require('../services/notificationService');
const { sendBookingConfirmationEmail } = require('../services/emailService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { recordAuditLog } = require('../middleware/auditMiddleware');

/**
 * Process payment for a reservation
 */
const processPayment = async (req, res, next) => {
  try {
    const {
      bookingId,
      paymentMethod = 'card',
      cardLast4 = '4242',
      cardBrand = 'Visa',
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature
    } = req.body;

    const booking = await Booking.findById(bookingId).populate('room').populate('hotel');
    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    // Role/Ownership verification
    if (booking.user.toString() !== req.user.id && req.user.role === 'customer') {
      return errorResponse(res, 403, 'Unauthorized to pay for this booking.');
    }

    const { payment, booking: updatedBooking } = await processPaymentTransaction({
      bookingId,
      userId: req.user._id,
      amount: booking.priceBreakdown.totalAmount,
      paymentMethod,
      cardLast4,
      cardBrand,
      gatewayOrderId,
      gatewayPaymentId,
      gatewaySignature
    });

    // Notify guest
    await sendNotification({
      recipient: booking.user,
      roleTarget: 'customer',
      title: 'Payment Successful',
      message: `Your payment of $${payment.amount.toLocaleString()} for booking ${booking.bookingReference} was successful!`,
      type: 'payment',
      link: `/bookings/${booking.bookingReference}`
    });

    // Send confirmation email
    await sendBookingConfirmationEmail(booking, req.user, booking.room);

    recordAuditLog({
      user: req.user,
      action: 'PAYMENT_PROCESSED',
      entity: 'Payment',
      entityId: payment._id,
      details: { bookingReference: booking.bookingReference, amount: payment.amount, transactionId: payment.transactionId },
      req
    });

    return successResponse(res, 200, 'Payment processed and booking confirmed', {
      payment: {
        id: payment._id,
        transactionId: payment.transactionId,
        amount: payment.amount,
        status: payment.status,
        cardLast4: payment.cardLast4,
        paymentMethod: payment.paymentMethod
      },
      booking: {
        bookingReference: updatedBooking.bookingReference,
        status: updatedBooking.status
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Refund a booking
 */
const processAdminRefund = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    const { payment, refundId } = await processRefund({ booking, reason });

    recordAuditLog({
      user: req.user,
      action: 'REFUND_ISSUED',
      entity: 'Payment',
      entityId: payment._id,
      details: { bookingId, refundId, amount: payment.amount, reason },
      req
    });

    return successResponse(res, 200, 'Refund processed successfully', {
      refundId,
      amount: payment.amount,
      status: payment.status
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  processPayment,
  processAdminRefund
};
