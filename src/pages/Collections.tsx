import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import {
  FEATURED_COLLECTIONS,
  OCCASIONS,
  IMAGES,
} from '../data/luxuryContent.js';

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
    description:
      'Bespoke diamonds hand-selected and custom set in platinum and 18k white gold for supreme light dispersion.',
    image: IMAGES.diamond,
    link: '/shop?search=diamond',
  },
  {
    title: 'Aura Gold Edit',
    subtitle: '18k Warmth and Grace',
    description:
      'Sublime, masterfully forged 18k yellow and rose gold chains, necklaces, and bangles radiating traditional elegance.',
    image: IMAGES.gold,
    link: '/shop?search=gold',
  },
  {
    title: 'Bridal & Solitaire Salon',
    subtitle: 'Heirlooms of Love',
    description:
      'Meticulously planned engagement solitaires, wedding bands, and anniversary halo creations built for lifetimes.',
    image: IMAGES.bridal,
    link: '/shop?search=ring',
  },
  {
    title: 'Sterling Minimalist',
    subtitle: '925 Fine Silver Edit',
    description:
      'Elegant architectural pieces fashioned in polished 925 sterling silver for contemporary styling.',
    image: IMAGES.bracelet,
    link: '/shop?search=silver',
  },
  {
    title: 'Everyday Luxe',
    subtitle: 'Wear-everyday elegance',
    description:
      'Refined daily-wear silhouettes designed to move effortlessly from desk to dinner.',
    image: IMAGES.daily,
    link: '/shop?search=gold',
  },
  {
    title: 'Bespoke Pendants & Charms',
    subtitle: 'Graceful Accents',
    description:
      'Delicate floating gemstones, celestial monograms, and custom engraved gold medallions.',
    image: IMAGES.pendant,
    link: '/shop?search=pendant',
  },
];

export const Collections: React.FC = () => {
  return (
    <div id="collections-page" className="bg-white text-ink font-sans">
      {/* Hero */}
      <section className="relative w-full min-h-[52vh] sm:min-h-[60vh] overflow-hidden">
        <img
          src={IMAGES.hero3}
          alt="Lukee curated collections"
          className="absolute inset-0 w-full h-full object-cover animate-kenburns"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative z-10 w-full px-3 sm:px-5 lg:px-6 xl:px-8 min-h-[52vh] sm:min-h-[60vh] flex flex-col justify-end pb-12 sm:pb-16">
          <div className="max-w-2xl space-y-4 animate-fade-up">
            <p className="section-eyebrow !text-brand">Curated Edits</p>
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-light text-white tracking-wide leading-tight">
              Lukee Collections
            </h1>
            <p className="text-sm sm:text-base text-white/80 font-light max-w-lg leading-relaxed">
              Exquisite edits prepared by our boutique directors — aligning material purities with
              visual and thematic inspiration.
            </p>
            <Link to="/shop" className="btn-gold inline-flex mt-2">
              Shop The Salon
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured strip */}
      <section className="w-full px-3 sm:px-5 lg:px-6 xl:px-8 py-12 sm:py-16 space-y-8">
        <div className="text-center space-y-2">
          <p className="section-eyebrow">Signature edits</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">Featured Collections</h2>
          <div className="w-10 h-px bg-brand mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {FEATURED_COLLECTIONS.map((col) => (
            <Link
              key={col.title}
              to={col.to}
              className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-white luxury-shadow"
            >
              <img
                src={col.img}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 space-y-1">
                <p className="text-[0.6rem] tracking-[0.22em] uppercase text-brand font-medium">
                  {col.subtitle}
                </p>
                <h3 className="font-serif text-lg sm:text-xl text-white font-light">{col.title}</h3>
                <span className="inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-widest text-white/80 group-hover:text-brand transition-colors pt-1">
                  Explore
                  <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Full collection grid */}
      <section className="w-full px-3 sm:px-5 lg:px-6 xl:px-8 pb-12 sm:pb-16 space-y-8">
        <div className="text-center space-y-2">
          <p className="section-eyebrow">The full vault</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">Browse by Theme</h2>
          <div className="w-10 h-px bg-brand mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {COLLECTIONS_LIST.map((col) => (
            <article
              key={col.title}
              className="group relative flex flex-col bg-white overflow-hidden border border-line rounded-xl luxury-shadow hover:luxury-shadow-lg transition-all duration-300"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-white">
                <img
                  src={col.image}
                  alt={col.title}
                  className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-ink/5 group-hover:bg-ink/15 transition-colors duration-300" />
              </div>

              <div className="p-6 flex-grow flex flex-col space-y-3 justify-between border-t border-line">
                <div className="space-y-1.5">
                  <span className="section-eyebrow !text-[0.6rem] block">{col.subtitle}</span>
                  <h3 className="font-serif text-xl text-ink group-hover:text-brand-dark transition-colors font-light">
                    {col.title}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed font-light">{col.description}</p>
                </div>

                <div className="pt-4 border-t border-line mt-auto">
                  <Link
                    to={col.link}
                    className="inline-flex items-center text-xs tracking-widest uppercase text-ink font-semibold group-hover:text-brand-dark transition-colors"
                  >
                    <span>Explore Vault</span>
                    <ArrowRight
                      size={12}
                      className="ml-2 group-hover:translate-x-1.5 transition-transform text-brand"
                    />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Occasions strip */}
      <section className="w-full px-3 sm:px-5 lg:px-6 xl:px-8 pb-16 sm:pb-20 space-y-8">
        <div className="text-center space-y-2">
          <p className="section-eyebrow">Gifts that speak</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">Shop by Occasion</h2>
          <div className="w-10 h-px bg-brand mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          {OCCASIONS.map((occ) => (
            <Link
              key={occ.title}
              to={occ.to}
              className="group relative block aspect-square overflow-hidden rounded-xl bg-white luxury-shadow"
            >
              <img
                src={occ.img}
                alt={occ.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 space-y-0.5">
                <h3 className="font-serif text-lg text-white font-light">{occ.title}</h3>
                <p className="text-[0.65rem] text-white/75 font-light">{occ.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
