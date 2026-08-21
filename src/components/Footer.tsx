import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Instagram,
  Facebook,
  Phone,
  MapPin,
  Mail,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

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
    <footer className="bg-dark text-white/70 pt-16 pb-8 font-sans">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="bg-white/[0.04] border border-white/10 rounded-xl p-6 md:p-8 mb-12 grid md:grid-cols-2 gap-6 items-center">
          <div>
            <p className="text-brand text-[12px] tracking-[1.2px] uppercase font-bold mb-2">Newsletter</p>
            <h3 className="font-serif text-[26px] md:text-[32px] text-white font-semibold tracking-[0.15px]">
              Join the Lukee circle
            </h3>
            <p className="mt-2 text-sm text-white/55 max-w-md">
              Early access to drops, private viewings, and styling notes.
            </p>
          </div>
          <div>
            {subscribed ? (
              <p className="text-brand text-sm font-bold">Thank you — welcome to the circle.</p>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 bg-white/5 border border-white/15 rounded-lg px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                  Subscribe
                  <ArrowRight size={14} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <Link to="/" aria-label="Lukee Jewels Home">
              <img
                src="/lukee-logo.PNG"
                alt="Lukee Jewels"
                className="h-14 w-auto object-contain brightness-0 invert opacity-90"
              />
            </Link>
            <p className="text-xs leading-relaxed text-white/50">
              Certified diamonds & fine gold, crafted for modern rituals and lifelong occasions.
            </p>
            <div className="flex gap-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg border border-white/15 hover:border-brand hover:text-brand transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-lg border border-white/15 hover:border-brand hover:text-brand transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-[12px] tracking-[1px] uppercase text-white mb-4 font-bold">Shop</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop" className="hover:text-brand transition-colors">Shop All</Link></li>
              <li><Link to="/shop?bestSeller=true" className="hover:text-brand transition-colors">Bestsellers</Link></li>
              <li><Link to="/shop?newArrival=true" className="hover:text-brand transition-colors">New Arrivals</Link></li>
              <li><Link to="/collections" className="hover:text-brand transition-colors">Collections</Link></li>
              <li><Link to="/shop?search=ring" className="hover:text-brand transition-colors">Engagement Rings</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] tracking-[1px] uppercase text-white mb-4 font-bold">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/about" className="hover:text-brand transition-colors">Our Story</Link></li>
              <li><Link to="/contact" className="hover:text-brand transition-colors">Book a Visit</Link></li>
              <li><Link to="/contact" className="hover:text-brand transition-colors">Stores</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-brand transition-colors">Privacy</Link></li>
              <li><Link to="/terms" className="hover:text-brand transition-colors">Terms</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[12px] tracking-[1px] uppercase text-white mb-4 font-bold">Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/contact" className="hover:text-brand transition-colors">Concierge</Link></li>
              <li><Link to="/contact" className="hover:text-brand transition-colors">Track Order</Link></li>
              <li><Link to="/about" className="hover:text-brand transition-colors">Exchange Policy</Link></li>
              <li><Link to="/contact" className="hover:text-brand transition-colors">Size Guide</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="text-[12px] tracking-[1px] uppercase text-white mb-4 font-bold">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2 items-start">
                <Phone size={14} className="text-brand mt-0.5 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex gap-2 items-start">
                <Mail size={14} className="text-brand mt-0.5 flex-shrink-0" />
                <span>hello@lukeejewels.com</span>
              </li>
              <li className="flex gap-2 items-start">
                <MapPin size={14} className="text-brand mt-0.5 flex-shrink-0" />
                <span>Bandra West, Mumbai · Connaught Place, Delhi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
          <div className="flex flex-wrap gap-4 text-[11px] uppercase tracking-wider text-white/40 font-bold">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-brand" /> Certified
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CreditCard size={12} className="text-brand" /> Razorpay Secure
            </span>
            <span>BIS Hallmark Ready</span>
          </div>
          <p className="text-[12px] text-white/35">
            © {new Date().getFullYear()} Lukee Jewels. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
