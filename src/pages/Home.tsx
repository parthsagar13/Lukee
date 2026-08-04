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
import { motion } from 'motion/react';
import { Product, Category } from '../types.js';
import { ProductCard } from '../components/ProductCard.js';
import { HeroBanner } from '../components/HeroBanner.js';
import {
  CATEGORY_TILES,
  FEATURED_COLLECTIONS,
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
  const categorySliderRef = useRef<HTMLDivElement>(null);

  const scrollCategories = (dir: 'prev' | 'next') => {
    const el = categorySliderRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
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

      {/* 3. Featured Collections */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="section-eyebrow">Curated edits</p>
            <h2 className="font-serif text-[26px] sm:text-[32px] lg:text-[40px] font-semibold text-ink">
              Featured Collections
            </h2>
            <div className="w-14 h-px bg-brand mx-auto" />
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          >
            {FEATURED_COLLECTIONS.map((col) => (
              <motion.div key={col.title} variants={fadeUp}>
                <Link
                  to={col.to}
                  className="group relative block aspect-[3/4] overflow-hidden bg-white rounded-xl luxury-shadow"
                >
                  <img
                    src={col.img}
                    alt={col.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6 text-white">
                    <h3 className="font-serif text-2xl font-light">{col.title}</h3>
                    <p className="text-[0.65rem] uppercase tracking-[0.2em] text-white/80 mt-1.5">
                      {col.subtitle}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[0.65rem] uppercase tracking-[0.2em] font-medium opacity-90">
                      Explore <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
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

      {/* 12. Instagram gallery */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-3"
          >
            <p className="section-eyebrow inline-flex items-center gap-2 justify-center">
              <Instagram size={14} /> @lukeejewels
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-light">Follow the sparkle</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {INSTAGRAM_POSTS.map((src, i) => (
              <a
                key={src}
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden bg-white rounded-xl"
              >
                <img
                  src={src}
                  alt={`Lukee Instagram look ${i + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition-colors flex items-center justify-center">
                  <Instagram
                    size={22}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  />
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
