import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Calendar, ShieldCheck } from 'lucide-react';

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    showroom: 'new-york',
    message: '',
    date: '',
    services: [] as string[]
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSubmitted(true);
    }
  };

  const handleServiceChange = (service: string) => {
    setFormData(prev => {
      const exists = prev.services.includes(service);
      const updated = exists
        ? prev.services.filter(s => s !== service)
        : [...prev.services, service];
      return { ...prev, services: updated };
    });
  };

  return (
    <div id="contact-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-16">
      {/* Header */}
      <div className="border-b border-gold-200 pb-8 text-center space-y-3">
        <span className="text-xs tracking-[0.3em] text-gold-500 uppercase font-bold">Salon Appointment</span>
        <h1 className="text-3xl sm:text-5xl font-light tracking-wide text-[#1A1A1A] font-serif">Connect & Reserve</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-light max-w-xl mx-auto leading-relaxed">
          Book a private viewing at our Fifth Avenue salon, schedule a video concierge consultation, or enquire about custom diamond commissioning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Col: Boutique info cards (4 cols) */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#F9F6F2] border border-gold-200 p-8 space-y-6 rounded-sm">
            <h3 className="font-serif text-xl text-[#1A1A1A] font-light border-b border-gold-200 pb-3">The New York Salon</h3>
            
            <div className="space-y-4 text-xs font-light text-gray-600">
              <div className="flex items-start space-x-3.5">
                <MapPin size={18} className="text-gold-500 flex-shrink-0 mt-0.5" />
                <span>
                  Lukee Jewels Salon<br />
                  744 Fifth Avenue, New York, NY 10019
                </span>
              </div>
              <div className="flex items-center space-x-3.5">
                <Phone size={18} className="text-gold-500 flex-shrink-0" />
                <span>+1 (212) 555-0180</span>
              </div>
              <div className="flex items-center space-x-3.5">
                <Mail size={18} className="text-gold-500 flex-shrink-0" />
                <span>concierge@lukeejewels.com</span>
              </div>
              <div className="flex items-start space-x-3.5 border-t border-dashed border-gold-200 pt-4 mt-4">
                <Clock size={18} className="text-gold-500 flex-shrink-0 mt-0.5" />
                <span>
                  Monday - Friday: 10:00 AM - 6:00 PM<br />
                  Saturday: 11:00 AM - 5:00 PM (Appointments only)<br />
                  Sunday: Closed
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gold-100/30 border border-gold-200 p-6 text-center space-y-2 rounded-sm">
            <Clock size={16} className="text-gold-500 mx-auto" />
            <h4 className="text-xs font-semibold uppercase text-gold-800">Global Concierge Response</h4>
            <p className="text-[0.7rem] text-gray-500 font-light max-w-xs mx-auto leading-relaxed">
              Our digital concierge team is available 24/7. Standard email and inquiry responses are dispatched in under 2 hours.
            </p>
          </div>
        </div>

        {/* Right Col: Interactive Appointment Form (7 cols) */}
        <div className="lg:col-span-7 bg-[#FDFCFB] border border-gold-200 p-8 sm:p-10 luxury-shadow rounded-sm">
          {submitted ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={28} />
              </div>
              <h3 className="font-serif text-2xl text-[#1A1A1A] font-semibold">Consultation Scheduled</h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed font-light">
                Thank you, <span className="font-medium text-[#1A1A1A]">{formData.name}</span>. Our Fifth Avenue salon concierge team is reviewing your details. A secure call link or salon pass confirmation has been dispatched to <span className="font-medium text-[#1A1A1A]">{formData.email}</span>.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', phone: '', showroom: 'new-york', message: '', date: '', services: [] });
                }}
                className="mt-6 border border-gold-300 text-[#1A1A1A] px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-gold-100 font-semibold rounded-sm"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="font-serif text-2xl text-[#1A1A1A] font-light">Bespoke Inquiry & Booking</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[0.7rem] tracking-wider uppercase text-gray-500 block">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-[#1A1A1A]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.7rem] tracking-wider uppercase text-gray-500 block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@luxury-living.com"
                    className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[0.7rem] tracking-wider uppercase text-gray-500 block">Phone (Optional)</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 019-2811"
                    className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-[#1A1A1A]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.7rem] tracking-wider uppercase text-gray-500 block">Salon Location</label>
                  <select
                    value={formData.showroom}
                    onChange={(e) => setFormData({ ...formData, showroom: e.target.value })}
                    className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-[#1A1A1A]"
                  >
                    <option value="new-york">New York Salon (Fifth Ave)</option>
                    <option value="paris">Paris Atelier (Place Vendôme)</option>
                    <option value="geneva">Geneva Boutique (Rue du Rhône)</option>
                    <option value="virtual">Virtual Concierge (Video Link)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-[0.7rem] tracking-wider uppercase text-gray-500 block">Required Services</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'custom', label: 'Custom Engagement' },
                    { key: 'viewing', label: 'Bespoke Salon Tour' },
                    { key: 'sizing', label: 'Cleaning & Valuation' }
                  ].map((service) => {
                    const isChecked = formData.services.includes(service.key);
                    return (
                      <button
                        type="button"
                        key={service.key}
                        onClick={() => handleServiceChange(service.key)}
                        className={`text-[0.65rem] p-2.5 uppercase tracking-wider rounded-sm border transition-colors text-center ${
                          isChecked
                            ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold'
                            : 'bg-[#F9F6F2] text-gray-500 border-gold-200 hover:border-gold-400'
                        }`}
                      >
                        {service.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.7rem] tracking-wider uppercase text-gray-500 block">Preferred Viewing Date (Optional)</label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-[#1A1A1A]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.7rem] tracking-wider uppercase text-gray-500 block">Message & Enquiries</label>
                <textarea
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Detail diamond carat, metal alloy preferences, or specific collection inquiries..."
                  className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-3 px-3.5 focus:outline-none focus:border-gold-500 rounded-sm text-[#1A1A1A] resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-bold py-4 hover:bg-gold-500 hover:text-white transition-all duration-300 rounded-sm"
              >
                Submit Private Reservation Request
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
