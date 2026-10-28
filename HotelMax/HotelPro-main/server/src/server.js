const app = require('./app');
const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');
const logger = require('./utils/logger');
const Room = require('./models/Room');
const { seedDatabase } = require('./utils/seedData');

let server;

const startServer = async () => {
  try {
    await connectDB();

    // Check if initial seeding is needed
    const roomCount = await Room.countDocuments();
    if (roomCount === 0) {
      logger.info('Empty database detected. Auto-seeding initial HotelPro demo dataset...');
      await seedDatabase();
    }

    server = app.listen(env.PORT, () => {
      logger.info(`HotelPro REST Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
      logger.info(`Health check: http://localhost:${env.PORT}/api/v1/health`);
      logger.info(`Swagger API Docs: http://localhost:${env.PORT}/api/docs`);
    });
  } catch (err) {
    logger.error('Failed to start HotelPro server', err);
    process.exit(1);
  }
};

// Graceful shutdown
const handleExit = async (signal) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      await disconnectDB();
      logger.info('Server closed. Process terminated.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleExit('SIGTERM'));
process.on('SIGINT', () => handleExit('SIGINT'));

startServer();
