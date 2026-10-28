const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Review = require('../models/Review');
const { getAvailableRooms, isRoomAvailable } = require('../services/availabilityService');
const { calculateStayPricing } = require('../services/pricingService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { recordAuditLog } = require('../middleware/auditMiddleware');

/**
 * Get available rooms with comprehensive filters and search
 */
const getRooms = async (req, res, next) => {
  try {
    const {
      checkInDate,
      checkOutDate,
      guests,
      type,
      minPrice,
      maxPrice,
      amenities,
      sortBy,
      sortOrder,
      page,
      limit
    } = req.query;

    const result = await getAvailableRooms({
      checkInDate,
      checkOutDate,
      guests,
      type,
      minPrice,
      maxPrice,
      amenities,
      sortBy,
      sortOrder,
      page,
      limit
    });

    return successResponse(res, 200, 'Rooms retrieved successfully', result.rooms, result.pagination);
  } catch (err) {
    next(err);
  }
};

/**
 * Get featured rooms for landing page
 */
const getFeaturedRooms = async (req, res, next) => {
  try {
    const rooms = await Room.find({ isActive: true, featured: true })
      .populate('hotel', 'name city rating')
      .limit(6);

    return successResponse(res, 200, 'Featured rooms retrieved', rooms);
  } catch (err) {
    next(err);
  }
};

/**
 * Get single room by ID with reviews and hotel details
 */
const getRoomById = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id).populate('hotel');
    if (!room) {
      return errorResponse(res, 404, 'Room not found');
    }

    const reviews = await Review.find({ room: room._id, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    const averageRating = reviews.length > 0
      ? (reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length).toFixed(1)
      : '5.0';

    return successResponse(res, 200, 'Room details retrieved', {
      room,
      reviews,
      reviewStats: {
        totalReviews: reviews.length,
        averageRating: parseFloat(averageRating)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Calculate pricing for specific dates and guest count
 */
const calculatePrice = async (req, res, next) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests } = req.body;

    if (!roomId || !checkInDate || !checkOutDate) {
      return errorResponse(res, 400, 'roomId, checkInDate, and checkOutDate are required.');
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return errorResponse(res, 404, 'Room not found');
    }

    const available = await isRoomAvailable(roomId, checkInDate, checkOutDate);
    const pricing = await calculateStayPricing(room, checkInDate, checkOutDate, guests || 1);

    return successResponse(res, 200, 'Price calculated', {
      isAvailable: available,
      pricing
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Create a new room
 */
const createRoom = async (req, res, next) => {
  try {
    // Attach default hotel if not provided
    let hotelId = req.body.hotel;
    if (!hotelId) {
      let defaultHotel = await Hotel.findOne();
      if (!defaultHotel) {
        defaultHotel = await Hotel.create({
          name: 'HotelPro Grand Resort & Residences',
          description: 'Flagship five-star hospitality retreat featuring bespoke suites.',
          address: '100 Oceanfront Boulevard',
          city: 'Miami Beach',
          state: 'Florida',
          country: 'United States'
        });
      }
      hotelId = defaultHotel._id;
    }

    const roomData = { ...req.body, hotel: hotelId };
    const room = await Room.create(roomData);

    recordAuditLog({
      user: req.user,
      action: 'ROOM_CREATED',
      entity: 'Room',
      entityId: room._id,
      details: { roomNumber: room.roomNumber, type: room.type, basePrice: room.basePrice },
      req
    });

    return successResponse(res, 201, 'Room created successfully', room);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Update room details
 */
const updateRoom = async (req, res, next) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!room) {
      return errorResponse(res, 404, 'Room not found');
    }

    recordAuditLog({
      user: req.user,
      action: 'ROOM_UPDATED',
      entity: 'Room',
      entityId: room._id,
      details: req.body,
      req
    });

    return successResponse(res, 200, 'Room updated successfully', room);
  } catch (err) {
    next(err);
  }
};

/**
 * Admin: Delete or archive room
 */
const deleteRoom = async (req, res, next) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return errorResponse(res, 404, 'Room not found');
    }

    // Soft delete/archive to preserve historical booking references
    room.isActive = false;
    await room.save();

    recordAuditLog({
      user: req.user,
      action: 'ROOM_ARCHIVED',
      entity: 'Room',
      entityId: room._id,
      details: { roomNumber: room.roomNumber },
      req
    });

    return successResponse(res, 200, 'Room archived successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRooms,
  getFeaturedRooms,
  getRoomById,
  calculatePrice,
  createRoom,
  updateRoom,
  deleteRoom
};
