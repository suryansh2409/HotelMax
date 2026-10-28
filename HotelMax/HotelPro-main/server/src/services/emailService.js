const nodemailer = require('nodemailer');
const env = require('../config/env');
const logger = require('../utils/logger');

let transporter = null;

if (process.env.NODE_ENV !== 'test' && env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
  logger.info('Nodemailer SMTP transport configured');
}

/**
 * Send transactional email with automatic mock fallback
 */
const sendEmail = async ({ to, subject, html, text }) => {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        text,
        html
      });
      logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId, mode: 'smtp' };
    } catch (err) {
      logger.error(`SMTP email delivery failed to ${to}`, err);
      return { success: false, error: err.message, mode: 'smtp' };
    }
  } else {
    // Graceful simulation mode
    logger.info(`[EMAIL SIMULATOR] To: ${to} | Subject: ${subject}`);
    logger.debug(`[EMAIL CONTENT]\n${text || html}`);
    return {
      success: true,
      messageId: `sim_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      mode: 'simulated',
      note: 'SMTP credentials not configured. Email logged to system console.'
    };
  }
};

const sendBookingConfirmationEmail = async (booking, user, room) => {
  const subject = `Booking Confirmed: ${booking.bookingReference} - HotelPro`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
      <h2 style="color: #1a2b4c; margin-top: 0;">Reservation Confirmed</h2>
      <p>Dear ${user.name},</p>
      <p>Thank you for choosing HotelPro. Your reservation for <strong>${room.title}</strong> has been confirmed.</p>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e9ecef;">Booking Reference:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${booking.bookingReference}</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e9ecef;">Check-in:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${new Date(booking.checkInDate).toDateString()} (From 14:00)</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e9ecef;">Check-out:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${new Date(booking.checkOutDate).toDateString()} (Until 11:00)</td>
        </tr>
        <tr>
          <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e9ecef;">Total Nights:</td>
          <td style="padding: 10px; border-bottom: 1px solid #e9ecef;">${booking.totalNights}</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 10px; font-weight: bold; border-bottom: 1px solid #e9ecef;">Total Paid:</td>
          <td style="padding: 10px; font-weight: bold; color: #b8860b; border-bottom: 1px solid #e9ecef;">$${booking.priceBreakdown.totalAmount.toLocaleString()}</td>
        </tr>
      </table>

      <p style="color: #6c757d; font-size: 14px;">You can view and manage your reservation anytime in your HotelPro customer dashboard.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;" />
      <p style="color: #999; font-size: 12px; text-align: center;">HotelPro Hospitality Group • Luxury Redefined</p>
    </div>
  `;

  return await sendEmail({
    to: user.email,
    subject,
    html,
    text: `Your reservation ${booking.bookingReference} for ${room.title} is confirmed. Total: $${booking.priceBreakdown.totalAmount}`
  });
};

module.exports = {
  sendEmail,
  sendBookingConfirmationEmail
};
