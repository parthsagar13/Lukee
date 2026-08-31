import React from 'react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
  return (
    <div className="bg-white text-ink min-h-[60vh]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 md:py-24 font-sans space-y-8">
        <div className="text-center space-y-3 border-b border-line pb-8 mb-4">
          <p className="section-eyebrow">Legal</p>
          <h1 className="font-serif text-3xl sm:text-5xl text-ink font-light">Terms & Conditions</h1>
          <p className="text-[0.65rem] text-muted uppercase tracking-[0.2em]">Effective Date: July 3, 2026</p>
        </div>

        <p className="text-sm text-muted leading-relaxed">
          These terms govern the use of Lukee Jewels boutiques and online shopping experiences. By browsing or completing a purchase, you agree to these bounds.
        </p>

        {[
          {
            t: '1. Reservation Integrity',
            b: 'Products listed represent finite handcrafted inventory. If two reservations occur simultaneously, we resolve fulfillment chronologically. Prices may adjust if precious-metal markets move materially before confirmation.',
          },
          {
            t: '2. Shipping and Liability',
            b: 'All dispatched shipments are fully insured against theft, loss, or damage in transit. Risk transfers to the buyer upon receipt. Packages use discreet outer packaging for privacy.',
          },
          {
            t: '3. Gemstone Certification',
            b: 'Diamond and fine jewellery pieces ship with authenticity documentation aligned to trusted lab standards where applicable.',
          },
          {
            t: '4. Exchange Policy',
            b: 'Eligible pieces may be exchanged toward a new Lukee design under our lifetime exchange programme. Custom or engraved items may have limited eligibility.',
          },
        ].map((s) => (
          <div key={s.t} className="space-y-3">
            <h3 className="font-serif text-xl text-ink font-light">{s.t}</h3>
            <p className="text-sm text-muted leading-relaxed">{s.b}</p>
          </div>
        ))}

        <div className="pt-6 flex flex-wrap gap-3">
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
          <Link to="/privacy-policy" className="btn-secondary">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};
