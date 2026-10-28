const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro',
  JWT_SECRET: process.env.JWT_SECRET || 'hotelpro_super_secure_jwt_secret_key_2026_xyz',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'https://hotel-pro-n4ga.vercel.app,http://localhost:5173',
  
  // Payment Gateway Config
  PAYMENT_PROVIDER: process.env.PAYMENT_PROVIDER || 'sandbox',
  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID || '',
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || '',
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY || '',
  
  // Email Config
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT, 10) || 587,
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  EMAIL_FROM: process.env.EMAIL_FROM || 'HotelPro Support <support@hotelpro.com>',
  
  // Initial Admin Credentials (used by seed script, NEVER hardcoded in public routes)
  ADMIN_NAME: process.env.ADMIN_NAME || 'HotelPro Master Admin',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@hotelpro.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'Admin@HotelPro2026',
  ADMIN_PHONE: process.env.ADMIN_PHONE || '+1 (555) 019-2834'
};

module.exports = env;
