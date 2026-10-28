import React from 'react';
import { Award, Compass, HeartHandshake, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="about-page py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="section-tag">Our Heritage & Vision</span>
          <h1 className="section-title">The Art of Pure Hospitality</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '680px' }}>
            Founded on the philosophy of understated luxury, HotelPro creates unforgettable residential retreats that blend architecture, culinary mastery, and genuine warmth.
          </p>
        </div>

        {/* Story Section */}
        <div className="row g-5 align-items-center mb-5">
          <div className="col-lg-6">
            <div className="rounded-4 overflow-hidden shadow-lg" style={{ height: '420px' }}>
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
                alt="HotelPro Estate"
                className="w-100 h-100 object-fit-cover"
              />
            </div>
          </div>
          <div className="col-lg-6">
            <span className="badge bg-warning text-dark px-3 py-1 mb-2">Our Origins</span>
            <h2 className="fw-bold text-dark mb-3">Conceived for Discerning Travelers</h2>
            <p className="text-secondary leading-relaxed mb-3">
              HotelPro was founded with a singular ambition: to restore intimacy and bespoke craftsmanship to luxury hospitality. Located along pristine coastlines, each suite is a sanctuary tailored with organic linens, artisan marble, and seamless smart-home connectivity.
            </p>
            <p className="text-secondary leading-relaxed mb-4">
              Whether you are visiting for an executive summit, restorative wellness sabbatical, or private family retreat, our dedicated concierge team ensures every moment is met with effortless grace.
            </p>
            <div className="row g-3">
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <h3 className="fw-bold text-dark mb-0">15+</h3>
                  <div className="small text-muted">Hospitality Accolades</div>
                </div>
              </div>
              <div className="col-sm-6">
                <div className="p-3 bg-light rounded-3 border">
                  <h3 className="fw-bold text-dark mb-0">99.4%</h3>
                  <div className="small text-muted">Guest Satisfaction Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pillars of Excellence */}
        <div className="p-5 bg-white rounded-4 border shadow-sm my-5">
          <div className="text-center mb-5">
            <span className="section-tag">Guiding Principles</span>
            <h2 className="section-title">Our Pillars of Excellence</h2>
          </div>

          <div className="row g-4 text-center">
            <div className="col-md-4">
              <div className="p-3">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-inline-flex mb-3">
                  <Sparkles size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Bespoke Design</h5>
                <p className="text-secondary small">
                  Every suite layout, custom furnishing, and acoustic soundscape is engineered for maximum tranquility and refined aesthetic pleasure.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-inline-flex mb-3">
                  <HeartHandshake size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Intuitive Service</h5>
                <p className="text-secondary small">
                  True service is felt before it is requested. Our concierge anticipates your schedule, culinary preferences, and transportation needs.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-3">
                <div className="bg-warning bg-opacity-10 text-warning p-3 rounded-circle d-inline-flex mb-3">
                  <Shield size={32} />
                </div>
                <h5 className="fw-bold text-dark mb-2">Sustainability & Privacy</h5>
                <p className="text-secondary small">
                  We prioritize environmental conservation, zero-single-use plastics, and strict guest confidentiality standards across all operations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center py-5">
          <h3 className="fw-bold text-dark mb-3">Ready to Experience HotelPro?</h3>
          <p className="text-muted mx-auto mb-4" style={{ maxWidth: '500px' }}>
            Book direct for the guaranteed best rate, complimentary breakfast, and flexible arrival accommodations.
          </p>
          <Link to="/rooms" className="btn btn-gold btn-lg px-5">
            Explore Available Suites
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
