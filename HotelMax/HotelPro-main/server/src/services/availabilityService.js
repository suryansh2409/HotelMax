const Booking = require('../models/Booking');
const Room = require('../models/Room');

/**
 * Checks whether a specific room is available for given dates
 * Blocking statuses: pending_payment, confirmed, checked_in
 */
const isRoomAvailable = async (roomId, checkInDate, checkOutDate, excludeBookingId = null) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const query = {
    room: roomId,
    status: { $in: ['pending_payment', 'confirmed', 'checked_in'] },
    // Standard interval overlap condition: A.start < B.end AND A.end > B.start
    checkInDate: { $lt: checkOut },
    checkOutDate: { $gt: checkIn }
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBooking = await Booking.findOne(query);
  return !conflictingBooking;
};

/**
 * Find all rooms available for given criteria and dates
 */
const getAvailableRooms = async ({
  checkInDate,
  checkOutDate,
  guests = 1,
  type,
  minPrice,
  maxPrice,
  amenities,
  sortBy = 'basePrice',
  sortOrder = 'asc',
  page = 1,
  limit = 12
}) => {
  const roomFilter = { isActive: true };

  if (type && type !== 'all') {
    roomFilter.type = type;
  }

  if (guests) {
    roomFilter['capacity.maxGuests'] = { $gte: parseInt(guests, 10) };
  }

  if (minPrice || maxPrice) {
    roomFilter.basePrice = {};
    if (minPrice) roomFilter.basePrice.$gte = parseFloat(minPrice);
    if (maxPrice) roomFilter.basePrice.$lte = parseFloat(maxPrice);
  }

  if (amenities) {
    const amenitiesList = Array.isArray(amenities) ? amenities : amenities.split(',');
    if (amenitiesList.length > 0) {
      roomFilter.amenities = { $all: amenitiesList };
    }
  }

  // If checkInDate and checkOutDate are specified, find booked rooms to exclude
  if (checkInDate && checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    const bookedRooms = await Booking.find({
      status: { $in: ['pending_payment', 'confirmed', 'checked_in'] },
      checkInDate: { $lt: checkOut },
      checkOutDate: { $gt: checkIn }
    }).distinct('room');

    if (bookedRooms && bookedRooms.length > 0) {
      roomFilter._id = { $nin: bookedRooms };
    }
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const skip = (page - 1) * limit;

  const [rooms, total] = await Promise.all([
    Room.find(roomFilter)
      .populate('hotel', 'name city state country rating')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit, 10)),
    Room.countDocuments(roomFilter)
  ]);

  return {
    rooms,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  isRoomAvailable,
  getAvailableRooms
};
