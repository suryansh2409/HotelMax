import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { connectDB, disconnectDB } from '../src/config/db';
import { seedDatabase } from '../src/utils/seedData';
import User from '../src/models/User';
import Room from '../src/models/Room';
import Booking from '../src/models/Booking';

vi.mock('../src/services/emailService', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    sendEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test_id', mode: 'mock' }),
    sendBookingConfirmationEmail: vi.fn().mockResolvedValue({ success: true, messageId: 'test_id', mode: 'mock' })
  };
});

describe('HotelPro Backend API Suite', () => {
  let customerToken = '';
  let adminToken = '';
  let staffToken = '';
  let sampleRoomId = '';

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    await connectDB(true);
    await seedDatabase();

    // Authenticate Admin
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@hotelpro.com', password: 'Admin@HotelPro2026' });
    expect(adminRes.statusCode).toBe(200);
    adminToken = adminRes.body.data.token;

    // Authenticate Staff
    const staffRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'staff@hotelpro.com', password: 'Staff@HotelPro2026' });
    expect(staffRes.statusCode).toBe(200);
    staffToken = staffRes.body.data.token;

    // Authenticate Customer
    const custRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'guest@hotelpro.com', password: 'Guest@HotelPro2026' });
    expect(custRes.statusCode).toBe(200);
    customerToken = custRes.body.data.token;

    const room = await Room.findOne({ 'capacity.maxGuests': { $gte: 2 } });
    sampleRoomId = room._id.toString();
  }, 30000);

  afterAll(async () => {
    await disconnectDB();
  }, 30000);

  describe('Health and System Status', () => {
    it('should return healthy status on GET /api/v1/health', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body.database.status).toBe('connected');
    });
  });

  describe('Authentication & Role-Based Authorization', () => {
    it('should register a new customer', async () => {
      const uniqueEmail = `testuser_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Sarah Connor',
          email: uniqueEmail,
          phone: '+1 555-888-9999',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('customer'); // Must be customer
      expect(res.body.data.token).toBeDefined();
    });

    it('should prevent duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Alexander Duplicate',
          email: 'guest@hotelpro.com',
          phone: '+1 555-000-0000',
          password: 'Password123!',
          confirmPassword: 'Password123!'
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should prevent password mismatch during registration', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Mismatch User',
          email: 'mismatch@example.com',
          phone: '+1 555-111-2222',
          password: 'Password123!',
          confirmPassword: 'DifferentPassword456!'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'guest@hotelpro.com', password: 'WrongPassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should prevent non-admin from creating rooms (Role check)', async () => {
      const res = await request(app)
        .post('/api/v1/rooms')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          roomNumber: '999',
          title: 'Unauthorized Room',
          type: 'single',
          description: 'This should fail',
          basePrice: 200,
          photos: ['https://example.com/photo.jpg']
        });

      expect(res.statusCode).toBe(403);
    });
  });

  describe('Rooms & Availability Engine', () => {
    it('should list available rooms with filters', async () => {
      const res = await request(app).get('/api/v1/rooms?guests=1&sortBy=basePrice&sortOrder=asc');
      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta.total).toBeGreaterThan(0);
    });

    it('should calculate stay price correctly with taxes and cleaning fee', async () => {
      const checkIn = new Date();
      checkIn.setDate(checkIn.getDate() + 14);
      const checkOut = new Date(checkIn);
      checkOut.setDate(checkOut.getDate() + 3); // 3 nights

      const res = await request(app)
        .post('/api/v1/rooms/calculate-price')
        .send({
          roomId: sampleRoomId,
          checkInDate: checkIn.toISOString(),
          checkOutDate: checkOut.toISOString(),
          guests: 2
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.isAvailable).toBe(true);
      expect(res.body.data.pricing.totalNights).toBe(3);
      expect(res.body.data.pricing.taxes).toBeGreaterThan(0);
      expect(res.body.data.pricing.cleaningFee).toBe(35);
      expect(res.body.data.pricing.totalAmount).toBe(
        res.body.data.pricing.subtotal + res.body.data.pricing.taxes + res.body.data.pricing.cleaningFee
      );
    });
  });

  describe('Booking Lifecycle & Double-Booking Prevention', () => {
    let testBookingId = '';
    let testBookingRef = '';
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 30);
    const checkOut = new Date(checkIn);
    checkOut.setDate(checkOut.getDate() + 3);

    it('should create a valid booking and return unique reference', async () => {
      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          roomId: sampleRoomId,
          checkInDate: checkIn.toISOString(),
          checkOutDate: checkOut.toISOString(),
          guests: { adults: 2, children: 0 },
          guestDetails: {
            fullName: 'Alexander Wright',
            email: 'guest@hotelpro.com',
            phone: '+1 555-749-2041',
            specialRequests: 'Quiet room please'
          }
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.data.booking.bookingReference).toMatch(/^HP-[A-Z0-9]{6}$/);
      testBookingId = res.body.data.booking._id;
      testBookingRef = res.body.data.booking.bookingReference;
    });

    it('should PREVENT overlapping reservation for the same room (Double-booking test)', async () => {
      // Attempt overlapping booking: 1 day inside the existing reservation window
      const overlapIn = new Date(checkIn);
      overlapIn.setDate(overlapIn.getDate() + 1);
      const overlapOut = new Date(checkOut);
      overlapOut.setDate(overlapOut.getDate() + 2);

      const res = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          roomId: sampleRoomId,
          checkInDate: overlapIn.toISOString(),
          checkOutDate: overlapOut.toISOString(),
          guests: { adults: 1, children: 0 },
          guestDetails: {
            fullName: 'Conflicting Guest',
            email: 'conflict@example.com',
            phone: '+1 555-999-9999'
          }
        });

      expect(res.statusCode).toBe(409); // Conflict
      expect(res.body.success).toBe(false);
    });

    it('should process sandbox payment and transition status to confirmed', async () => {
      const res = await request(app)
        .post('/api/v1/payments/process')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          bookingId: testBookingId,
          paymentMethod: 'card',
          cardLast4: '4242',
          cardBrand: 'Visa'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.booking.status).toBe('confirmed');
    }, 15000);

    it('should retrieve booking invoice', async () => {
      const res = await request(app)
        .get(`/api/v1/bookings/${testBookingId}/invoice`)
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.invoiceNumber).toBe(`INV-${testBookingRef}`);
    });

    it('should cancel eligible booking and process refund record', async () => {
      const res = await request(app)
        .post(`/api/v1/bookings/${testBookingId}/cancel`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ reason: 'Trip dates rescheduled' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('cancelled');
      expect(res.body.data.cancellation.refundStatus).toBe('processed');
    });
  });

  describe('Staff & Administrator Dashboards', () => {
    it('should return staff operations summary', async () => {
      const res = await request(app)
        .get('/api/v1/staff/operations')
        .set('Authorization', `Bearer ${staffToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalRooms).toBeGreaterThan(0);
    });

    it('should return admin dashboard statistics calculated from database', async () => {
      const res = await request(app)
        .get('/api/v1/admin/dashboard-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.totalBookings).toBeGreaterThan(0);
      expect(res.body.data.totalRevenue).toBeGreaterThan(0);
      expect(res.body.data.totalCustomers).toBeGreaterThan(0);
    });

    it('should export bookings to CSV', async () => {
      const res = await request(app)
        .get('/api/v1/reports/bookings/csv')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.text).toContain('Booking Reference');
    });
  });

  describe('CORS Policy & Safe Error Handling', () => {
    it('should permit requests with Origin from deployed Vercel frontend', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Origin', 'https://hotel-pro-n4ga.vercel.app')
        .send({ email: 'guest@hotelpro.com', password: 'Guest@HotelPro2026' });

      expect(res.statusCode).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('https://hotel-pro-n4ga.vercel.app');
    });

    it('should permit requests from Vercel preview deployments (*.vercel.app)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .set('Origin', 'https://hotel-pro-preview-branch.vercel.app')
        .send({ email: 'guest@hotelpro.com', password: 'Guest@HotelPro2026' });

      expect(res.statusCode).toBe(200);
      expect(res.headers['access-control-allow-origin']).toBe('https://hotel-pro-preview-branch.vercel.app');
    });

    it('should return 401 when user has missing or empty password in database', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent_test@hotelpro.com', password: 'AnyPassword123' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.statusCode).not.toBe(500);
    });
  });
});
