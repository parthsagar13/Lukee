import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div id="not-found-page" className="max-w-md mx-auto text-center py-32 px-4 space-y-6 font-sans">
      <div className="w-16 h-16 bg-[#F9F6F2] border border-gold-200 text-gold-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
        <HelpCircle size={32} className="stroke-1" />
      </div>
      <h1 className="font-serif text-4xl text-[#1A1A1A] font-semibold">Casting Not Found</h1>
      <p className="text-xs sm:text-sm text-gray-500 leading-relaxed font-light">
        The exclusive jewel design, category slug, or administrative route you requested has been retired from our showcase or vaulted.
      </p>
      <div className="pt-4">
        <Link
          to="/"
          className="inline-flex items-center space-x-2.5 bg-[#1A1A1A] text-white px-6 py-3 text-xs uppercase tracking-widest font-bold hover:bg-gold-500 transition-all rounded-sm"
        >
          <ArrowLeft size={14} />
          <span>Return To Salon Home</span>
        </Link>
      </div>
    </div>
  );
};
