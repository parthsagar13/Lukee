import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Instagram, Facebook, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer id="main-footer" className="bg-[#FDFCFB] text-gray-500 border-t border-gold-200 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand & Newsletter Column */}
          <div className="space-y-6">
            <div>
              <span className="font-serif text-2xl tracking-[0.2em] text-[#1A1A1A] block">LUKEE</span>
              <span className="font-sans text-[0.6rem] tracking-[0.5em] text-gold-500 block -mt-1 uppercase">JEWELS</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed font-light">
              Designing exclusive, masterfully crafted jewelry for discerning clients worldwide. Indulge in certified diamonds, fine metals, and timeless artistry.
            </p>
            <div className="space-y-3">
              <span className="text-xs tracking-wider uppercase text-[#1A1A1A] font-semibold block">Newsletter</span>
              {subscribed ? (
                <p className="text-xs text-gold-500">Thank you for subscribing to our luxury updates.</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex border-b border-gold-200 py-1.5 max-w-sm">
                  <input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-transparent border-none text-xs w-full text-[#1A1A1A] placeholder-gray-400 focus:outline-none"
                  />
                  <button type="submit" className="text-gold-500 hover:text-gold-600 transition-colors" aria-label="Subscribe">
                    <ArrowRight size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Quick Shop Links */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-[#1A1A1A] mb-6 font-semibold">Explore Shop</h4>
            <ul className="space-y-3 text-xs font-light text-gray-500">
              <li><Link to="/shop" className="hover:text-gold-500 transition-colors">Shop All Jewelry</Link></li>
              <li><Link to="/shop?category=engagement-rings" className="hover:text-gold-500 transition-colors">Engagement Rings</Link></li>
              <li><Link to="/shop?category=necklaces" className="hover:text-gold-500 transition-colors">Luxury Necklaces</Link></li>
              <li><Link to="/shop?category=earrings" className="hover:text-gold-500 transition-colors">Bespoke Earrings</Link></li>
              <li><Link to="/collections" className="hover:text-gold-500 transition-colors">Exclusive Collections</Link></li>
            </ul>
          </div>

          {/* Legal and Support */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-[#1A1A1A] mb-6 font-semibold">Customer Service</h4>
            <ul className="space-y-3 text-xs font-light text-gray-500">
              <li><Link to="/about" className="hover:text-gold-500 transition-colors">The Brand Story</Link></li>
              <li><Link to="/contact" className="hover:text-gold-500 transition-colors">Boutique Locations</Link></li>
              <li><Link to="/privacy" className="hover:text-gold-500 transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-gold-500 transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/contact" className="hover:text-gold-500 transition-colors">Book a Private Viewing</Link></li>
            </ul>
          </div>

          {/* Contact details */}
          <div className="space-y-4 text-xs font-light text-gray-500">
            <h4 className="text-xs tracking-widest uppercase text-[#1A1A1A] mb-6 font-semibold">The Boutique</h4>
            <div className="flex items-start space-x-3">
              <MapPin size={16} className="text-gold-500 mt-0.5 flex-shrink-0" />
              <span>
                Lukee Jewels Salon<br />
                744 Fifth Avenue, New York, NY 10019
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone size={16} className="text-gold-500 flex-shrink-0" />
              <span>+1 (212) 555-0180</span>
            </div>
            <div className="flex items-center space-x-3">
              <Mail size={16} className="text-gold-500 flex-shrink-0" />
              <span>concierge@lukeejewels.com</span>
            </div>
            <div className="pt-2 flex space-x-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-500 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gold-500 transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gold-200 pt-8 flex flex-col md:flex-row justify-between items-center text-[0.7rem] text-gray-400 font-light space-y-4 md:space-y-0">
          <div>
            &copy; {new Date().getFullYear()} Lukee Jewels Inc. All rights reserved. Registered trademark.
          </div>
          <div className="flex space-x-6">
            <Link to="/privacy" className="hover:text-gold-500">Privacy</Link>
            <Link to="/terms" className="hover:text-gold-500">Terms</Link>
            <Link to="/admin/login" className="hover:text-gold-500">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
