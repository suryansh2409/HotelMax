import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="hp-footer">
      <div className="container">
        <div className="row g-4 mb-5">
          {/* Brand Info */}
          <div className="col-lg-4 col-md-6">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-warning text-dark p-2 rounded-3 me-2 d-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px' }}>
                <Building2 size={20} color="#0e1e38" />
              </div>
              <span className="brand-font fs-3 fw-bold text-white">Hotel<span style={{ color: '#d4af37' }}>Pro</span></span>
            </div>
            <p className="text-secondary small mb-4" style={{ lineHeight: '1.7' }}>
              Redefining luxury hospitality with bespoke suites, world-class amenities, Michelin-inspired dining, and seamless guest experiences for modern travelers.
            </p>
            <div className="d-flex align-items-center gap-3">
              <span className="badge bg-dark border border-secondary text-light px-3 py-2 d-flex align-items-center gap-1">
                <ShieldCheck size={14} className="text-warning" /> Verified 5-Star Hospitality
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-2 col-md-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase small" style={{ letterSpacing: '0.1em' }}>Navigation</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/rooms">Suites & Rooms</Link></li>
              <li><Link to="/about">Our Heritage</Link></li>
              <li><Link to="/contact">Concierge Support</Link></li>
              <li><Link to="/login">Member Login</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase small" style={{ letterSpacing: '0.1em' }}>Legal & Policies</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-2">
              <li><Link to="/terms-privacy#terms">Terms of Service</Link></li>
              <li><Link to="/terms-privacy#cancellation">Cancellation & Refund Policy</Link></li>
              <li><Link to="/terms-privacy#privacy">Guest Privacy Regulations</Link></li>
              <li><Link to="/terms-privacy#house-rules">Hotel House Rules</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div className="col-lg-3 col-md-6">
            <h6 className="text-white fw-bold mb-3 text-uppercase small" style={{ letterSpacing: '0.1em' }}>Concierge Desk</h6>
            <ul className="list-unstyled small mb-0 d-flex flex-column gap-3 text-secondary">
              <li className="d-flex align-items-start gap-2">
                <MapPin size={18} className="text-warning flex-shrink-0 mt-1" />
                <span>100 Oceanfront Boulevard, Miami Beach, FL 33139</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Phone size={18} className="text-warning flex-shrink-0" />
                <span>+1 (800) 555-4683</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <Mail size={18} className="text-warning flex-shrink-0" />
                <span>concierge@hotelpro.com</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="border-secondary opacity-25 my-4" />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center small text-secondary">
          <p className="mb-2 mb-md-0">
            &copy; {new Date().getFullYear()} HotelPro Grand Resort & Residences. All rights reserved.
          </p>
          <p className="mb-0 d-flex align-items-center gap-1">
            Engineered with <Heart size={14} className="text-danger" /> for hospitality excellence
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
