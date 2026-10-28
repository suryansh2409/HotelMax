const mongoose = require('mongoose');

const hotelSettingSchema = new mongoose.Schema(
  {
    hotelName: {
      type: String,
      default: 'HotelPro Grand Resort & Residences'
    },
    tagline: {
      type: String,
      default: 'Uncompromising Luxury, Timeless Hospitality'
    },
    taxPercentage: {
      type: Number,
      default: 12, // 12% tax
      min: 0,
      max: 50
    },
    cleaningFee: {
      type: Number,
      default: 35,
      min: 0
    },
    cancellationWindowHours: {
      type: Number,
      default: 24, // Free cancellation up to 24h prior to check-in
      min: 0
    },
    supportEmail: {
      type: String,
      default: 'concierge@hotelpro.com'
    },
    supportPhone: {
      type: String,
      default: '+1 (800) 555-4683'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    currencySymbol: {
      type: String,
      default: '$'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.HotelSetting || mongoose.model('HotelSetting', hotelSettingSchema);
