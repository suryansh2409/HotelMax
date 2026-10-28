const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'HotelPro API Documentation',
    version: '1.0.0',
    description: 'Comprehensive REST API documentation for HotelPro - Full-Stack Hotel Booking & Management System',
    contact: {
      name: 'HotelPro Engineering',
      email: 'support@hotelpro.com'
    }
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Base Endpoint'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/health': {
      get: {
        summary: 'System health check',
        responses: {
          200: { description: 'Server and database connection status' }
        }
      }
    },
    '/auth/register': {
      post: {
        summary: 'Register new customer account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string' },
                  phone: { type: 'string' },
                  password: { type: 'string' },
                  confirmPassword: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'User registered' } }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user with email and password',
        responses: { 200: { description: 'Login successful with JWT token' } }
      }
    },
    '/rooms': {
      get: {
        summary: 'Search and filter rooms by availability, type, capacity, and price',
        parameters: [
          { name: 'checkInDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'checkOutDate', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'guests', in: 'query', schema: { type: 'integer' } },
          { name: 'type', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } }
        ],
        responses: { 200: { description: 'Paginated list of available rooms' } }
      }
    },
    '/bookings': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Create reservation with concurrency and double-booking verification',
        responses: { 201: { description: 'Reservation created' } }
      }
    },
    '/payments/process': {
      post: {
        security: [{ bearerAuth: [] }],
        summary: 'Process sandbox or gateway payment for booking',
        responses: { 200: { description: 'Payment captured and booking confirmed' } }
      }
    },
    '/staff/operations': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Staff operational daily summary',
        responses: { 200: { description: 'Arrivals, departures, and occupancy metrics' } }
      }
    },
    '/admin/dashboard-stats': {
      get: {
        security: [{ bearerAuth: [] }],
        summary: 'Admin executive metrics and real-time KPIs',
        responses: { 200: { description: 'Database-driven stats' } }
      }
    }
  }
};

const setupSwagger = (app) => {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

module.exports = { setupSwagger, swaggerDocument };
