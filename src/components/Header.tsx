import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ShieldAlert,
  Heart,
  User,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';
import { useAdmin } from '../contexts/AdminContext.js';
import type { Category } from '../types.js';
import { CATEGORY_TILES } from '../data/luxuryContent.js';

type CategoryNavItem = {
  label: string;
  to: string;
  highlight?: boolean;
};

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const { toggleCart, getCartCount } = useCart();
  const { isAuthenticated } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setMegaOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        const active = (Array.isArray(data) ? data : [])
          .filter((c: Category) => c.status === 'active')
          .sort(
            (a: Category, b: Category) =>
              (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name)
          );
        setCategories(active);
      } catch (err) {
        console.error('Failed to load header categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    setIsSearchOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop All', path: '/shop' },
    { label: 'Collections', path: '/collections' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const categoryNav: CategoryNavItem[] = [
    { label: 'Bestsellers', to: '/shop?bestSeller=true' },
    { label: 'New Arrivals', to: '/shop?newArrival=true', highlight: true },
    ...categories.slice(0, 8).map((c) => ({
      label: c.name,
      to: `/shop?category=${encodeURIComponent(c.slug)}`,
    })),
    { label: 'Gifts', to: '/shop' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const isCategoryActive = (item: CategoryNavItem) => {
    if (!location.pathname.startsWith('/shop')) return false;
    const q = searchParams.toString();
    const itemQ = item.to.includes('?') ? item.to.split('?')[1] : '';
    if (!itemQ) return !q;
    return q.includes(itemQ);
  };

  return (
    <>
      <div className="bg-brand text-white text-center py-2.5 px-4 text-[11px] tracking-[0.4px] font-sans font-bold">
        Complimentary insured delivery · Lifetime exchange · Certified diamonds
      </div>

      <header
        className={`sticky top-0 z-40 bg-white transition-shadow duration-300 ${
          scrolled ? 'luxury-shadow' : 'border-b border-line'
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[78px] sm:min-h-[88px] gap-4">
            <div className="flex items-center gap-3 lg:gap-8 min-w-0 flex-1">
              <button
                type="button"
                className="lg:hidden p-2.5 text-ink hover:text-brand rounded-lg"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label="Open menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Link to="/" className="flex-shrink-0" aria-label="Lukee Jewels Home">
                <img
                  src="/lukee-logo.png"
                  alt="Lukee Jewels"
                  className="h-[58px] sm:h-[68px] w-auto object-contain"
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative text-[13px] font-bold tracking-[0.3px] transition-colors py-1 ${
                      isActive(link.path) ? 'text-brand' : 'text-ink hover:text-brand'
                    }`}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-brand rounded-full" />
                    )}
                  </Link>
                ))}
                <button
                  type="button"
                  onMouseEnter={() => setMegaOpen(true)}
                  onClick={() => setMegaOpen((v) => !v)}
                  className="inline-flex items-center gap-1 text-[13px] font-bold tracking-[0.3px] text-ink hover:text-brand"
                >
                  Jewellery
                  <ChevronDown size={14} className={`transition-transform ${megaOpen ? 'rotate-180' : ''}`} />
                </button>
              </nav>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-sm items-center border border-line bg-surface rounded-lg px-3 py-2.5 focus-within:border-brand transition-colors"
            >
              <Search size={15} className="text-brand flex-shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rings, diamonds, gold…"
                className="w-full ml-2 bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
                aria-label="Search products"
              />
            </form>

            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2.5 text-ink hover:text-brand rounded-lg"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <Link
                to="/shop"
                className="hidden sm:inline-flex p-2.5 text-ink hover:text-brand rounded-lg"
                aria-label="Wishlist"
              >
                <Heart size={18} />
              </Link>
              <Link
                to={isAuthenticated ? '/admin' : '/admin/login'}
                className={`p-2.5 rounded-lg transition-colors ${
                  isAuthenticated ? 'text-brand-dark' : 'text-ink hover:text-brand'
                }`}
                title={isAuthenticated ? 'Admin' : 'Account'}
              >
                {isAuthenticated ? <ShieldAlert size={18} /> : <User size={18} />}
              </Link>
              <button
                type="button"
                onClick={toggleCart}
                className="relative p-2.5 text-ink hover:text-brand rounded-lg"
                aria-label="Open cart"
              >
                <ShoppingBag size={18} />
                {getCartCount() > 0 && (
                  <span className="absolute top-1 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-brand text-white text-[9px] font-bold flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {megaOpen && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-full bg-white border-t border-line luxury-shadow-lg"
            onMouseLeave={() => setMegaOpen(false)}
          >
            <div className="max-w-[1440px] mx-auto px-8 py-8 grid grid-cols-4 gap-8">
              <div>
                <p className="section-eyebrow mb-4">Shop</p>
                <ul className="space-y-2.5">
                  {categoryNav.slice(0, 6).map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        className="text-sm font-medium text-ink hover:text-brand transition-colors"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-span-3 grid grid-cols-3 gap-4">
                {CATEGORY_TILES.slice(0, 3).map((cat) => (
                  <Link
                    key={cat.name}
                    to={cat.path}
                    className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface"
                  >
                    <img
                      src={cat.img}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent" />
                    <span className="absolute bottom-3 left-3 text-white font-serif text-lg font-semibold">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        <nav className="bg-surface border-t border-line" aria-label="Product categories">
          <div className="max-w-[1440px] mx-auto px-2 sm:px-4">
            <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
              {categoryNav.map((item) => {
                const active = isCategoryActive(item);
                return (
                  <li key={item.label} className="flex-shrink-0">
                    <Link
                      to={item.to}
                      className={`block px-3 py-1.5 text-[12px] font-bold tracking-[0.3px] whitespace-nowrap rounded-full transition-colors ${
                        active
                          ? 'bg-brand text-white'
                          : item.highlight
                            ? 'text-brand hover:bg-brand-soft'
                            : 'text-ink/80 hover:bg-white hover:text-brand'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-line bg-white py-4 px-5 space-y-1 max-h-[70vh] overflow-y-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border border-line rounded-lg px-3 py-2.5 mb-3 bg-surface"
            >
              <Search size={16} className="text-brand" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewellery…"
                className="w-full ml-2 bg-transparent text-sm focus:outline-none"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-3 text-sm font-bold text-ink border-b border-line"
              >
                {link.label}
              </Link>
            ))}
            <p className="pt-3 text-[11px] uppercase tracking-wider text-muted font-bold">Categories</p>
            {categoryNav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={`block text-sm py-2 ${
                  item.highlight ? 'text-brand font-bold' : 'text-muted font-medium'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {isSearchOpen && (
          <div className="md:hidden border-t border-line bg-white py-4 px-4">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search rings, necklaces…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="input-luxury flex-1"
              />
              <button type="submit" className="btn-primary !py-3">
                Search
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
};
