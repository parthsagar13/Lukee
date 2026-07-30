import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Star,
  Shield,
  Award,
  Sparkles,
  Gem,
  RefreshCw,
  Truck,
  BadgeCheck,
  Gift,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Product, Category } from '../types.js';
import { ProductCard } from '../components/ProductCard.js';
import { HeroBanner } from '../components/HeroBanner.js';

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const CATEGORY_FALLBACK = [
  {
    name: 'Charming Rings',
    path: '/shop?search=ring',
    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Dreamy Necklaces',
    path: '/shop?search=necklace',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Versatile Earrings',
    path: '/shop?search=earring',
    img: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Stylish Bracelets',
    path: '/shop?search=bracelet',
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Pretty Pendants',
    path: '/shop?search=pendant',
    img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chains of Charm',
    path: '/shop?search=chain',
    img: 'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=800&q=80',
  },
];

const OCCASIONS = [
  {
    title: 'Birthday',
    subtitle: 'Celebrate another year',
    to: '/shop',
    img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Anniversary',
    subtitle: 'Love & togetherness',
    to: '/shop?search=ring',
    img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Festive',
    subtitle: 'Make every festival special',
    to: '/shop?search=gold',
    img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80',
  },
  {
    title: 'Just Because',
    subtitle: 'Spontaneous affection',
    to: '/shop',
    img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80',
  },
];

const TRUST = [
  { icon: BadgeCheck, title: 'Certified Jewellery', text: 'Trusted lab standards & authenticity' },
  { icon: RefreshCw, title: 'Lifetime Exchange', text: 'Exchange anytime for a new design' },
  { icon: Shield, title: 'Secure Checkout', text: 'Razorpay-protected payments' },
  { icon: Truck, title: 'Insured Delivery', text: 'Worldwide fully insured courier' },
];

export const Home: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
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
            .slice(0, 6)
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
      ? categories.slice(0, 6).map((c, i) => ({
          name: c.name,
          path: `/shop?category=${c._id}`,
          img: CATEGORY_FALLBACK[i % CATEGORY_FALLBACK.length].img,
        }))
      : CATEGORY_FALLBACK;

  return (
    <div id="home-page" className="pb-0 bg-[#FAF8F5]">
      {/* 1. Hero — 4 rotating banners */}
      <HeroBanner />

      {/* 2. Trust strip (Candere-style assurance row) */}
      <section className="border-b border-gold-200 bg-white">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {TRUST.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                variants={fadeUp}
                transition={{ duration: 0.5 }}
                className="flex items-start gap-3"
              >
                <Icon size={22} className="text-gold-500 stroke-[1.5] mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-sans text-[0.7rem] uppercase tracking-[0.18em] text-[#1A1A1A] font-semibold">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 font-light">{item.text}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 3. Shop by Category — horizontal image slider */}
      <section className="py-16 md:py-20 space-y-8 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4"
        >
          <div className="space-y-3 text-center sm:text-left">
            <span className="text-[0.7rem] tracking-[0.35em] text-gold-500 uppercase font-medium">
              Shop by Category
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-light">
              So you never run out of options
            </h2>
            <div className="w-14 h-px bg-gold-500 mx-auto sm:mx-0" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => scrollCategories('prev')}
              aria-label="Previous categories"
              className="w-11 h-11 rounded-full border border-gold-300 bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-gold-500 hover:border-gold-500 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => scrollCategories('next')}
              aria-label="Next categories"
              className="w-11 h-11 rounded-full border border-gold-300 bg-white text-[#1A1A1A] flex items-center justify-center hover:bg-gold-500 hover:border-gold-500 hover:text-white transition-colors"
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
              className="group relative flex-shrink-0 w-[70vw] sm:w-[42vw] md:w-[30vw] lg:w-[22rem] aspect-[4/5] overflow-hidden bg-[#F3EEE6] snap-start"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 text-white">
                <h3 className="font-serif text-xl sm:text-2xl font-light tracking-wide drop-shadow-sm">
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

      {/* 4. Editorial split — Collection highlight */}
      <section className="bg-[#11100e] text-white overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[520px]"
          >
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1400&q=80"
              alt="Bridal Collection"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex flex-col justify-center px-6 sm:px-10 lg:px-16 py-14 space-y-6"
          >
            <span className="text-[0.7rem] tracking-[0.35em] text-gold-400 uppercase">
              Collections you&apos;ll love
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-light leading-tight">
              International Flair. <br />
              <span className="italic text-gold-400">Tradition Reimagined.</span>
            </h2>
            <p className="text-sm text-white/65 max-w-md font-light leading-relaxed">
              Explore jewellery made to be gifted, loved, and worn on repeat — from diamond
              solitaires to everyday gold essentials, curated for modern sparkle seekers.
            </p>
            <div className="space-y-3 pt-1">
              {[
                'Certified conflict-free diamonds',
                'Complimentary velvet packaging',
                'Bespoke sizing & engraving available',
              ].map((line) => (
                <div key={line} className="flex items-center gap-3 text-xs text-white/80">
                  <Sparkles size={14} className="text-gold-400 flex-shrink-0" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <Link
                to="/collections"
                className="inline-flex items-center gap-2 bg-gold-500 text-[#1A1A1A] px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.22em] font-semibold hover:bg-white transition-colors"
              >
                Shop Now
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5. Gift occasions */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center space-y-3"
        >
          <span className="text-[0.7rem] tracking-[0.35em] text-gold-500 uppercase font-medium inline-flex items-center justify-center gap-2">
            <Gift size={14} /> Gifts that speak the occasion
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-light">
            Not seeing your moment? There&apos;s a gift for that too.
          </h2>
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
                className="group block relative aspect-square overflow-hidden bg-[#F3EEE6]"
              >
                <img
                  src={o.img}
                  alt={o.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/45 transition-colors" />
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
      </section>

      {/* 6. New Arrivals */}
      <section className="bg-white border-y border-gold-200 py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[0.7rem] tracking-[0.35em] text-gold-500 uppercase font-medium">
                Fresh off the vault
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-light">New Arrivals</h2>
            </div>
            <Link
              to="/shop?newArrival=true"
              className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-[#1A1A1A] font-semibold hover:text-gold-500 transition-colors"
            >
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-400 text-xs tracking-widest uppercase">
              Sifting through vaults…
            </div>
          ) : newArrivals.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs tracking-widest uppercase">
              No new arrivals yet — explore the full shop.
            </div>
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

      {/* 7. Best Sellers */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <span className="text-[0.7rem] tracking-[0.35em] text-gold-500 uppercase font-medium">
              1 Lakh+ real stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light">Best Sellers</h2>
          </div>
          <Link
            to="/shop?bestSeller=true"
            className="inline-flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.22em] text-[#1A1A1A] font-semibold hover:text-gold-500 transition-colors"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12 text-gray-400 text-xs tracking-widest uppercase">
            Opening showcases…
          </div>
        ) : bestSellers.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-xs tracking-widest uppercase">
            Bestsellers will appear here once marked in admin.
          </div>
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
      </section>

      {/* 8. Promo banner strip */}
      <section className="relative overflow-hidden bg-gold-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 text-[#1A1A1A]">
            <p className="text-[0.7rem] uppercase tracking-[0.3em] font-semibold">
              Zero making charges on select diamond jewellery*
            </p>
            <h3 className="font-serif text-2xl sm:text-3xl font-light">
              Extra instant bank offers on checkout
            </h3>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-[#1A1A1A] text-white px-7 py-3.5 text-[0.7rem] uppercase tracking-[0.22em] font-semibold hover:bg-white hover:text-[#1A1A1A] transition-colors"
          >
            Avail Now <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 9. Testimonials */}
      <section className="bg-[#F3EEE6] py-16 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto px-4 text-center space-y-7"
        >
          <span className="text-[0.7rem] tracking-[0.35em] text-gold-600 uppercase font-medium">
            Real stories & real smiles
          </span>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-gold-500 text-gold-500" />
            ))}
          </div>
          <blockquote className="font-serif text-xl sm:text-2xl lg:text-3xl font-light italic leading-relaxed text-[#1A1A1A]">
            &ldquo;The level of micro-pavé craftsmanship at Lukee Jewels is simply unmatched. My
            engagement ring catches light beautifully — the concierge experience felt like a
            private salon.&rdquo;
          </blockquote>
          <div className="space-y-1">
            <cite className="not-italic text-[0.75rem] tracking-[0.25em] uppercase text-gold-600 font-semibold block">
              Helene de Valois
            </cite>
            <span className="text-xs text-gray-500 font-light">Geneva, Switzerland</span>
          </div>
          <div className="pt-4 flex flex-wrap justify-center gap-6 text-gray-500">
            <div className="flex items-center gap-2 text-xs">
              <Award size={16} className="text-gold-500" /> Artisan Craft
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Gem size={16} className="text-gold-500" /> Certified Stones
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Shield size={16} className="text-gold-500" /> Lifetime Care
            </div>
          </div>
        </motion.div>
      </section>

      {/* 10. CTA appointment */}
      <section className="relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1573408301186-67489f88bff3?auto=format&fit=crop&w=1920&q=80"
          alt="Visit boutique"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0f0e0c]/70" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center text-white space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <span className="text-[0.7rem] tracking-[0.35em] text-gold-300 uppercase">
              Discover the magic in person
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light">
              Book a private appointment
            </h2>
            <p className="text-sm text-white/70 max-w-lg mx-auto font-light">
              We prepare your viewing tray in advance — solitaires, bridal stacks, and gold
              essentials — so nothing gets lost in the crowd.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-gold-500 text-[#1A1A1A] px-8 py-3.5 text-[0.7rem] uppercase tracking-[0.22em] font-semibold hover:bg-white transition-colors"
            >
              Book Appointment <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
