import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { IMAGES } from '../data/luxuryContent.js';

export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
  image: string;
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'diamond-edit',
    eyebrow: 'Certified brilliance',
    title: 'Diamond',
    accent: 'Redefined',
    description:
      'Discover lab-backed diamonds and fine gold crafted for everyday luxury and lifelong occasions.',
    ctaLabel: 'Shop Diamonds',
    ctaTo: '/shop?search=diamond',
    secondaryLabel: 'Explore Collections',
    secondaryTo: '/collections',
    image: IMAGES.hero1,
  },
  {
    id: 'gold-edit',
    eyebrow: 'Tradition, reimagined',
    title: 'Aura Gold',
    accent: 'Collection',
    description:
      'Warm 18k gold silhouettes designed for modern rituals — from officewear elegance to festive radiance.',
    ctaLabel: 'Shop Gold',
    ctaTo: '/shop?search=gold',
    secondaryLabel: 'View Shop',
    secondaryTo: '/shop',
    image: IMAGES.hero4,
  },
  {
    id: 'bridal-edit',
    eyebrow: 'Say it with Lukee',
    title: 'Bridal &',
    accent: 'Solitaire',
    description:
      'Engagement rings and bridal sets with clarity-first standards and bespoke finishing.',
    ctaLabel: 'Shop Bridal',
    ctaTo: '/shop?search=ring',
    secondaryLabel: 'Book Private Viewing',
    secondaryTo: '/contact',
    image: IMAGES.hero2,
  },
  {
    id: 'gifting-edit',
    eyebrow: 'Gifts that speak',
    title: 'Curated for',
    accent: 'the Bold',
    description:
      'Pendants, earrings, and bracelets packed with velvet care — ready for birthdays and just because.',
    ctaLabel: 'Shop Gifts',
    ctaTo: '/shop',
    secondaryLabel: 'Contact Concierge',
    secondaryTo: '/contact',
    image: IMAGES.hero3,
  },
];

const AUTO_MS = 6000;

export const HeroBanner: React.FC<{ slides?: HeroSlide[] }> = ({
  slides = DEFAULT_SLIDES,
}) => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const slide = slides[index];

  const goTo = useCallback(
    (next: number) => {
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (paused || count <= 1) return;
    const timer = window.setInterval(() => goTo(index + 1), AUTO_MS);
    return () => window.clearInterval(timer);
  }, [index, paused, count, goTo]);

  return (
    <section
      id="hero-banner"
      className="relative h-[68vh] min-h-[440px] max-h-[640px] overflow-hidden bg-dark rounded-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 h-full w-full object-cover object-center animate-kenburns"
          />
          <div className="absolute inset-0 hero-overlay" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full w-full max-w-[1440px] mx-auto px-4 sm:px-8 flex items-center">
        <div className="flex flex-col justify-center max-w-lg py-12 space-y-4 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${slide.id}-copy`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.45 }}
              className="space-y-4"
            >
              <span className="inline-block text-[12px] tracking-[1.2px] uppercase text-brand font-bold">
                {slide.eyebrow}
              </span>
              {/* Restrained hero type per design system */}
              <h1 className="font-serif text-[26px] sm:text-[32px] md:text-[40px] font-semibold leading-[1.25] tracking-[0.15px] text-white">
                {slide.title}{' '}
                <span className="italic font-medium text-brand">{slide.accent}</span>
              </h1>
              <p className="font-sans text-[15px] sm:text-base text-white/75 font-normal leading-relaxed max-w-md">
                {slide.description}
              </p>
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link to={slide.ctaTo} className="btn-primary">
                  {slide.ctaLabel}
                  <ArrowRight size={14} />
                </Link>
                {slide.secondaryLabel && slide.secondaryTo && (
                  <Link to={slide.secondaryTo} className="btn-secondary !bg-white/10 !text-white hover:!bg-brand">
                    {slide.secondaryLabel}
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-5 left-0 right-0 z-20 px-4 sm:px-8">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  i === index ? 'w-8 bg-brand' : 'w-3 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(index - 1)}
              className="w-11 h-11 rounded-full border border-white/30 text-white hover:bg-brand hover:border-brand transition-colors flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goTo(index + 1)}
              className="w-11 h-11 rounded-full border border-white/30 text-white hover:bg-brand hover:border-brand transition-colors flex items-center justify-center"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        {!paused && (
          <div key={index} className="mt-3 h-[2px] w-full max-w-[1440px] mx-auto bg-white/15 overflow-hidden rounded-full">
            <div className="h-full bg-brand hero-progress" />
          </div>
        )}
      </div>
    </section>
  );
};
