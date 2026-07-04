import React from 'react';

export const Terms: React.FC = () => {
  return (
    <div id="terms-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 font-sans space-y-8 leading-relaxed text-gray-600 font-light text-xs sm:text-sm">
      <div className="text-center space-y-2 border-b border-gold-200 pb-6 mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-semibold">Terms & Conditions</h1>
        <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest">Effective Date: July 3, 2026</p>
      </div>

      <p>
        These terms govern the use of Lukee Jewels boutiques and virtual shopping networks. By completing luxury jewelry reservations or browsing catalog indices, you agree to these bounds.
      </p>

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">1. Reservation Integrity</h3>
        <p>
          Products listed in our catalog represent finite hand-forged metals. We update inventory records to match boutique vaults; however, if two reservations occur simultaneously, we resolve fulfillment chronologically. Price listings are verified but can be adjusted if raw precious metals undergo sudden massive exchange fluctuations.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">2. Shipping and Liability</h3>
        <p>
          All dispatched shipments are fully insured against theft, loss, or damage in transit. Risk transfers to the buyer upon receipt signatures. All packages are double-boxed in high-security neutral cardboard to guarantee anonymous delivery.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">3. Gemstone Certification</h3>
        <p>
          Jewelry descriptions detail metal weights, karat numbers, and diamond clarity with maximum precision. Variations in natural minerals can include micro inclusions that define gemstone originality. Certified valuations are furnished for reference only and represent objective gemstone grading criteria at the time of examination.
        </p>
      </div>
    </div>
  );
};
