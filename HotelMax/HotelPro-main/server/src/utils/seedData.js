const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/env');
const logger = require('./logger');

const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const Housekeeping = require('../models/Housekeeping');
const ServiceRequest = require('../models/ServiceRequest');
const HotelSetting = require('../models/HotelSetting');
const { connectDB } = require('../config/db');

const seedDatabase = async () => {
  try {
    logger.info('--- Commencing HotelPro Database Seeding ---');

    // 1. Hotel Settings
    await HotelSetting.deleteMany();
    await HotelSetting.create({
      hotelName: 'HotelPro Grand Resort & Residences',
      tagline: 'Uncompromising Luxury, Timeless Hospitality',
      taxPercentage: 12,
      cleaningFee: 35,
      cancellationWindowHours: 24,
      supportEmail: 'concierge@hotelpro.com',
      supportPhone: '+1 (800) 555-4683',
      currency: 'USD',
      currencySymbol: '$'
    });

    // 2. Hotel Property
    await Hotel.deleteMany();
    const hotel = await Hotel.create({
      name: 'HotelPro Grand Resort & Residences',
      tagline: 'Uncompromising Luxury, Timeless Hospitality',
      description: 'Nestled along pristine ocean shores, HotelPro offers bespoke architectural elegance, Michelin-starred culinary journeys, and world-class hospitality.',
      address: '100 Oceanfront Boulevard',
      city: 'Miami Beach',
      state: 'Florida',
      country: 'United States',
      zipCode: '33139',
      rating: 4.9,
      amenities: [
        'High-Speed Fiber WiFi',
        'Oceanfront Infinity Pool',
        'Michelin-Starred Dining',
        'Full-Service Spa & Thermal Baths',
        '24/7 Technogym Fitness Center',
        'Valet Parking & Chauffeur',
        'Bespoke Butler Service',
        'Private Beach Club Cabanas'
      ],
      contactEmail: 'reservations@hotelpro.com',
      contactPhone: '+1 (800) 555-4683',
      policies: {
        checkInTime: '15:00',
        checkOutTime: '11:00',
        cancellationWindowHours: 24
      },
      images: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1400&q=80',
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1400&q=80'
      ]
    });

    // 3. Users (Admin, Staff, Customer)
    await User.deleteMany();

    const admin = await User.create({
      name: env.ADMIN_NAME,
      email: env.ADMIN_EMAIL,
      phone: env.ADMIN_PHONE,
      password: env.ADMIN_PASSWORD,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=250&q=80'
    });

    const staff = await User.create({
      name: 'Elena Rostova',
      email: 'staff@hotelpro.com',
      phone: '+1 (555) 392-1049',
      password: 'Staff@HotelPro2026',
      role: 'staff',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80'
    });

    const guest = await User.create({
      name: 'Alexander Wright',
      email: 'guest@hotelpro.com',
      phone: '+1 (555) 749-2041',
      password: 'Guest@HotelPro2026',
      role: 'customer',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
    });

    // 4. Rooms
    await Room.deleteMany();
    const roomsData = [
      {
        hotel: hotel._id,
        roomNumber: '101',
        title: 'Classic Courtyard Single',
        type: 'single',
        description: 'Thoughtfully appointed room designed for solo executives and leisure travelers, featuring a plush queen bed, ergonomic workspace, and serene garden courtyard views.',
        basePrice: 160,
        seasonalPriceMultiplier: 1.0,
        capacity: { adults: 1, children: 0, maxGuests: 1 },
        bedType: '1 Queen Bed',
        sizeSqFt: 320,
        amenities: ['High-speed WiFi', 'Ergonomic Desk', 'Smart 4K TV', 'Nespresso Coffee Machine', 'Walk-in Rain Shower', 'Bathrobe & Slippers'],
        photos: [
          'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
        ],
        physicalStatus: 'available',
        featured: false
      },
      {
        hotel: hotel._id,
        roomNumber: '202',
        title: 'Superior Double Haven',
        type: 'double',
        description: 'Spacious retreat featuring two custom-tailored double beds, warm coastal timber accents, an Italian marble bathroom, and floor-to-ceiling soundproof windows.',
        basePrice: 240,
        seasonalPriceMultiplier: 1.0,
        capacity: { adults: 2, children: 1, maxGuests: 3 },
        bedType: '2 Double Beds',
        sizeSqFt: 460,
        amenities: ['High-speed WiFi', 'Air Conditioning', 'Smart 4K TV', 'Italian Marble Bath', 'Minibar', 'In-room Safe', 'Room Service'],
        photos: [
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80'
        ],
        physicalStatus: 'available',
        featured: true
      },
      {
        hotel: hotel._id,
        roomNumber: '305',
        title: 'Deluxe Ocean View King',
        type: 'deluxe',
        description: 'Perched on high floors with panoramic views of the Atlantic horizon. Unwind on a private terrace with lounge seating and savor sunset cocktails in style.',
        basePrice: 380,
        seasonalPriceMultiplier: 1.0,
        capacity: { adults: 2, children: 1, maxGuests: 3 },
        bedType: '1 King Size Bed',
        sizeSqFt: 580,
        amenities: ['Oceanfront Balcony', 'Soaking Bathtub', 'High-speed WiFi', 'Smart 4K TV', 'Curated Artisan Minibar', 'Pillow Menu', 'Turndown Service'],
        photos: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
        ],
        physicalStatus: 'available',
        featured: true
      },
      {
        hotel: hotel._id,
        roomNumber: '401',
        title: 'Executive Grand Suite',
        type: 'suite',
        description: 'Sumptuous corner suite encompassing a private master bedroom, elegant dining and living parlor, wet bar, and wraparound terrace overlooking the marina.',
        basePrice: 620,
        seasonalPriceMultiplier: 1.0,
        capacity: { adults: 3, children: 2, maxGuests: 4 },
        bedType: '1 California King Bed',
        sizeSqFt: 880,
        amenities: ['Separate Living & Dining Room', 'Wraparound Ocean Terrace', 'Spa Soaking Tub', 'Bose Sound System', 'Private Bar', 'Dedicated Concierge', 'Complimentary Breakfast'],
        photos: [
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
        ],
        physicalStatus: 'available',
        featured: true
      },
      {
        hotel: hotel._id,
        roomNumber: 'PH-1',
        title: 'The Royal Presidential Penthouse',
        type: 'presidential',
        description: 'The pinnacle of hospitality. Private elevator access leads to 2,400 sq.ft. of ultra-luxury with private infinity plunge pool, personal chef kitchen, and 24/7 dedicated butler.',
        basePrice: 1450,
        seasonalPriceMultiplier: 1.0,
        capacity: { adults: 4, children: 2, maxGuests: 6 },
        bedType: '2 Master King Suites',
        sizeSqFt: 2400,
        amenities: ['Private Infinity Plunge Pool', 'Personal Butler 24/7', 'Private Elevator Key', 'Full Gourmet Kitchen', 'Steam Sauna', 'Complimentary Airport Chauffeur', 'Dom Pérignon Welcome'],
        photos: [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80'
        ],
        physicalStatus: 'available',
        featured: true
      },
      {
        hotel: hotel._id,
        roomNumber: '208',
        title: 'Deluxe Garden Sanctuary',
        type: 'deluxe',
        description: 'Quiet sanctuary facing landscaped Japanese Zen gardens and reflecting pools. Includes outdoor stone soaking tub and organic botanical amenities.',
        basePrice: 320,
        seasonalPriceMultiplier: 1.0,
        capacity: { adults: 2, children: 1, maxGuests: 2 },
        bedType: '1 King Bed',
        sizeSqFt: 520,
        amenities: ['Private Garden Patio', 'Stone Soaking Tub', 'High-speed WiFi', 'Smart TV', 'Tea Sommelier Kit', 'Organic Toiletries'],
        photos: [
          'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=80'
        ],
        physicalStatus: 'available',
        featured: false
      }
    ];

    const createdRooms = await Room.insertMany(roomsData);

    // 5. Sample Bookings & Payments
    await Booking.deleteMany();
    await Payment.deleteMany();

    const pastCheckIn = new Date();
    pastCheckIn.setDate(pastCheckIn.getDate() - 10);
    const pastCheckOut = new Date();
    pastCheckOut.setDate(pastCheckOut.getDate() - 6);

    const completedBooking = await Booking.create({
      bookingReference: 'HP-9A4B72',
      user: guest._id,
      room: createdRooms[2]._id, // Deluxe Ocean View
      hotel: hotel._id,
      checkInDate: pastCheckIn,
      checkOutDate: pastCheckOut,
      totalNights: 4,
      guests: { adults: 2, children: 0, totalGuests: 2 },
      guestDetails: {
        fullName: guest.name,
        email: guest.email,
        phone: guest.phone,
        specialRequests: 'High floor preferred, celebration anniversary'
      },
      priceBreakdown: {
        nightlyRate: 380,
        subtotal: 1520,
        taxes: 182,
        cleaningFee: 35,
        discount: 0,
        totalAmount: 1737
      },
      status: 'completed',
      checkedInAt: pastCheckIn,
      checkedOutAt: pastCheckOut
    });

    const paymentCompleted = await Payment.create({
      booking: completedBooking._id,
      user: guest._id,
      amount: 1737,
      currency: 'USD',
      provider: 'sandbox',
      transactionId: 'TXN_SANDBOX_829104',
      paymentMethod: 'card',
      cardLast4: '4242',
      cardBrand: 'Visa',
      status: 'captured'
    });

    completedBooking.payment = paymentCompleted._id;
    await completedBooking.save();

    // 6. Sample Review
    await Review.deleteMany();
    await Review.create({
      booking: completedBooking._id,
      room: createdRooms[2]._id,
      hotel: hotel._id,
      user: guest._id,
      rating: 5,
      title: 'Breathtaking Atlantic Sunset & Impeccable Hospitality',
      comment: 'From the warm check-in to the private oceanfront terrace, our stay at HotelPro was extraordinary. The room service and housekeeping were prompt and refined.',
      isApproved: true
    });

    // 7. Housekeeping and Service Requests
    await Housekeeping.deleteMany();
    await Housekeeping.create([
      {
        room: createdRooms[0]._id,
        assignedTo: staff._id,
        taskType: 'cleaning',
        priority: 'medium',
        status: 'completed',
        notes: 'Sanitization protocol completed.'
      },
      {
        room: createdRooms[1]._id,
        assignedTo: staff._id,
        taskType: 'inspection',
        priority: 'low',
        status: 'pending',
        notes: 'Inspect mini-bar cooling.'
      }
    ]);

    await ServiceRequest.deleteMany();
    await ServiceRequest.create({
      booking: completedBooking._id,
      room: createdRooms[2]._id,
      guest: guest._id,
      requestType: 'extra_towels',
      description: 'Two extra plush pool towels requested for sunset cabana.',
      status: 'resolved',
      resolvedBy: staff._id,
      resolvedAt: pastCheckIn
    });

    logger.info('Database seeded successfully with initial users, rooms, and sample reservations.');
    return {
      adminEmail: env.ADMIN_EMAIL,
      adminPassword: env.ADMIN_PASSWORD,
      staffEmail: 'staff@hotelpro.com',
      guestEmail: 'guest@hotelpro.com'
    };
  } catch (err) {
    logger.error('Failed to seed database', err);
    throw err;
  }
};

// If run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { seedDatabase };
