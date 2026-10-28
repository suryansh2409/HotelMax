const HotelSetting = require('../models/HotelSetting');

/**
 * Calculates itemized pricing breakdown for a stay
 */
const calculateStayPricing = async (room, checkInDate, checkOutDate, guests = 1) => {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);

  const diffTime = checkOut.getTime() - checkIn.getTime();
  const totalNights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));

  // Retrieve current hotel tax and fee settings
  const settings = (await HotelSetting.findOne()) || {
    taxPercentage: 12,
    cleaningFee: 35
  };

  const nightlyRate = Math.round(room.basePrice * (room.seasonalPriceMultiplier || 1.0));
  const subtotal = nightlyRate * totalNights;
  const taxes = Math.round(subtotal * (settings.taxPercentage / 100));
  const cleaningFee = settings.cleaningFee || 35;
  const discount = 0;
  const totalAmount = subtotal + taxes + cleaningFee - discount;

  return {
    totalNights,
    nightlyRate,
    subtotal,
    taxes,
    cleaningFee,
    discount,
    totalAmount,
    currency: 'USD',
    taxRatePercentage: settings.taxPercentage
  };
};

module.exports = {
  calculateStayPricing
};
