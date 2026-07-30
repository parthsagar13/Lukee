import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ShieldAlert } from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';
import { useAdmin } from '../contexts/AdminContext.js';
import type { Category } from '../types.js';

type CategoryNavItem = {
  label: string;
  to: string;
  highlight?: boolean;
};

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  const { toggleCart, getCartCount } = useCart();
  const { isAuthenticated } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
    { label: 'About Us', path: '/about' },
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
      <div
        id="announcement-bar"
        className="bg-[#C5A059] text-white text-center py-2 px-4 text-[10px] tracking-[0.3em] font-sans uppercase font-semibold"
      >
        Complimentary fully insured worldwide delivery & bespoke velvet packaging.
      </div>

      <header
        id="main-header"
        className="sticky top-0 z-40 bg-[#FDFCFB]/95 backdrop-blur-md border-b border-gold-200 luxury-shadow overflow-visible"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-20 py-2 gap-4 overflow-visible">
            <div className="flex items-center gap-4 md:gap-10 min-w-0 overflow-visible flex-1">
              <div className="flex md:hidden flex-shrink-0">
                <button
                  id="mobile-menu-btn"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="text-[#1A1A1A] hover:text-gold-500 transition-colors p-2"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

              <div className="flex-shrink-0 overflow-visible">
                <Link
                  to="/"
                  className="block select-none group overflow-visible"
                  aria-label="Lukee Jewels Home"
                >
                  <img
                    src="/lukee-logo.png"
                    alt="Lukee Jewels"
                    className="h-16 sm:h-[4.5rem] w-auto max-w-[140px] sm:max-w-[160px] object-contain object-left transition-opacity duration-300 group-hover:opacity-90"
                  />
                </Link>
              </div>

              <nav id="desktop-nav" className="hidden lg:flex space-x-7">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-xs tracking-widest uppercase transition-all duration-300 relative py-2 ${
                      isActive(link.path)
                        ? 'text-gold-500 font-bold'
                        : 'text-gray-600 hover:text-gold-500'
                    }`}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold-500" />
                    )}
                  </Link>
                ))}
              </nav>

              {/* Desktop inline search */}
              <form
                onSubmit={handleSearchSubmit}
                className="hidden md:flex flex-1 max-w-md ml-auto items-center border border-gold-200 bg-white px-3 py-2 focus-within:border-gold-500 transition-colors"
              >
                <Search size={16} className="text-gold-500 flex-shrink-0" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search rings, diamonds, gold…"
                  className="w-full ml-2 bg-transparent text-sm font-sans font-light text-[#1A1A1A] placeholder:text-gray-400 focus:outline-none"
                  aria-label="Search products"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-gray-400 hover:text-gray-600 p-0.5"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </form>
            </div>

            <div id="nav-actions" className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <button
                id="search-toggle-btn"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden text-[#1A1A1A] hover:text-gold-500 transition-colors p-2"
                aria-label="Search catalog"
              >
                <Search size={18} />
              </button>

              <Link
                id="admin-shortcut"
                to={isAuthenticated ? '/admin' : '/admin/login'}
                className={`p-2 transition-colors relative ${
                  isAuthenticated
                    ? 'text-emerald-600 hover:text-emerald-700'
                    : 'text-[#1A1A1A] hover:text-gold-500'
                }`}
                title={isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
              >
                <ShieldAlert size={18} />
                {isAuthenticated && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                )}
              </Link>

              <button
                id="cart-toggle-btn"
                onClick={toggleCart}
                className="text-[#1A1A1A] hover:text-gold-500 transition-colors p-2 relative flex items-center"
                aria-label="View shopping cart"
              >
                <ShoppingBag size={18} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold-500 text-white font-sans text-[0.65rem] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category bar */}
        <nav
          id="category-nav-bar"
          className="bg-[#C5A059] border-t border-gold-600/20"
          aria-label="Product categories"
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <ul className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1 sm:py-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {categoryNav.map((item) => {
                const active = isCategoryActive(item);
                return (
                  <li key={item.label} className="flex-shrink-0">
                    <Link
                      to={item.to}
                      className={`block px-2.5 sm:px-3.5 py-1 text-[0.6rem] sm:text-[0.65rem] font-sans font-medium uppercase tracking-[0.12em] whitespace-nowrap transition-colors duration-200 ${
                        item.highlight
                          ? active
                            ? 'text-white'
                            : 'text-[#FFF8E7] hover:text-white'
                          : active
                            ? 'text-white font-semibold'
                            : 'text-[#1A1A1A]/85 hover:text-white'
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
          <div
            id="mobile-menu"
            className="md:hidden border-t border-gold-200 bg-[#FDFCFB] py-4 px-6 space-y-3 shadow-lg"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center border border-gold-200 px-3 py-2 mb-2">
              <Search size={16} className="text-gold-500" />
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
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-xs tracking-widest uppercase py-2 border-b border-gold-100 ${
                  isActive(link.path) ? 'text-gold-500 font-bold' : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <p className="pt-2 text-[0.65rem] uppercase tracking-[0.2em] text-gray-400">
              Categories
            </p>
            {categoryNav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block text-xs tracking-widest uppercase py-1.5 ${
                  item.highlight ? 'text-[#2a9d8f] font-semibold' : 'text-gray-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}

        {isSearchOpen && (
          <div
            id="search-overlay"
            className="md:hidden absolute top-full left-0 w-full bg-[#FDFCFB] border-b border-gold-200 py-4 px-4 shadow-md z-50"
          >
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <input
                id="search-input"
                type="text"
                placeholder="Search rings, diamond necklaces…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full font-sans text-sm tracking-wide bg-transparent border-b border-gold-500 py-2 focus:outline-none text-[#1A1A1A] placeholder-gray-400"
              />
              <button
                type="submit"
                className="bg-[#1A1A1A] text-white px-4 py-2 text-[0.65rem] uppercase tracking-widest hover:bg-gold-500 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </form>
          </div>
        )}
      </header>
    </>
  );
};
