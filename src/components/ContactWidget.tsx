import React, { useState } from 'react';
import { X, Phone } from 'lucide-react';

const PHONE = '+918153026232';
const PHONE_DISPLAY = '+91 81530 26232';
const WA_LINK = `https://wa.me/${PHONE}?text=Hi%2C%20I%27m%20interested%20in%20Lukee%20Jewels`;
const CALL_LINK = `tel:${PHONE}`;

export const ContactWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-3 select-none">
      {/* Action buttons — revealed when open */}
      <div
        className={`flex flex-col items-end gap-2.5 transition-all duration-300 origin-bottom ${
          open ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-90 pointer-events-none'
        }`}
      >
        {/* WhatsApp */}
        <a
          href={WA_LINK}
          target="_blank"
          rel="noreferrer"
          className="group flex items-center gap-2.5"
          aria-label="Chat on WhatsApp"
        >
          <span className="bg-white text-[#128C7E] text-[12px] font-bold px-3 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.18)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            WhatsApp · {PHONE_DISPLAY}
          </span>
          <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_16px_rgba(37,211,102,0.4)] hover:scale-105 transition-transform">
            {/* WhatsApp SVG icon */}
            <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
        </a>

        {/* Call */}
        <a
          href={CALL_LINK}
          className="group flex items-center gap-2.5"
          aria-label="Call us"
        >
          <span className="bg-white text-ink text-[12px] font-bold px-3 py-1.5 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.18)] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            Call · {PHONE_DISPLAY}
          </span>
          <div className="w-[52px] h-[52px] rounded-full bg-brand flex items-center justify-center shadow-[0_4px_16px_rgba(47,188,204,0.4)] hover:scale-105 transition-transform">
            <Phone size={22} color="white" />
          </div>
        </a>
      </div>

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close contact options' : 'Open contact options'}
        className={`w-[56px] h-[56px] rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-all duration-300 ${
          open ? 'bg-[#333] rotate-45' : 'bg-[#333]'
        }`}
      >
        {open ? (
          <X size={24} color="white" />
        ) : (
          /* Chat/comment icon */
          <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6">
            <path d="M12 2C6.477 2 2 6.263 2 11.5c0 2.388.87 4.57 2.31 6.26L2.5 22l4.57-1.5A10.02 10.02 0 0012 21c5.523 0 10-4.263 10-9.5S17.523 2 12 2zm0 17a8.03 8.03 0 01-3.9-1.01l-.28-.16-2.91.96.79-2.79-.18-.27A8.272 8.272 0 014 11.5C4 7.364 7.582 4 12 4s8 3.364 8 7.5S16.418 19 12 19z"/>
          </svg>
        )}
      </button>
    </div>
  );
};
