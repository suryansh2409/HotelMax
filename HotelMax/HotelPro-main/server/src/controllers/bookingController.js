const crypto = require('crypto');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Payment = require('../models/Payment');
const { isRoomAvailable } = require('../services/availabilityService');
const { calculateStayPricing } = require('../services/pricingService');
const { sendNotification } = require('../services/notificationService');
const { sendBookingConfirmationEmail } = require('../services/emailService');
const { generateInvoiceHtml } = require('../utils/invoiceGenerator');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { recordAuditLog } = require('../middleware/auditMiddleware');

/**
 * Generate human-readable unique booking reference (e.g. HP-8K92F)
 */
const generateBookingReference = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'HP-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

/**
 * Create a new booking
 */
const createBooking = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests, guestDetails, paymentMethod } = req.body;

    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return errorResponse(res, 400, 'Check-in date cannot be in the past.');
    }

    if (checkOut <= checkIn) {
      return errorResponse(res, 400, 'Check-out date must be after check-in date.');
    }

    // Find room
    const room = await Room.findById(roomId).populate('hotel');
    if (!room || !room.isActive) {
      return errorResponse(res, 404, 'Selected room does not exist or is inactive.');
    }

    // Verify guest capacity
    const totalGuests = (guests.adults || 1) + (guests.children || 0);
    if (totalGuests > room.capacity.maxGuests) {
      return errorResponse(
        res,
        400,
        `Guest count (${totalGuests}) exceeds maximum capacity for this room (${room.capacity.maxGuests}).`
      );
    }

    // Anti-double-booking: Atomic/Pre-check availability
    const available = await isRoomAvailable(roomId, checkIn, checkOut);
    if (!available) {
      return errorResponse(
        res,
        409,
        'This room is already reserved for the selected dates. Please select alternative dates or rooms.'
      );
    }

    // Calculate exact pricing snapshot
    const pricing = await calculateStayPricing(room, checkIn, checkOut, totalGuests);

    // Generate unique reference
    let bookingReference;
    let isUnique = false;
    while (!isUnique) {
      bookingReference = generateBookingReference();
      const existing = await Booking.findOne({ bookingReference });
      if (!existing) isUnique = true;
    }

    // Save booking with pending_payment status
    const booking = await Booking.create({
      bookingReference,
      user: req.user._id,
      room: room._id,
      hotel: room.hotel ? room.hotel._id : null,
      checkInDate: checkIn,
      checkOutDate: checkOut,
      totalNights: pricing.totalNights,
      guests: {
        adults: guests.adults || 1,
        children: guests.children || 0,
        totalGuests
      },
      guestDetails: {
        fullName: guestDetails.fullName || req.user.name,
        email: guestDetails.email || req.user.email,
        phone: guestDetails.phone || req.user.phone,
        specialRequests: guestDetails.specialRequests || ''
      },
      priceBreakdown: {
        nightlyRate: pricing.nightlyRate,
        subtotal: pricing.subtotal,
        taxes: pricing.taxes,
        cleaningFee: pricing.cleaningFee,
        discount: pricing.discount,
        totalAmount: pricing.totalAmount
      },
      status: 'pending_payment'
    });

    // Notify guest
    await sendNotification({
      recipient: req.user._id,
      roleTarget: 'customer',
      title: 'Booking Created',
      message: `Your reservation ${booking.bookingReference} for ${room.title} is reserved. Complete payment to confirm.`,
      type: 'booking',
      link: `/bookings/${booking.bookingReference}`
    });

    // Notify staff
    await sendNotification({
      recipient: null,
      roleTarget: 'staff',
      title: 'New Reservation Placed',
      message: `New booking ${booking.bookingReference} for Room ${room.roomNumber} (${room.title}).`,
      type: 'booking'
    });

    recordAuditLog({
      user: req.user,
      action: 'BOOKING_CREATED',
      entity: 'Booking',
      entityId: booking._id,
      details: { bookingReference, totalAmount: pricing.totalAmount },
      req
    });

    return successResponse(res, 201, 'Booking created successfully', {
      booking,
      room: {
        id: room._id,
        title: room.title,
        roomNumber: room.roomNumber,
        type: room.type,
        photos: room.photos
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get current customer's bookings
 */
const getMyBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = { user: req.user._id };

    if (status && status !== 'all') {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('room', 'roomNumber title type photos basePrice physicalStatus')
      .populate('hotel', 'name city state contactEmail contactPhone')
      .populate('payment')
      .sort({ createdAt: -1 });

    return successResponse(res, 200, 'User bookings retrieved', bookings);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single booking by booking reference or ID
 */
const getBookingByReference = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const query = reference.startsWith('HP-')
      ? { bookingReference: reference }
      : { _id: reference };

    const booking = await Booking.findOne(query)
      .populate('room')
      .populate('hotel')
      .populate('user', 'name email phone')
      .populate('payment');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    // Ensure only the booking owner, staff, or admin can access it
    const isOwner = booking.user._id.toString() === req.user.id;
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

    if (!isOwner && !isStaffOrAdmin) {
      return errorResponse(res, 403, 'You do not have permission to view this reservation.');
    }

    return successResponse(res, 200, 'Booking details retrieved', booking);
  } catch (err) {
    next(err);
  }
};

/**
 * Cancel booking according to policy
 */
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await Booking.findById(id).populate('room').populate('hotel');
    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    // Role check
    const isOwner = booking.user.toString() === req.user.id;
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

    if (!isOwner && !isStaffOrAdmin) {
      return errorResponse(res, 403, 'Unauthorized to cancel this booking.');
    }

    if (booking.status === 'cancelled') {
      return errorResponse(res, 400, 'Booking is already cancelled.');
    }

    if (booking.status === 'completed' || booking.status === 'checked_in') {
      return errorResponse(res, 400, `Cannot cancel a reservation that is currently ${booking.status}.`);
    }

    // Check cancellation window policy
    const cancellationWindowHours = booking.hotel?.policies?.cancellationWindowHours || 24;
    const checkInTime = new Date(booking.checkInDate).getTime();
    const nowTime = new Date().getTime();
    const hoursBeforeCheckIn = (checkInTime - nowTime) / (1000 * 60 * 60);

    const isEligibleForRefund = hoursBeforeCheckIn >= cancellationWindowHours;

    booking.status = 'cancelled';
    booking.cancellation = {
      reason: reason || 'Customer requested cancellation',
      requestedAt: new Date(),
      processedAt: new Date(),
      refundAmount: isEligibleForRefund && booking.payment ? booking.priceBreakdown.totalAmount : 0,
      refundStatus: isEligibleForRefund && booking.payment ? 'processed' : 'none'
    };

    await booking.save();

    // If payment was made and eligible, update payment record
    if (booking.payment && isEligibleForRefund) {
      await Payment.findByIdAndUpdate(booking.payment, {
        status: 'refunded',
        refundDetails: {
          refundId: `REF_${Date.now()}`,
          amount: booking.priceBreakdown.totalAmount,
          refundedAt: new Date(),
          reason
        }
      });
    }

    // Notify guest
    await sendNotification({
      recipient: booking.user,
      roleTarget: 'customer',
      title: 'Booking Cancelled',
      message: `Your booking ${booking.bookingReference} has been cancelled. ${isEligibleForRefund ? 'Refund has been processed.' : ''}`,
      type: 'cancellation',
      link: `/bookings/${booking.bookingReference}`
    });

    recordAuditLog({
      user: req.user,
      action: 'BOOKING_CANCELLED',
      entity: 'Booking',
      entityId: booking._id,
      details: { bookingReference: booking.bookingReference, reason, isEligibleForRefund },
      req
    });

    return successResponse(res, 200, 'Booking cancelled successfully', {
      bookingReference: booking.bookingReference,
      status: booking.status,
      cancellation: booking.cancellation
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get printable / download invoice
 */
const getInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id)
      .populate('room')
      .populate('hotel')
      .populate('payment');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isStaffOrAdmin = req.user.role === 'staff' || req.user.role === 'admin';

    if (!isOwner && !isStaffOrAdmin) {
      return errorResponse(res, 403, 'Unauthorized to view this invoice.');
    }

    const hotel = booking.hotel || {
      name: 'HotelPro Grand Resort',
      address: '100 Oceanfront Blvd',
      city: 'Miami Beach',
      state: 'FL',
      contactEmail: 'support@hotelpro.com',
      contactPhone: '+1 (800) 555-0199'
    };

    if (req.query.format === 'html') {
      const html = generateInvoiceHtml(booking, hotel, booking.payment);
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }

    return successResponse(res, 200, 'Invoice data retrieved', {
      invoiceNumber: `INV-${booking.bookingReference}`,
      booking,
      hotel,
      payment: booking.payment
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingByReference,
  cancelBooking,
  getInvoice
};
