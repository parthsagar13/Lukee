import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';
import { IMAGES, STORES } from '../data/luxuryContent.js';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    showroom: 'new-york',
    message: '',
    date: '',
    services: [] as string[],
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSubmitted(true);
    }
  };

  const handleServiceChange = (service: string) => {
    setFormData((prev) => {
      const exists = prev.services.includes(service);
      const updated = exists
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service];
      return { ...prev, services: updated };
    });
  };

  return (
    <div id="contact-page" className="bg-white text-ink">
      {/* Header */}
      <section className="relative py-16 md:py-20 overflow-hidden border-b border-line">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url(${IMAGES.store})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 text-center space-y-4">
          <p className="section-eyebrow">Salon Appointment</p>
          <h1 className="font-serif text-4xl sm:text-5xl font-light tracking-wide">
            Connect &amp; Reserve
          </h1>
          <div className="w-14 h-px bg-brand mx-auto" />
          <p className="text-sm text-muted font-light max-w-xl mx-auto leading-relaxed">
            Book a private viewing at our salon, schedule a video concierge consultation, or enquire about
            custom diamond commissioning.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        {/* Store cards + map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-5 space-y-5">
            {STORES.map((store) => (
              <article
                key={store.name}
                className="bg-white border border-line overflow-hidden luxury-shadow flex flex-col sm:flex-row"
              >
                <div className="sm:w-36 h-36 sm:h-auto flex-shrink-0 relative">
                  <img
                    src={store.img}
                    alt={store.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-5 space-y-2 flex-1">
                  <h3 className="font-serif text-xl font-semibold text-ink">{store.name}</h3>
                  <p className="text-xs text-muted flex items-start gap-2">
                    <MapPin size={14} className="text-brand flex-shrink-0 mt-0.5" />
                    {store.address}
                  </p>
                  <p className="text-xs text-muted flex items-center gap-2">
                    <Clock size={14} className="text-brand flex-shrink-0" />
                    {store.hours}
                  </p>
                </div>
              </article>
            ))}

            <div className="bg-brand-soft border border-line p-6 text-center space-y-2">
              <Clock size={16} className="text-brand mx-auto" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-dark">
                Global Concierge Response
              </h4>
              <p className="text-[0.7rem] text-muted font-light max-w-xs mx-auto leading-relaxed">
                Our digital concierge team is available 24/7. Standard email and inquiry responses are
                dispatched in under 2 hours.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 relative min-h-[280px] lg:min-h-full overflow-hidden border border-line luxury-shadow">
            <img
              src={IMAGES.store}
              alt="Salon location map placeholder"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-ink/40" />
            <div className="absolute inset-0 flex items-end p-6 sm:p-8">
              <div className="bg-white/95 border border-line p-5 space-y-3 max-w-sm luxury-shadow">
                <p className="section-eyebrow">Visit Us</p>
                <h3 className="font-serif text-xl font-semibold text-ink">Salon Concierge</h3>
                <div className="space-y-2 text-xs text-muted">
                  <p className="flex items-center gap-2">
                    <Phone size={14} className="text-brand" />
                    +91 22 5555 0180
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail size={14} className="text-brand" />
                    concierge@lukeejewels.com
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin size={14} className="text-brand mt-0.5" />
                    Linking Road, Mumbai &amp; Connaught Place, New Delhi
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-4 space-y-4">
            <p className="section-eyebrow">Private Booking</p>
            <h2 className="font-serif text-3xl font-light">Request an Appointment</h2>
            <div className="w-14 h-px bg-brand" />
            <p className="text-sm text-muted leading-relaxed">
              Share your preferences and preferred date. Our salon team will confirm a private viewing
              or virtual consultation within two hours.
            </p>
          </div>

          <div className="lg:col-span-8 bg-white border border-line p-8 sm:p-10 luxury-shadow">
            {submitted ? (
              <div className="text-center py-12 space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="font-serif text-2xl text-ink font-light">Consultation Scheduled</h3>
                <p className="text-sm text-muted max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-medium text-ink">{formData.name}</span>. Our salon
                  concierge team is reviewing your details. A confirmation has been dispatched to{' '}
                  <span className="font-medium text-ink">{formData.email}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      showroom: 'new-york',
                      message: '',
                      date: '',
                      services: [],
                    });
                  }}
                  className="btn-secondary mt-4"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-serif text-2xl text-ink font-light">Bespoke Inquiry &amp; Booking</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[0.7rem] tracking-wider uppercase text-muted block">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your full name"
                      className="input-luxury"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.7rem] tracking-wider uppercase text-muted block">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@email.com"
                      className="input-luxury"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[0.7rem] tracking-wider uppercase text-muted block">
                      Phone (Optional)
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="input-luxury"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[0.7rem] tracking-wider uppercase text-muted block">
                      Salon Location
                    </label>
                    <select
                      value={formData.showroom}
                      onChange={(e) => setFormData({ ...formData, showroom: e.target.value })}
                      className="input-luxury"
                    >
                      <option value="new-york">New York Salon (Fifth Ave)</option>
                      <option value="paris">Paris Atelier (Place Vendôme)</option>
                      <option value="geneva">Geneva Boutique (Rue du Rhône)</option>
                      <option value="virtual">Virtual Concierge (Video Link)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <label className="text-[0.7rem] tracking-wider uppercase text-muted block">
                    Required Services
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'custom', label: 'Custom Engagement' },
                      { key: 'viewing', label: 'Bespoke Salon Tour' },
                      { key: 'sizing', label: 'Cleaning & Valuation' },
                    ].map((service) => {
                      const isChecked = formData.services.includes(service.key);
                      return (
                        <button
                          type="button"
                          key={service.key}
                          onClick={() => handleServiceChange(service.key)}
                          className={`text-[0.65rem] p-3 uppercase tracking-wider border transition-colors text-center ${
                            isChecked
                              ? 'bg-ink text-white border-ink font-semibold'
                              : 'bg-white text-muted border-line hover:border-brand'
                          }`}
                        >
                          {service.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[0.7rem] tracking-wider uppercase text-muted block">
                    Preferred Viewing Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-luxury"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[0.7rem] tracking-wider uppercase text-muted block">
                    Message &amp; Enquiries
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Detail diamond carat, metal preferences, or specific collection inquiries..."
                    className="input-luxury resize-none"
                  />
                </div>

                <button type="submit" className="btn-primary w-full">
                  Submit Private Reservation Request
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
