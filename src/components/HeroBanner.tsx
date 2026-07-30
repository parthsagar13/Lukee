import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

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
  align?: 'left' | 'right' | 'center';
}

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'diamond-edit',
    eyebrow: "It's your right to stylish jewellery",
    title: 'Diamond Brilliance',
    accent: 'Redefined',
    description:
      'Discover certified diamonds and fine gold crafted for everyday luxury and lifelong occasions.',
    ctaLabel: 'Shop Diamond Jewellery',
    ctaTo: '/shop?search=diamond',
    secondaryLabel: 'Explore Collections',
    secondaryTo: '/collections',
    image:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1920&q=80',
    align: 'left',
  },
  {
    id: 'gold-edit',
    eyebrow: 'Tradition Reimagined',
    title: 'Aura Gold',
    accent: 'Collection',
    description:
      'Warm 18k gold silhouettes designed for modern rituals — from officewear elegance to festive radiance.',
    ctaLabel: 'Shop Gold',
    ctaTo: '/shop?search=gold',
    secondaryLabel: 'View Shop',
    secondaryTo: '/shop',
    image:
      'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1920&q=80',
    align: 'left',
  },
  {
    id: 'bridal-edit',
    eyebrow: 'Say it with Lukee',
    title: 'Bridal & Solitaire',
    accent: 'Heirlooms',
    description:
      'Engagement rings and bridal sets with GIA-inspired clarity standards and bespoke finishing.',
    ctaLabel: 'Shop Bridal',
    ctaTo: '/shop?search=ring',
    secondaryLabel: 'Book Private Viewing',
    secondaryTo: '/contact',
    image:
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1920&q=80',
    align: 'left',
  },
  {
    id: 'gifting-edit',
    eyebrow: 'Gifts that speak the occasion',
    title: 'Curated for',
    accent: 'the Bold',
    description:
      'Pendants, earrings, and bracelets packed with velvet care — ready for birthdays, anniversaries, and just because.',
    ctaLabel: 'Shop Gifts',
    ctaTo: '/shop',
    secondaryLabel: 'Contact Concierge',
    secondaryTo: '/contact',
    image:
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1920&q=80',
    align: 'left',
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

  const alignClass =
    slide.align === 'center'
      ? 'items-center text-center'
      : slide.align === 'right'
        ? 'items-end text-right'
        : 'items-start text-left';

  return (
    <section
      id="hero-banner"
      className="relative h-[78vh] min-h-[520px] max-h-[820px] overflow-hidden bg-[#0f0e0c]"
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
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 h-full w-full object-cover object-center animate-kenburns"
          />
          <div className="absolute inset-0 hero-overlay" />
        </motion.div>
      </AnimatePresence>

      <div className={`relative z-10 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex ${alignClass}`}>
        <div className="flex flex-col justify-center max-w-xl py-16 space-y-5 text-white">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${slide.id}-copy`}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-5"
            >
              <span className="inline-block text-[0.7rem] sm:text-xs tracking-[0.35em] uppercase text-gold-300 font-medium">
                {slide.eyebrow}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.05] text-white">
                {slide.title}{' '}
                <span className="italic text-gold-400">{slide.accent}</span>
              </h1>
              <p className="font-sans text-sm sm:text-base text-white/75 font-light leading-relaxed max-w-md">
                {slide.description}
              </p>
              <div
                className={`pt-2 flex flex-col sm:flex-row gap-3 ${
                  slide.align === 'center' ? 'sm:justify-center' : ''
                }`}
              >
                <Link
                  to={slide.ctaTo}
                  className="inline-flex items-center justify-center gap-2 bg-gold-500 text-[#1A1A1A] px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.22em] font-semibold hover:bg-white transition-colors duration-300"
                >
                  {slide.ctaLabel}
                  <ArrowRight size={14} />
                </Link>
                {slide.secondaryLabel && slide.secondaryTo && (
                  <Link
                    to={slide.secondaryTo}
                    className="inline-flex items-center justify-center border border-white/40 text-white px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.22em] font-medium hover:bg-white/10 transition-colors duration-300"
                  >
                    {slide.secondaryLabel}
                  </Link>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-6 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1 transition-all duration-500 rounded-full ${
                  i === index ? 'w-10 bg-gold-500' : 'w-4 bg-white/35 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous slide"
              onClick={() => goTo(index - 1)}
              className="w-10 h-10 border border-white/30 text-white/90 hover:bg-white/10 hover:border-gold-400 transition-colors flex items-center justify-center"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next slide"
              onClick={() => goTo(index + 1)}
              className="w-10 h-10 border border-white/30 text-white/90 hover:bg-white/10 hover:border-gold-400 transition-colors flex items-center justify-center"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {!paused && (
          <div
            key={index}
            className="mt-4 h-[2px] w-full max-w-7xl mx-auto bg-white/15 overflow-hidden"
          >
            <div className="h-full bg-gold-500 hero-progress" />
          </div>
        )}
      </div>
    </section>
  );
};
