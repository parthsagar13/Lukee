import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { IMAGES } from '../data/luxuryContent.js';

export const NotFound: React.FC = () => {
  return (
    <div id="not-found-page" className="text-ivory min-h-[70vh] flex items-center">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative aspect-[4/5] sm:aspect-square lg:aspect-[4/5] overflow-hidden luxury-shadow order-2 lg:order-1">
            <img
              src={IMAGES.necklace}
              alt="Fine jewellery"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/50 to-transparent" />
          </div>

          <div className="space-y-6 text-center lg:text-left order-1 lg:order-2">
            <p className="section-eyebrow">Error 404</p>
            <h1 className="font-serif text-4xl sm:text-5xl font-light text-ink">
              Piece Not Found
            </h1>
            <div className="w-14 h-px bg-brand mx-auto lg:mx-0" />
            <p className="text-sm text-muted leading-relaxed max-w-md mx-auto lg:mx-0">
              The jewel design, category, or page you requested has been retired from our showcase —
              or may never have existed in this vault.
            </p>
            <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
              <Link to="/" className="btn-primary">
                <ArrowLeft size={14} />
                Return Home
              </Link>
              <Link to="/shop" className="btn-secondary">
                Shop Collection
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
