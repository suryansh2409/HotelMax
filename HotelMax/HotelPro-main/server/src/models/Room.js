const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true
    },
    roomNumber: {
      type: String,
      required: [true, 'Room number is required'],
      unique: true,
      trim: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Room title is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Room type is required'],
      enum: {
        values: ['single', 'double', 'deluxe', 'suite', 'presidential'],
        message: '{VALUE} is not a supported room category'
      },
      index: true
    },
    description: {
      type: String,
      required: [true, 'Room description is required']
    },
    basePrice: {
      type: Number,
      required: [true, 'Base price per night is required'],
      min: [1, 'Price must be greater than zero']
    },
    seasonalPriceMultiplier: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 3.0
    },
    capacity: {
      adults: { type: Number, default: 2, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      maxGuests: { type: Number, default: 2, min: 1 }
    },
    bedType: {
      type: String,
      default: 'King Size Bed'
    },
    sizeSqFt: {
      type: Number,
      default: 420
    },
    amenities: {
      type: [String],
      default: ['High-speed WiFi', 'Air Conditioning', 'Smart TV', 'Ensuite Bathroom', 'Minibar', 'Room Service']
    },
    photos: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80'
      ]
    },
    // Physical state of the room in the hotel (separate from reservation dates!)
    physicalStatus: {
      type: String,
      enum: ['available', 'occupied', 'cleaning', 'maintenance'],
      default: 'available',
      index: true
    },
    featured: {
      type: Boolean,
      default: false,
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Virtual for effective current price
roomSchema.virtual('currentPrice').get(function () {
  return Math.round(this.basePrice * (this.seasonalPriceMultiplier || 1.0));
});

roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

module.exports = mongoose.models.Room || mongoose.model('Room', roomSchema);
