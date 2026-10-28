const mongoose = require('mongoose');
const env = require('./env');
const logger = require('../utils/logger');

let mongoMemoryServer = null;

const connectDB = async (forceMemory = false) => {
  // If in test environment or forced, go directly to MongoMemoryServer
  if (forceMemory || process.env.NODE_ENV === 'test') {
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const opts = {};
      const fs = require('fs');
      const binaryPath = '/private/tmp/mongodb-binaries/mongod-arm64-darwin-7.0.24';
      if (fs.existsSync(binaryPath)) {
        opts.binary = { systemBinary: binaryPath };
      }
      mongoMemoryServer = await MongoMemoryServer.create(opts);
      const memUri = mongoMemoryServer.getUri();
      logger.info(`Starting in-memory MongoDB instance for test/dev at ${memUri}`);
      await mongoose.connect(memUri, { directConnection: true });
      logger.info('Connected to In-Memory MongoDB successfully');
      return mongoose.connection;
    } catch (memErr) {
      logger.error('Failed to initialize in-memory MongoDB', memErr);
      throw memErr;
    }
  }

  try {
    // Attempt standard connection first
    const connOptions = {
      serverSelectionTimeoutMS: 3000
    };

    logger.info(`Attempting to connect to MongoDB: ${env.MONGODB_URI}`);
    await mongoose.connect(env.MONGODB_URI, connOptions);
    logger.info(`MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return mongoose.connection;
  } catch (primaryErr) {
    logger.warn(`Direct connection failed (${primaryErr.message}). Checking MongoMemoryServer fallback...`);

    // In local development or testing, fall back to in-memory MongoDB
    if (env.NODE_ENV !== 'production') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        const opts = {};
        const fs = require('fs');
        const binaryPath = '/private/tmp/mongodb-binaries/mongod-arm64-darwin-7.0.24';
        if (fs.existsSync(binaryPath)) {
          opts.binary = { systemBinary: binaryPath };
        }
        mongoMemoryServer = await MongoMemoryServer.create(opts);
        const memUri = mongoMemoryServer.getUri();
        logger.info(`Starting in-memory MongoDB fallback instance at ${memUri}`);
        await mongoose.connect(memUri);
        logger.info('Connected to In-Memory MongoDB successfully');
        return mongoose.connection;
      } catch (memErr) {
        logger.error('Failed to initialize in-memory MongoDB fallback', memErr);
        throw memErr;
      }
    } else {
      logger.error('MongoDB connection failure in production environment', primaryErr);
      throw primaryErr;
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    logger.info('MongoDB disconnected');
  } catch (err) {
    logger.error('Error during MongoDB disconnect', err);
  }
};

module.exports = { connectDB, disconnectDB };
