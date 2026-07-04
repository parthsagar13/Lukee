import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface CollectionItem {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
}

const COLLECTIONS_LIST: CollectionItem[] = [
  {
    title: 'The Diamond Vault',
    subtitle: 'Brilliance Redefined',
    description: 'Bespoke diamonds hand-selected and custom set in platinum and 18k white gold for supreme light dispersion.',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=diamond-collection'
  },
  {
    title: 'Aura Gold Edit',
    subtitle: '18k Warmth and Grace',
    description: 'Sublime, masterfully forged 18k yellow and rose gold chains, necklaces, and bangles radiating traditional elegance.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=gold-collection'
  },
  {
    title: 'Bridal & Solitaire Salon',
    subtitle: 'Heirlooms of Love',
    description: 'Meticulously planned engagement solitaires, wedding bands, and anniversary halo creations built for lifetimes.',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=bridal-collection'
  },
  {
    title: 'Sterling Minimalist',
    subtitle: '925 Fine Silver Edit',
    description: 'Elegant architectural pieces fashioned in polished 925 sterling silver for contemporary styling.',
    image: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=silver-collection'
  },
  {
    title: 'Modern Gentleman',
    subtitle: 'Structure & Strength',
    description: 'Premium brushed gold wedding bands, structured signet rings, and heavy curb link chains for him.',
    image: 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=men-collection'
  },
  {
    title: 'Bespoke Pendants & Charms',
    subtitle: 'Graceful Accents',
    description: 'Delicate floating gemstones, celestial star sign monograms, and custom engraved gold medallions.',
    image: 'https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=800&q=80',
    link: '/shop?category=pendants'
  }
];

export const Collections: React.FC = () => {
  return (
    <div id="collections-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans space-y-16">
      {/* Header */}
      <div className="border-b border-gold-200 pb-8 text-center space-y-3">
        <span className="text-xs tracking-[0.3em] text-gold-500 uppercase font-semibold">Curated Edits</span>
        <h1 className="text-3xl sm:text-5xl font-light tracking-wide text-[#1A1A1A] font-serif">Lukee Curated Collections</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-light max-w-xl mx-auto leading-relaxed">
          Exquisite edits prepared by our boutique directors, aligning material purities with specific visual and thematic inspirations.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {COLLECTIONS_LIST.map((col, idx) => (
          <div
            key={idx}
            className="group relative flex flex-col bg-[#FDFCFB] overflow-hidden border border-gold-200 luxury-shadow hover:shadow-lg transition-all duration-300"
          >
            {/* Image banner */}
            <div className="relative aspect-[4/3] overflow-hidden bg-[#F9F6F2]">
              <img
                src={col.image}
                alt={col.title}
                className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
            </div>

            {/* Info pane */}
            <div className="p-6 flex-grow flex flex-col space-y-3 justify-between bg-[#FDFCFB] border-t border-gold-200">
              <div className="space-y-1.5">
                <span className="text-[0.6rem] tracking-[0.25em] text-gold-500 uppercase font-semibold block">
                  {col.subtitle}
                </span>
                <h3 className="font-serif text-xl text-[#1A1A1A] group-hover:text-gold-500 transition-colors font-medium">
                  {col.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed font-light">
                  {col.description}
                </p>
              </div>

              <div className="pt-4 border-t border-gold-200 mt-auto">
                <Link
                  to={col.link}
                  className="inline-flex items-center text-xs tracking-widest uppercase text-[#1A1A1A] font-bold group-hover:text-gold-500 transition-colors"
                >
                  <span>Explore Vault</span>
                  <ArrowRight size={12} className="ml-2 group-hover:translate-x-1.5 transition-transform text-gold-500" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
