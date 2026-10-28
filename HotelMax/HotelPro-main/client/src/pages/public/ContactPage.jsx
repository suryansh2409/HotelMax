import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="contact-page py-5">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-5">
          <span className="section-tag">24/7 Concierge & Inquiries</span>
          <h1 className="section-title">Get in Touch with Our Team</h1>
          <p className="text-muted mx-auto" style={{ maxWidth: '600px' }}>
            Whether planning an upcoming stay, organizing a private event, or requesting bespoke arrangements, our team is at your disposal.
          </p>
        </div>

        <div className="row g-5">
          {/* Contact Details & Cards */}
          <div className="col-lg-5">
            <div className="p-4 bg-white rounded-4 border shadow-sm mb-4">
              <h4 className="fw-bold text-dark mb-4">Hotel Information</h4>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3">
                  <MapPin size={22} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Estate Location</h6>
                  <p className="text-secondary small mb-0">
                    100 Oceanfront Boulevard, Miami Beach, FL 33139, United States
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3">
                  <Phone size={22} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Telephone & Concierge</h6>
                  <p className="text-secondary small mb-0">+1 (800) 555-4683</p>
                  <p className="text-secondary small mb-0">+1 (305) 555-0199 (Direct Front Desk)</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3">
                  <Mail size={22} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Electronic Inquiries</h6>
                  <p className="text-secondary small mb-0">concierge@hotelpro.com</p>
                  <p className="text-secondary small mb-0">reservations@hotelpro.com</p>
                </div>
              </div>

              <div className="d-flex align-items-start gap-3">
                <div className="bg-warning bg-opacity-10 text-warning p-2 rounded-3">
                  <Clock size={22} />
                </div>
                <div>
                  <h6 className="fw-bold text-dark mb-1">Operating Hours</h6>
                  <p className="text-secondary small mb-0">Front Desk & Concierge: 24 Hours / 7 Days</p>
                  <p className="text-secondary small mb-0">Valet & Luggage Assistance: 24 Hours</p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Contact Form */}
          <div className="col-lg-7">
            <div className="card hp-card p-4 p-sm-5 border-0 shadow-sm">
              <h4 className="fw-bold text-dark mb-2">Send Us a Direct Message</h4>
              <p className="text-muted small mb-4">We reply to all inquiries within two hours.</p>

              {submitted ? (
                <div className="p-4 text-center bg-light rounded-3 border">
                  <CheckCircle2 size={42} className="text-success mb-3" />
                  <h5 className="fw-bold text-dark">Message Dispatched</h5>
                  <p className="text-secondary small mb-3">
                    Thank you, {formData.name}. Our concierge desk has received your request and will contact you via {formData.email}.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-outline-secondary btn-sm">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Your Name</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Email Address</label>
                      <input
                        type="email"
                        className="form-control"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-secondary">Subject</label>
                      <select
                        className="form-select"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        <option value="Suite Reservation">Suite Reservation Inquiry</option>
                        <option value="Private Dining & Events">Private Dining & Events</option>
                        <option value="Concierge & Chauffeur">Concierge & Chauffeur</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-secondary">Message / Requests</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      placeholder="How may our team assist your upcoming stay?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-gold w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2">
                    <Send size={16} /> Transmit Inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
