import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  BadgeCheck,
  RefreshCw,
  Shield,
  Truck,
  MapPin,
  Clock,
  Instagram,
  Mail,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Product, Category } from '../types.js';
import { ProductCard } from '../components/ProductCard.js';
import { HeroBanner } from '../components/HeroBanner.js';
import {
  CATEGORY_TILES,
  OCCASIONS,
  TRUST_ITEMS,
  TESTIMONIALS,
  INSTAGRAM_POSTS,
  BLOG_POSTS,
  FAQS,
  STORES,
  IMAGES,
} from '../data/luxuryContent.js';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const TRUST_ICONS = [BadgeCheck, RefreshCw, Shield, Truck] as const;

const HIGHLIGHT_PANELS = [
  {
    title: 'Bridal',
    subtitle: 'Heirlooms for forever moments',
    to: '/shop?search=bridal',
    img: IMAGES.bridal,
  },
  {
    title: 'Daily Wear',
    subtitle: 'Effortless everyday elegance',
    to: '/shop?search=gold',
    img: IMAGES.daily,
  },
  {
    title: 'Festive',
    subtitle: 'Celebrate in radiant gold',
    to: '/shop?search=festive',
    img: IMAGES.festive,
  },
  {
    title: 'Diamond',
    subtitle: 'Certified brilliance',
    to: '/shop?search=diamond',
    img: IMAGES.diamond,
  },
  {
    title: 'Gold',
    subtitle: 'Warm 18k silhouettes',
    to: '/shop?search=gold',
    img: IMAGES.gold,
  },
  {
    title: 'Personalized',
    subtitle: 'Engraved just for you',
    to: '/shop?search=pendant',
    img: IMAGES.personalized,
  },
];

const COLLECTIONS_SHOWCASE = [
  {
    title: 'Aruna',
    subtitle: 'Timeless elegance edit',
    to: '/collections',
    img: '/home/collections/Aruna.webp',
    size: 'small',
  },
  {
    title: 'Evil Eye',
    subtitle: 'Your style must have',
    to: '/collections',
    img: '/home/collections/Evil-Eye.webp',
    size: 'small',
  },
  {
    title: 'Honey Bee',
    subtitle: 'For the women in the hives',
    to: '/collections',
    img: '/home/collections/Honey-Bee.webp',
    size: 'large',
  },
  {
    title: 'Glo',
    subtitle: 'Shine in every season',
    to: '/collections',
    img: '/home/collections/Glo.webp',
    size: 'small',
  },
  {
    title: 'Peacock',
    subtitle: 'A delicate pendant of love',
    to: '/collections',
    img: '/home/collections/Peacock.webp',
    size: 'small',
  },
] as const;

const COLLECTION_SLOT_LAYOUT = [
  { width: 'w-[150px] lg:w-[168px]', height: 'h-[246px] lg:h-[274px]', y: 18, scale: 0.97 },
  { width: 'w-[196px] lg:w-[222px]', height: 'h-[306px] lg:h-[346px]', y: 2, scale: 1 },
  { width: 'w-[246px] lg:w-[278px]', height: 'h-[382px] lg:h-[430px]', y: -10, scale: 1 },
  { width: 'w-[196px] lg:w-[222px]', height: 'h-[306px] lg:h-[346px]', y: 2, scale: 1 },
  { width: 'w-[150px] lg:w-[168px]', height: 'h-[246px] lg:h-[274px]', y: 18, scale: 0.97 },
] as const;

const FEED_SHOWCASE = [
  '/home/feed/01.webp',
  '/home/feed/02.webp',
  '/home/feed/03.webp',
  '/home/feed/04.webp',
  '/home/feed/05.webp',
  '/home/feed/06.webp',
  '/home/feed/07.webp',
  '/home/feed/08.webp',
  '/home/feed/09.webp',
  '/home/feed/10.webp',
  '/home/feed/11.webp',
  '/home/feed/12.webp',
] as const;

const FEED_SLOT_LAYOUT = [
  { width: 'w-[208px] lg:w-[240px]', y: 8, rotate: -1.5 },
  { width: 'w-[208px] lg:w-[240px]', y: 44, rotate: 0 },
  { width: 'w-[222px] lg:w-[256px]', y: 0, rotate: -1 },
  { width: 'w-[208px] lg:w-[240px]', y: 40, rotate: 0.5 },
  { width: 'w-[208px] lg:w-[240px]', y: 8, rotate: 0 },
] as const;

const ProductSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-3">
    <div className="aspect-[4/5] bg-line/60 rounded-xl" />
    <div className="h-3 w-2/3 bg-line/60 rounded" />
    <div className="h-3 w-1/3 bg-line/40 rounded" />
  </div>
);

export const Home: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [activeCollection, setActiveCollection] = useState(3);
  const [collectionDirection, setCollectionDirection] = useState<1 | -1>(1);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);
  const [activeFeed, setActiveFeed] = useState(2);
  const [feedDirection, setFeedDirection] = useState<1 | -1>(1);
  const [feedSwipeStartX, setFeedSwipeStartX] = useState<number | null>(null);
  const categorySliderRef = useRef<HTMLDivElement>(null);
  const collectionsSliderRef = useRef<HTMLDivElement>(null);
  const collectionItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const feedItemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const scrollCategories = (dir: 'prev' | 'next') => {
    const el = categorySliderRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
  };

  const scrollCollections = (dir: 'prev' | 'next') => {
    setCollectionDirection(dir === 'next' ? 1 : -1);
    setActiveCollection((prev) => {
      const next =
        dir === 'next'
          ? (prev + 1) % COLLECTIONS_SHOWCASE.length
          : (prev - 1 + COLLECTIONS_SHOWCASE.length) % COLLECTIONS_SHOWCASE.length;

      collectionItemRefs.current[next]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });

      return next;
    });
  };

  const handleCollectionSwipeStart = (clientX: number) => {
    setSwipeStartX(clientX);
  };

  const handleCollectionSwipeEnd = (clientX: number) => {
    if (swipeStartX === null) return;
    const delta = clientX - swipeStartX;
    if (Math.abs(delta) > 50) {
      scrollCollections(delta < 0 ? 'next' : 'prev');
    }
    setSwipeStartX(null);
  };

  const scrollFeed = (dir: 'prev' | 'next') => {
    setFeedDirection(dir === 'next' ? 1 : -1);
    setActiveFeed((prev) => {
      const next =
        dir === 'next'
          ? (prev + 1) % FEED_SHOWCASE.length
          : (prev - 1 + FEED_SHOWCASE.length) % FEED_SHOWCASE.length;

      feedItemRefs.current[next]?.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      });

      return next;
    });
  };

  const handleFeedSwipeStart = (clientX: number) => {
    setFeedSwipeStartX(clientX);
  };

  const handleFeedSwipeEnd = (clientX: number) => {
    if (feedSwipeStartX === null) return;
    const delta = clientX - feedSwipeStartX;
    if (Math.abs(delta) > 50) {
      scrollFeed(delta < 0 ? 'next' : 'prev');
    }
    setFeedSwipeStartX(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        setCategories(
          (Array.isArray(catData) ? catData : [])
            .filter((c: Category) => c.status === 'active')
            .slice(0, 8)
        );

        const newRes = await fetch('/api/products?newArrival=true&limit=4');
        const newData = await newRes.json();
        setNewArrivals(newData.products || []);

        const bestRes = await fetch('/api/products?bestSeller=true&limit=4');
        const bestData = await bestRes.json();
        setBestSellers(bestData.products || []);
      } catch (err) {
        console.error('Error fetching landing page inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFeedDirection(1);
      setActiveFeed((prev) => (prev + 1) % FEED_SHOWCASE.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, []);

  const categoryCards =
    categories.length >= 4
      ? categories.slice(0, 8).map((c, i) => ({
          name: c.name,
          path: `/shop?category=${c._id}`,
          img: CATEGORY_TILES[i % CATEGORY_TILES.length].img,
        }))
      : CATEGORY_TILES;

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setNewsletterDone(true);
    setEmail('');
  };

  return (
    <div id="home-page" className="pb-0 bg-white text-ink font-sans">
      {/* 1. Hero */}
      <HeroBanner />

      {/* 2. Trust strip */}
      <section className="border-b border-line bg-white">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
        >
          {TRUST_ITEMS.map((item, i) => {
            const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <Icon size={22} className="text-brand stroke-[1.5] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-sans text-[0.7rem] uppercase tracking-[0.18em] text-ink font-semibold">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted mt-1 font-light leading-relaxed">{item.text}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 3. Collections You'll Love */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{
          background:
            'radial-gradient(circle at center, rgba(12,38,69,0.52) 0%, rgba(5,13,25,0.96) 28%, rgba(1,6,14,1) 58%, rgba(1,4,10,1) 100%)',
        }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute left-1/2 top-[46%] h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#295c8f]/20 blur-3xl" />
          <div className="absolute left-1/2 top-[46%] h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/10 blur-3xl" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-2"
          >
            <h2 className="font-sans text-white text-[28px] sm:text-[34px] lg:text-[40px] font-bold tracking-[-0.02em]">
              Collections You'll Love
            </h2>
            <p className="mx-auto max-w-xl text-[12px] sm:text-[13px] text-white/80">
              Let's take a glimpse at our featured collections before diving in!
            </p>
          </motion.div>

          <div
            className="hidden md:flex items-end justify-center min-h-[500px] overflow-hidden"
            onTouchStart={(e) => handleCollectionSwipeStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleCollectionSwipeEnd(e.changedTouches[0].clientX)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeCollection}
                initial={{ opacity: 0, x: collectionDirection > 0 ? 90 : -90 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: collectionDirection > 0 ? -90 : 90 }}
                transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-end justify-center gap-[10px]"
              >
                {[-2, -1, 0, 1, 2].map((offset, slotIndex) => {
                  const index =
                    (activeCollection + offset + COLLECTIONS_SHOWCASE.length) %
                    COLLECTIONS_SHOWCASE.length;
                  const col = COLLECTIONS_SHOWCASE[index];
                  const slot = COLLECTION_SLOT_LAYOUT[slotIndex];

                  return (
                    <motion.div
                      key={`${col.title}-${offset}`}
                      animate={{
                        opacity: slotIndex === 2 ? 1 : slotIndex === 1 || slotIndex === 3 ? 0.98 : 0.94,
                        y: slot.y,
                        scale: slot.scale,
                      }}
                      transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link
                        to={col.to}
                        className={`group relative flex items-center justify-center overflow-hidden rounded-[10px] bg-[#091321] shadow-[0_0_20px_rgba(0,0,0,0.32)] transition-all duration-500 ${slot.width} ${slot.height}`}
                      >
                        <img
                          src={col.img}
                          alt={col.title}
                          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
                        />
                      </Link>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <motion.div
            ref={collectionsSliderRef}
            className="flex md:hidden items-end justify-start gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory px-1 py-2"
            onTouchStart={(e) => handleCollectionSwipeStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleCollectionSwipeEnd(e.changedTouches[0].clientX)}
          >
            {COLLECTIONS_SHOWCASE.map((col, index) => (
              <motion.div
                key={col.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className={`snap-center flex-shrink-0 ${
                  col.size === 'large'
                    ? 'w-[72vw] min-w-[280px] max-w-[360px] sm:w-[300px] md:w-[340px]'
                    : 'w-[52vw] min-w-[200px] max-w-[250px] sm:w-[220px] md:w-[250px]'
                }`}
              >
                <Link
                  ref={(el) => {
                    collectionItemRefs.current[index] = el;
                  }}
                  to={col.to}
                  className={`group relative flex items-center justify-center overflow-hidden rounded-[10px] bg-[#0a1626] shadow-[0_0_20px_rgba(0,0,0,0.28)] ${
                    col.size === 'large'
                      ? 'w-[66vw] min-w-[240px] aspect-[0.74]'
                      : 'w-[44vw] min-w-[165px] aspect-[0.74]'
                  }`}
                >
                  <img
                    src={col.img}
                    alt={col.title}
                    className="h-full w-full object-contain object-center transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <div className="flex items-center justify-center gap-10 pt-2">
            <button
              type="button"
              onClick={() => scrollCollections('prev')}
              aria-label="Previous collection"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/65 text-white transition hover:border-white hover:bg-white/10"
            >
              <ChevronLeft size={18} />
            </button>

            <Link
              to="/collections"
              className="inline-flex min-w-[150px] items-center justify-center rounded-full border border-[#62e5ff]/60 bg-[#111111] px-7 py-3 text-[13px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_0_18px_rgba(47,188,204,0.45)] transition hover:bg-[#1a1a1a]"
            >
              Shop Now!
            </Link>

            <button
              type="button"
              onClick={() => scrollCollections('next')}
              aria-label="Next collection"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/65 text-white transition hover:border-white hover:bg-white/10"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* 4. Shop by Category — horizontal slider */}
      <section className="py-16 md:py-24 bg-white border-y border-line overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
        >
          <div className="space-y-3 text-center sm:text-left">
            <p className="section-eyebrow">Shop by Category</p>
            <h2 className="font-serif text-[26px] sm:text-[32px] lg:text-[40px] font-light">
              Find your next sparkle
            </h2>
            <div className="w-14 h-px bg-brand mx-auto sm:mx-0" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => scrollCategories('prev')}
              aria-label="Previous categories"
              className="w-11 h-11 rounded-full border border-line bg-white text-ink flex items-center justify-center hover:bg-brand hover:border-brand transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollCategories('next')}
              aria-label="Next categories"
              className="w-11 h-11 rounded-full border border-line bg-white text-ink flex items-center justify-center hover:bg-brand hover:border-brand transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>

        <div
          ref={categorySliderRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 sm:px-6 lg:px-[max(1.5rem,calc((100vw-80rem)/2+1.5rem))] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categoryCards.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              className="group relative flex-shrink-0 w-[70vw] sm:w-[42vw] md:w-[30vw] lg:w-[22rem] aspect-[4/5] overflow-hidden bg-white snap-start rounded-xl"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white">
                <h3 className="font-serif text-xl sm:text-2xl font-light tracking-wide">
                  {cat.name}
                </h3>
                <span className="mt-2 inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.22em] text-white/90 font-medium">
                  Explore
                  <ArrowRight
                    size={12}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. New Arrivals */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="section-eyebrow">Fresh from the vault</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-light">New Arrivals</h2>
            </div>
            <Link
              to="/shop?newArrival=true"
              className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-ink font-semibold hover:text-brand-dark transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : newArrivals.length === 0 ? (
            <p className="text-center py-12 text-muted text-xs tracking-widest uppercase">
              No new arrivals yet — explore the full shop.
            </p>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {newArrivals.map((prod) => (
                <motion.div key={prod._id} variants={fadeUp}>
                  <ProductCard product={prod} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 6. Best Sellers */}
      <section className="py-16 md:py-24 bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="section-eyebrow">Loved by thousands</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-light">Best Sellers</h2>
            </div>
            <Link
              to="/shop?bestSeller=true"
              className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-ink font-semibold hover:text-brand-dark transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[0, 1, 2, 3].map((i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : bestSellers.length === 0 ? (
            <p className="text-center py-12 text-muted text-xs tracking-widest uppercase">
              Bestsellers will appear here once marked in admin.
            </p>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {bestSellers.map((prod) => (
                <motion.div key={prod._id} variants={fadeUp}>
                  <ProductCard product={prod} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* 7. Promotional full-bleed banner */}
      <section className="relative overflow-hidden min-h-[420px] md:min-h-[520px] flex items-center">
        <img
          src={IMAGES.promo}
          alt="Lukee promotional offer"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-xl space-y-5 text-white"
          >
            <p className="section-eyebrow !text-brand">Limited season offer</p>
            <h2 className="font-serif text-[26px] sm:text-[32px] lg:text-[40px] font-light leading-tight">
              Zero making charges on select diamond jewellery*
            </h2>
            <p className="text-sm text-white/75 font-light leading-relaxed">
              Extra instant bank offers at checkout. Crafted pieces from ₹12,999 — fully insured
              delivery across India.
            </p>
            <Link to="/shop?search=diamond" className="btn-gold inline-flex">
              Shop the Offer <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 8. Collection highlight panels */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="section-eyebrow">Explore by mood</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">Collection Highlights</h2>
            <div className="w-14 h-px bg-brand mx-auto" />
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-5"
          >
            {HIGHLIGHT_PANELS.map((panel) => (
              <motion.div key={panel.title} variants={fadeUp}>
                <Link
                  to={panel.to}
                  className="group relative block aspect-[4/5] sm:aspect-[5/4] overflow-hidden bg-white rounded-xl"
                >
                  <img
                    src={panel.img}
                    alt={panel.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink/40 group-hover:bg-ink/50 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                    <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-light">
                      {panel.title}
                    </h3>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/80 mt-2 hidden sm:block">
                      {panel.subtitle}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 9. Gifts by Occasion */}
      <section className="py-16 md:py-24 bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="section-eyebrow">Gifts that speak</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">
              Shop by Occasion
            </h2>
            <p className="text-sm text-muted font-light max-w-md mx-auto">
              Not seeing your moment? There&apos;s a gift for that too — starting from ₹4,999.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
          >
            {OCCASIONS.map((o) => (
              <motion.div key={o.title} variants={fadeUp}>
                <Link
                  to={o.to}
                  className="group block relative aspect-square overflow-hidden bg-white rounded-xl"
                >
                  <img
                    src={o.img}
                    alt={o.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-ink/35 group-hover:bg-ink/45 transition-colors" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
                    <h3 className="font-serif text-2xl font-light">{o.title}</h3>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/80 mt-2">
                      {o.subtitle}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 10. Why Choose Us / Brand Story */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-auto lg:min-h-[520px] overflow-hidden luxury-shadow"
            >
              <img
                src={IMAGES.story}
                alt="Lukee brand atelier"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="space-y-6"
            >
              <p className="section-eyebrow">Our story</p>
              <h2 className="font-serif text-[26px] sm:text-[32px] lg:text-[40px] font-light leading-tight">
                Why choose{' '}
                <span className="italic text-brand-dark">Lukee Jewels</span>
              </h2>
              <p className="text-sm text-muted font-light leading-relaxed max-w-md">
                Born from a love of luminous craftsmanship, Lukee blends certified diamonds and fine
                gold with modern silhouettes. Every piece is designed to be gifted, worn daily, and
                passed on — with concierge care from selection to lifetime exchange.
              </p>
              <ul className="space-y-3 text-sm text-ink/80">
                {[
                  'Conflict-free, lab-backed diamonds',
                  'Complimentary velvet packaging on every order',
                  'Bespoke sizing & engraving available',
                  'Lifetime exchange toward a new design',
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <BadgeCheck size={16} className="text-brand mt-0.5 flex-shrink-0" />
                    <span className="font-light">{line}</span>
                  </li>
                ))}
              </ul>
              <Link to="/about" className="btn-primary inline-flex">
                Read Our Story <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 11. Customer Testimonials */}
      <section className="py-16 md:py-24 bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="section-eyebrow">Real stories & smiles</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">
              What our clients say
            </h2>
            <div className="w-14 h-px bg-brand mx-auto" />
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {TESTIMONIALS.map((t) => (
              <motion.blockquote
                key={t.name}
                variants={fadeUp}
                className="bg-white border border-line p-6 rounded-xl luxury-shadow flex flex-col gap-4"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="fill-brand text-brand" />
                  ))}
                </div>
                <p className="text-sm text-ink/80 font-light leading-relaxed flex-1">
                  &ldquo;{t.text}&rdquo;
                </p>
                <footer className="flex items-center gap-3 pt-2 border-t border-line">
                  <img
                    src={t.avatar}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <cite className="not-italic text-sm font-medium text-ink block">{t.name}</cite>
                    <span className="text-xs text-muted">{t.city}</span>
                  </div>
                </footer>
              </motion.blockquote>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 12. Fresh Off the Feed */}
      <section className="bg-black py-18 md:py-20 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="font-sans text-white text-[30px] sm:text-[42px] lg:text-[52px] font-bold">
              Fresh Off the Feed
            </h2>
          </motion.div>

          <div
            className="hidden md:flex items-start justify-center min-h-[560px] overflow-hidden"
            onTouchStart={(e) => handleFeedSwipeStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleFeedSwipeEnd(e.changedTouches[0].clientX)}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeFeed}
                initial={{ opacity: 0, x: feedDirection > 0 ? 90 : -90 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: feedDirection > 0 ? -90 : 90 }}
                transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-start justify-center gap-[10px] lg:gap-[14px]"
              >
                {[-2, -1, 0, 1, 2].map((offset, slotIndex) => {
                  const index = (activeFeed + offset + FEED_SHOWCASE.length) % FEED_SHOWCASE.length;
                  const src = FEED_SHOWCASE[index];
                  const slot = FEED_SLOT_LAYOUT[slotIndex];

                  return (
                    <motion.a
                      key={`${src}-${offset}`}
                      href="https://instagram.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      animate={{
                        y: slot.y,
                        rotate: slot.rotate,
                        opacity: slotIndex === 2 ? 1 : 0.98,
                      }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className={`${slot.width} flex-shrink-0`}
                    >
                      <div className="rounded-[8px] bg-white p-[10px] shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                        <div className="rounded-[6px] bg-white">
                          <img
                            src={src}
                            alt={`Feed slide ${index + 1}`}
                            className="block w-full h-auto object-contain"
                          />
                        </div>
                      </div>
                    </motion.a>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            className="flex md:hidden gap-3 overflow-x-auto scrollbar-none snap-x snap-mandatory px-1 py-2"
            onTouchStart={(e) => handleFeedSwipeStart(e.touches[0].clientX)}
            onTouchEnd={(e) => handleFeedSwipeEnd(e.changedTouches[0].clientX)}
          >
            {FEED_SHOWCASE.map((src, index) => (
              <a
                key={src}
                ref={(el) => {
                  feedItemRefs.current[index] = el;
                }}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="snap-center w-[86vw] min-w-[340px] max-w-[420px] flex-shrink-0"
              >
                <div className="rounded-[8px] bg-white p-[10px] shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
                  <div className="rounded-[6px] bg-white">
                    <img src={src} alt={`Feed slide ${index + 1}`} className="block w-full h-auto object-contain" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 13. Latest Blogs */}
      <section className="py-16 md:py-24 bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <p className="section-eyebrow">Journal</p>
              <h2 className="font-serif text-3xl sm:text-4xl font-light">Latest from Lukee</h2>
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-ink font-semibold hover:text-brand-dark transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
          >
            {BLOG_POSTS.map((post) => (
              <motion.article key={post.title} variants={fadeUp}>
                <Link to={post.to} className="group block space-y-4">
                  <div className="relative aspect-[16/10] overflow-hidden bg-white rounded-xl">
                    <img
                      src={post.img}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2">
                    <time className="text-[0.65rem] uppercase tracking-[0.2em] text-brand-dark">
                      {post.date}
                    </time>
                    <h3 className="font-serif text-xl font-semibold text-ink group-hover:text-brand-dark transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted font-light leading-relaxed">{post.excerpt}</p>
                  </div>
                </Link>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 14. FAQ accordion */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="section-eyebrow">Helpful answers</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">
              Frequently asked questions
            </h2>
          </motion.div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div key={faq.q} className="border border-line bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-sans text-sm font-medium text-ink">{faq.q}</span>
                    <ChevronDown
                      size={18}
                      className={`text-brand flex-shrink-0 transition-transform duration-300 ${
                        open ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div
                    className={`grid transition-[grid-template-rows] duration-300 ${
                      open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 pb-4 text-sm text-muted font-light leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 15. Store Highlights */}
      <section className="py-16 md:py-24 bg-white border-y border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="section-eyebrow">Visit us</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">Store Highlights</h2>
            <p className="text-sm text-muted font-light">
              Book a private viewing — trays prepared ahead of your visit.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8"
          >
            {STORES.map((store) => (
              <motion.div
                key={store.name}
                variants={fadeUp}
                className="group grid sm:grid-cols-2 overflow-hidden border border-line luxury-shadow bg-white"
              >
                <div className="relative aspect-[4/3] sm:aspect-auto sm:min-h-[260px] overflow-hidden">
                  <img
                    src={store.img}
                    alt={store.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8 space-y-4">
                  <h3 className="font-serif text-2xl font-light">{store.name}</h3>
                  <div className="space-y-2 text-sm text-muted font-light">
                    <p className="flex items-start gap-2">
                      <MapPin size={15} className="text-brand mt-0.5 flex-shrink-0" />
                      {store.address}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock size={15} className="text-brand flex-shrink-0" />
                      {store.hours}
                    </p>
                  </div>
                  <Link to="/contact" className="btn-secondary !px-5 !py-2.5 self-start">
                    Book Visit <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* 16. Newsletter CTA band */}
      <section className="py-16 md:py-20 bg-ink text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <Mail size={28} className="mx-auto text-brand" />
          <p className="section-eyebrow !text-brand">Stay in the know</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-light">
            Join the Lukee circle
          </h2>
          <p className="text-sm text-white/65 font-light max-w-md mx-auto">
            Early access to drops, private salon invites, and styling notes — straight to your
            inbox.
          </p>
          {newsletterDone ? (
            <p className="text-sm text-brand tracking-wide">
              Thank you — you&apos;re on the list.
            </p>
          ) : (
            <form
              onSubmit={handleNewsletter}
              className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto pt-2"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 bg-white/10 border border-white/20 px-4 py-3.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand"
              />
              <button type="submit" className="btn-gold whitespace-nowrap">
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

      {/* 17. Final shop CTA */}
      <section className="relative overflow-hidden min-h-[360px] md:min-h-[420px] flex items-center">
        <img
          src={IMAGES.hero2}
          alt="Shop Lukee Jewels"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/65" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 w-full text-center text-white space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="section-eyebrow !text-brand">Ready when you are</p>
            <h2 className="font-serif text-3xl sm:text-5xl font-light">
              Discover jewellery made to be worn forever
            </h2>
            <p className="text-sm text-white/70 max-w-lg mx-auto font-light">
              Browse certified diamonds, fine gold, and gift-ready edits — free insured shipping
              on orders above ₹2,500.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link to="/shop" className="btn-gold">
                Shop All <ArrowRight size={14} />
              </Link>
              <Link
                to="/collections"
                className="inline-flex items-center justify-center gap-2 border border-white/40 text-white px-7 py-3.5 text-[0.7rem] font-semibold uppercase tracking-[0.2em] hover:bg-white hover:text-ink transition-colors"
              >
                View Collections
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
