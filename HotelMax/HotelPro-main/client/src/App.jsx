import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public Pages
import HomePage from './pages/public/HomePage';
import RoomsPage from './pages/public/RoomsPage';
import RoomDetailsPage from './pages/public/RoomDetailsPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import TermsPrivacyPage from './pages/public/TermsPrivacyPage';

// Customer Pages
import BookingCheckoutPage from './pages/customer/BookingCheckoutPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyBookingsPage from './pages/customer/MyBookingsPage';

// Staff & Admin Dashboards
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

// 404 Fallback Page
const NotFoundPage = () => (
  <div className="py-5 text-center min-vh-50 d-flex flex-column justify-content-center align-items-center">
    <h1 className="display-4 fw-bold text-dark">404</h1>
    <h4 className="fw-bold text-dark mb-2">Page Not Found</h4>
    <p className="text-muted mb-4">The hospitality page you are looking for does not exist or has been relocated.</p>
    <a href="/" className="btn btn-gold">Return to HotelPro Home</a>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Navbar />
          <main className="flex-grow-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/:id" element={<RoomDetailsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/terms-privacy" element={<TermsPrivacyPage />} />

              {/* Protected Customer Routes */}
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                    <BookingCheckoutPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute allowedRoles={['customer', 'staff', 'admin']}>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Staff Route */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={['staff', 'admin']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Protected Admin Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
