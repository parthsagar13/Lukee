import React from 'react';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div id="privacy-page" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 font-sans space-y-8 leading-relaxed text-gray-600 font-light text-xs sm:text-sm">
      <div className="text-center space-y-2 border-b border-gold-200 pb-6 mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] font-semibold">Privacy Policy</h1>
        <p className="text-[0.65rem] text-gray-400 uppercase tracking-widest">Effective Date: July 3, 2026</p>
      </div>

      <p>
        At Lukee Jewels, your trust is our ultimate asset. We collect and process your information in full alignment with global security best practices to protect your physical and digital safety.
      </p>

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">1. Information We Collect</h3>
        <p>
          When you request private viewing appointments, configure jewelry settings, or complete product reservations, we gather necessary identifiers: full name, email address, mailing destination, and contact coordinates. Financial billing tokens are securely processed by merchant banking APIs and are never stored directly inside Lukee Jewels vaults.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">2. Vault Safeguards</h3>
        <p>
          Any personal data you submit is encrypted during transit and while sitting inside our database servers. We enforce administrative token filters to ensure that only boutique personnel directly dispatched to your salon viewing have authorized credentials to review your file.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="font-serif text-lg text-[#1A1A1A] font-semibold">3. Third-Party Disclosures</h3>
        <p>
          Lukee Jewels does not participate in data commercialization or list brokering. Your address details are shared exclusively with fully licensed, bonded courier companies to complete your delivery reservations.
        </p>
      </div>
    </div>
  );
};
