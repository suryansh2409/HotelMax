const mongoose = require('mongoose');

const getHealth = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.round(process.uptime()),
    service: 'HotelPro Backend API',
    version: '1.0.0',
    database: {
      status: dbStatus,
      name: mongoose.connection.name
    },
    environment: process.env.NODE_ENV || 'development'
  });
};

module.exports = { getHealth };
