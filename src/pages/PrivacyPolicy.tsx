import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="text-ivory min-h-[60vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 font-sans space-y-8">
        <div className="text-center space-y-3 border-b border-line pb-8 mb-4">
          <p className="section-eyebrow">Legal</p>
          <h1 className="font-serif text-3xl sm:text-5xl text-ink font-light">Privacy Policy</h1>
          <p className="text-[0.65rem] text-muted uppercase tracking-[0.2em]">Effective Date: July 3, 2026</p>
        </div>

        <p className="text-sm text-muted leading-relaxed">
          At Lukee Jewels, your trust is our ultimate asset. We collect and process your information in full alignment with global security best practices to protect your physical and digital safety.
        </p>

        {[
          {
            t: '1. Information We Collect',
            b: 'When you request private viewing appointments, configure jewelry settings, or complete product reservations, we gather necessary identifiers: full name, email address, mailing destination, and contact coordinates. Financial billing tokens are securely processed by merchant banking APIs and are never stored directly inside Lukee Jewels systems.',
          },
          {
            t: '2. Safeguards',
            b: 'Any personal data you submit is encrypted during transit and at rest. We enforce administrative token filters so only authorised boutique personnel can review your file.',
          },
          {
            t: '3. Third-Party Disclosures',
            b: 'Lukee Jewels does not sell or broker personal data. Address details are shared exclusively with licensed, bonded courier partners to complete delivery.',
          },
          {
            t: '4. Your Choices',
            b: 'You may request access, correction, or deletion of your personal information by contacting our concierge team at hello@lukeejewels.com.',
          },
        ].map((s) => (
          <div key={s.t} className="space-y-3">
            <h3 className="font-serif text-xl text-ink font-light">{s.t}</h3>
            <p className="text-sm text-muted leading-relaxed">{s.b}</p>
          </div>
        ))}

        <div className="pt-6">
          <Link to="/contact" className="btn-secondary">
            Contact Concierge
          </Link>
        </div>
      </div>
    </div>
  );
};
