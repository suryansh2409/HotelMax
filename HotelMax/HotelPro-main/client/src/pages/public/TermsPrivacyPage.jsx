import React from 'react';

const TermsPrivacyPage = () => {
  return (
    <div className="terms-privacy-page py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-9">
            <div className="card hp-card p-4 p-md-5 border-0 shadow-sm">
              <span className="section-tag">Governance & Transparency</span>
              <h1 className="display-6 fw-bold text-dark mb-4">Terms, Privacy & Cancellation Policies</h1>
              <p className="text-muted small mb-4">Last Updated: October 2026</p>

              <hr className="my-4" />

              {/* Section 1 */}
              <section id="terms" className="mb-5">
                <h4 className="fw-bold text-dark mb-3">1. Terms of Service</h4>
                <p className="text-secondary small leading-relaxed">
                  By utilizing HotelPro's reservation software and hospitality properties, you acknowledge and agree to comply with our platform policies, reservation terms, and safety guidelines. Reservations confirmed through HotelPro constitute a binding hospitality agreement between the registered guest and HotelPro Grand Resort.
                </p>
                <p className="text-secondary small leading-relaxed">
                  All guests must present a valid government-issued photo identification and credit card upon physical check-in. The registered primary guest must be at least 18 years of age.
                </p>
              </section>

              {/* Section 2 */}
              <section id="cancellation" className="mb-5">
                <h4 className="fw-bold text-dark mb-3">2. Cancellation & Refund Policy</h4>
                <p className="text-secondary small leading-relaxed">
                  We believe in transparent, stress-free hospitality:
                </p>
                <ul className="text-secondary small leading-relaxed">
                  <li>
                    <strong>Free Cancellation:</strong> Guests may cancel reservations free of charge up to <strong>24 hours prior</strong> to the scheduled check-in date (15:00 local hotel time).
                  </li>
                  <li>
                    <strong>Refund Processing:</strong> Eligible refunds are automatically remitted to the original payment method within 3 to 5 business days upon cancellation processing.
                  </li>
                  <li>
                    <strong>Late Cancellations & No-Shows:</strong> Cancellations requested less than 24 hours prior to check-in or failure to arrive are subject to a fee equivalent to the first night's room rate plus applicable taxes.
                  </li>
                </ul>
              </section>

              {/* Section 3 */}
              <section id="privacy" className="mb-5">
                <h4 className="fw-bold text-dark mb-3">3. Guest Data Privacy Regulations</h4>
                <p className="text-secondary small leading-relaxed">
                  HotelPro strictly adheres to contemporary data protection standards. We collect only necessary details to facilitate room bookings, billing verification, and personalized concierge services.
                </p>
                <p className="text-secondary small leading-relaxed">
                  Payment card data is processed through industry-standard tokenized payment providers (Stripe / Razorpay sandbox). <strong>HotelPro never stores raw card credentials or CVVs in its database documents.</strong>
                </p>
              </section>

              {/* Section 4 */}
              <section id="house-rules">
                <h4 className="fw-bold text-dark mb-3">4. Hotel House Rules</h4>
                <p className="text-secondary small leading-relaxed">
                  To ensure quiet enjoyment for all residents, quiet hours are observed between 22:00 and 08:00. Smoking is prohibited in all interior suites, private balconies, and enclosed common areas. Any violation may result in a $350 deep sanitization fee.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPrivacyPage;
