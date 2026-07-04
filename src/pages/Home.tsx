import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Shield, Award, Sparkles, Gem } from 'lucide-react';
import { Product, Category } from '../types.js';
import { ProductCard } from '../components/ProductCard.js';

export const Home: React.FC = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch active categories
        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        setCategories(catData.filter((c: Category) => c.status === 'active').slice(0, 4));

        // Fetch new arrivals (limit 4)
        const newRes = await fetch('/api/products?newArrival=true&limit=4');
        const newData = await newRes.json();
        setNewArrivals(newData.products || []);

        // Fetch best sellers (limit 4)
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

  return (
    <div id="home-page" className="space-y-20 pb-16">
      
      {/* 1. Large Luxury Hero Banner */}
      <section id="hero-banner" className="relative h-[85vh] bg-[#F9F6F2] overflow-hidden flex items-center">
        {/* Background Overlay Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1920&q=80"
            alt="Luxury Diamond Necklace"
            className="w-full h-full object-cover object-center opacity-30 transform scale-102 transition-transform duration-[10s]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F9F6F2] via-[#F9F6F2]/85 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl space-y-6 text-[#1A1A1A]">
            <span className="text-xs tracking-[0.4em] text-gold-500 uppercase font-semibold block animate-fade-in">
              Bespoke High Jewelry
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-light leading-tight tracking-wide text-[#1A1A1A]">
              Crafting Tomorrow's <br />
              <span className="italic text-gold-500">Heirlooms</span> Today
            </h1>
            <p className="font-sans text-sm sm:text-base text-gray-600 font-light leading-relaxed max-w-lg">
              Indulge in our exquisite collections of masterfully forged diamonds, hand-selected gemstones, and luxury gold. Crafted with an uncompromising standard of brilliance since 2012.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                to="/shop"
                className="bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-gold-500 transition-all duration-300 rounded-sm text-center"
              >
                Explore The Collections
              </Link>
              <Link
                to="/contact"
                className="border border-gold-500 text-gold-500 px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-[#FDFCFB] transition-all duration-300 rounded-sm text-center"
              >
                Book Private Viewing
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom subtle detail */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center text-[0.65rem] tracking-[0.4em] uppercase text-gray-400 font-medium hidden md:block">
          New York &bull; Paris &bull; Geneva
        </div>
      </section>

      {/* 2. Brand Value Pitch: Trust Badges */}
      <section id="trust-banners" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-[#FDFCFB] text-gray-500 border border-gold-200 py-8 px-6 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 rounded-sm luxury-shadow">
          <div className="flex items-center space-x-4">
            <Shield size={28} className="text-gold-500 stroke-1 flex-shrink-0" />
            <div>
              <h4 className="text-xs uppercase tracking-wider text-[#1A1A1A] font-semibold">Conflict-Free Diamonds</h4>
              <p className="text-[0.7rem] text-gray-500 font-light mt-0.5">100% ethically sourced gems matching Kimberley Process rules.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 border-t md:border-t-0 md:border-x border-gold-200 py-6 md:py-0 md:px-8">
            <Award size={28} className="text-gold-500 stroke-1 flex-shrink-0" />
            <div>
              <h4 className="text-xs uppercase tracking-wider text-[#1A1A1A] font-semibold">Bespoke Artisan Craft</h4>
              <p className="text-[0.7rem] text-gray-500 font-light mt-0.5">Every piece individually designed by our master goldsmiths.</p>
            </div>
          </div>
          <div className="flex items-center space-x-4 border-t md:border-t-0 py-6 md:py-0">
            <Gem size={28} className="text-gold-500 stroke-1 flex-shrink-0" />
            <div>
              <h4 className="text-xs uppercase tracking-wider text-[#1A1A1A] font-semibold">Lifetime Guarantee</h4>
              <p className="text-[0.7rem] text-gray-500 font-light mt-0.5">Complimentary annual cleaning, tightening, and valuation certificates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Categories Grid */}
      <section id="featured-categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs tracking-[0.3em] text-gold-500 uppercase font-medium">The Signature Line</span>
          <h2 className="text-3xl sm:text-4xl font-light">Shop by Category</h2>
          <div className="w-12 h-[1px] bg-gold-500 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Static Beautiful Category Cards using royalty free images */}
          {[
            { name: 'Rings', path: '/shop?category=rings', img: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80' },
            { name: 'Necklaces', path: '/shop?category=necklaces', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80' },
            { name: 'Bracelets', path: '/shop?category=bracelets', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80' },
            { name: 'Earrings', path: '/shop?category=earrings', img: 'https://images.unsplash.com/photo-1635767798638-3e25273a8236?auto=format&fit=crop&w=600&q=80' }
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={cat.path}
              className="group relative aspect-[3/4] overflow-hidden bg-[#F9F6F2] flex items-end p-6 border border-gold-200 shadow-xs"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
              <div className="relative z-10 w-full text-center sm:text-left text-white space-y-1">
                <h3 className="font-serif text-xl tracking-wider font-light">{cat.name}</h3>
                <span className="text-[0.65rem] uppercase tracking-widest text-gold-300 font-light flex items-center sm:justify-start justify-center gap-1">
                  View Collection <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Promotional Highlight: Curated Collections Banner */}
      <section id="collection-promo-banner" className="bg-[#F9F6F2] border-y border-gold-200 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video lg:aspect-square bg-[#F9F6F2] overflow-hidden rounded-sm border border-gold-200">
            <img
              src="https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1000&q=80"
              alt="Bespoke Bridal Goldsmithing"
              className="w-full h-full object-cover object-center"
            />
          </div>
          <div className="space-y-6">
            <span className="text-xs tracking-[0.3em] text-gold-500 uppercase font-medium">The Solas Edit</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-light leading-tight">The 2026 Engagement <br /><span className="italic">Bridal Collection</span></h2>
            <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
              Exclusively created for the romantic spirit, the Bridal Collection features meticulously proportioned halos, elegant platinum bands, and exquisite marquise and pear solitaires. Every stone is hand-examined under 10x magnification by our master in-house gemologists.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-xs text-gray-700">
                <Sparkles size={16} className="text-gold-500 flex-shrink-0" />
                <span>Certified GIA conflict-free premium stones</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-gray-700">
                <Sparkles size={16} className="text-gold-500 flex-shrink-0" />
                <span>Complimentary custom initials metal engraving</span>
              </div>
            </div>
            <div className="pt-4">
              <Link
                to="/shop?category=engagement-rings"
                className="inline-flex items-center bg-[#1A1A1A] text-white px-8 py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-gold-500 transition-all duration-300 rounded-sm"
              >
                <span>Shop Bridal Collection</span>
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Showcase */}
      <section id="new-arrivals-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs tracking-[0.3em] text-gold-500 uppercase font-medium">Just Released</span>
          <h2 className="text-3xl sm:text-4xl font-light">The New Arrivals</h2>
          <div className="w-12 h-[1px] bg-gold-500 mx-auto mt-4"></div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-xs">Sifting through vaults...</div>
        ) : newArrivals.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">No active new products currently available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Bestsellers Showcase */}
      <section id="bestsellers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-xs tracking-[0.3em] text-gold-500 uppercase font-medium">Client Favorites</span>
          <h2 className="text-3xl sm:text-4xl font-light">The Best Sellers</h2>
          <div className="w-12 h-[1px] bg-gold-500 mx-auto mt-4"></div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-gray-400 text-xs">Opening showcases...</div>
        ) : bestSellers.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">No active bestseller products currently available.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Client Reviews: Testimonials */}
      <section id="client-testimonials" className="bg-[#F9F6F2] border-t border-b border-gold-200 text-[#1A1A1A] py-20">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
          <span className="text-xs tracking-[0.4em] text-gold-500 uppercase font-semibold block">
            Client Reflections
          </span>
          
          <div className="flex justify-center space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={16} className="fill-gold-500 text-gold-500" />
            ))}
          </div>

          <blockquote className="font-serif text-xl sm:text-2xl font-light italic leading-relaxed text-[#1A1A1A]">
            "The level of micro-pave craftsmanship at Lukee Jewels is simply unmatched. My engagement ring catches light beautifully in any setting, and the custom monogram details are incredibly precise. The concierge service felt like a private Paris saloon."
          </blockquote>

          <div className="space-y-1">
            <cite className="not-italic text-sm tracking-widest uppercase text-gold-500 font-semibold block">
              Helene de Valois
            </cite>
            <span className="text-xs text-gray-500 font-light">Geneva, Switzerland</span>
          </div>
        </div>
      </section>
    </div>
  );
};
