const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const env = require('../config/env');
const logger = require('../utils/logger');
const crypto = require('crypto');

/**
 * Creates or processes a payment transaction
 */
const processPaymentTransaction = async ({
  bookingId,
  userId,
  amount,
  paymentMethod = 'card',
  cardLast4 = '4242',
  cardBrand = 'Visa',
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature
}) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }

  if (booking.status === 'confirmed' || booking.status === 'checked_in') {
    throw new Error('This booking has already been paid and confirmed.');
  }

  const transactionId = gatewayPaymentId || `TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  // Signature verification if using external gateway
  let isSignatureValid = true;
  if (env.PAYMENT_PROVIDER === 'razorpay' && env.RAZORPAY_KEY_SECRET && gatewaySignature) {
    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${gatewayOrderId}|${gatewayPaymentId}`)
      .digest('hex');
    isSignatureValid = generatedSignature === gatewaySignature;
    if (!isSignatureValid) {
      throw new Error('Payment signature verification failed. Untrusted payment payload.');
    }
  }

  // Create payment record
  const payment = await Payment.create({
    booking: booking._id,
    user: userId,
    amount: amount || booking.priceBreakdown.totalAmount,
    currency: 'USD',
    provider: env.PAYMENT_PROVIDER || 'sandbox',
    transactionId,
    orderId: gatewayOrderId || `ORD_${Date.now()}`,
    paymentMethod,
    cardLast4: cardLast4 ? cardLast4.slice(-4) : '4242',
    cardBrand: cardBrand || 'Visa',
    status: 'captured',
    signature: gatewaySignature || 'sandbox_verified_signature'
  });

  // Transition booking to confirmed
  booking.status = 'confirmed';
  booking.payment = payment._id;
  await booking.save();

  logger.info(`Payment captured for booking ${booking.bookingReference}: TXN ${transactionId}`);

  return { payment, booking };
};

/**
 * Process a refund for a cancelled booking
 */
const processRefund = async ({ booking, reason = 'Cancellation request' }) => {
  const payment = await Payment.findOne({ booking: booking._id, status: 'captured' });
  if (!payment) {
    throw new Error('No captured payment found for this booking to refund.');
  }

  const refundId = `REF_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  payment.status = 'refunded';
  payment.refundDetails = {
    refundId,
    amount: payment.amount,
    refundedAt: new Date(),
    reason
  };
  await payment.save();

  booking.cancellation.refundAmount = payment.amount;
  booking.cancellation.refundStatus = 'processed';
  booking.cancellation.processedAt = new Date();
  await booking.save();

  logger.info(`Refund processed for booking ${booking.bookingReference}: ${refundId} ($${payment.amount})`);

  return { payment, refundId };
};

module.exports = {
  processPaymentTransaction,
  processRefund
};
