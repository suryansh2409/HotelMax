const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Hotel name is required'],
      trim: true
    },
    tagline: {
      type: String,
      default: 'Luxury hospitality curated for unforgettable stays'
    },
    description: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true,
      index: true
    },
    state: {
      type: String,
      required: true
    },
    country: {
      type: String,
      default: 'United States'
    },
    zipCode: {
      type: String
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5
    },
    amenities: {
      type: [String],
      default: ['High-speed WiFi', 'Infinity Pool', 'Fine Dining', 'Fitness Center', 'Spa & Wellness', 'Valet Parking', '24/7 Concierge']
    },
    contactEmail: {
      type: String,
      default: 'reservations@hotelpro.com'
    },
    contactPhone: {
      type: String,
      default: '+1 (800) 555-0199'
    },
    policies: {
      checkInTime: { type: String, default: '14:00' },
      checkOutTime: { type: String, default: '11:00' },
      cancellationWindowHours: { type: Number, default: 24 }
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Hotel || mongoose.model('Hotel', hotelSchema);
