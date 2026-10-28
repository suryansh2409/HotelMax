const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');
const { setupSwagger } = require('./config/swagger');

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // allow Swagger UI and frontend preview
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration - Support local dev, configured CLIENT_URL, and production Vercel origins
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:3000',
    'https://hotel-pro-n4ga.vercel.app'
  ];

  if (env.CLIENT_URL) {
    const envOrigins = env.CLIENT_URL.split(',').map((u) => u.trim());
    origins.push(...envOrigins);
  }

  // Normalize by removing trailing slashes and duplicates
  return Array.from(new Set(origins.filter(Boolean).map((u) => u.replace(/\/$/, ''))));
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) {
        return callback(null, true);
      }

      const cleanOrigin = origin.replace(/\/$/, '');

      // Allow if origin is in allowedOrigins list, matches any .vercel.app domain, or non-production
      const isAllowed =
        allowedOrigins.includes(cleanOrigin) ||
        /\.vercel\.app$/.test(cleanOrigin) ||
        env.NODE_ENV !== 'production';

      if (isAllowed) {
        return callback(null, true);
      }

      const corsError = new Error(`Blocked by CORS policy: Origin ${origin} is not allowed`);
      corsError.statusCode = 403;
      return callback(corsError);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global API rate limiting
app.use('/api/', apiLimiter);

// Swagger Documentation
setupSwagger(app);

// Mount API routes
app.use('/api/v1', routes);

// Base route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to HotelPro API',
    docs: '/api/docs',
    health: '/api/v1/health'
  });
});

// Centralized error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
