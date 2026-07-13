import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, ShieldAlert, Heart } from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';
import { useAdmin } from '../contexts/AdminContext.js';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toggleCart, getCartCount } = useCart();
  const { isAuthenticated } = useAdmin();
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop All', path: '/shop' },
    { label: 'Collections', path: '/collections' },
    { label: 'About Us', path: '/about' },
    { label: 'Contact', path: '/contact' }
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* 1. Announcement Bar */}
      <div id="announcement-bar" className="bg-[#C5A059] text-white text-center py-2 px-4 text-[10px] tracking-[0.3em] font-sans uppercase font-semibold">
        Complimentary fully insured worldwide delivery & bespoke velvet packaging.
      </div>

      {/* 2. Main Navigation Bar */}
      <header id="main-header" className="sticky top-0 z-40 bg-[#FDFCFB]/95 backdrop-blur-md border-b border-gold-200 luxury-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 gap-4">
            
            {/* Left: Brand + Nav */}
            <div className="flex items-center gap-4 md:gap-10 min-w-0">
              {/* Mobile Hamburger Menu Toggle */}
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

              {/* Brand Identity (left-aligned) */}
              <div className="flex-shrink-0">
                <Link to="/" className="flex flex-col items-start select-none group">
                  <span className="font-serif text-2xl sm:text-3xl tracking-[0.25em] font-light text-[#1A1A1A] group-hover:text-gold-500 transition-colors duration-300">
                    LUKEE
                  </span>
                  <span className="font-sans text-[0.65rem] tracking-[0.55em] text-gold-500 uppercase font-light -mt-1">
                    JEWELS
                  </span>
                </Link>
              </div>

              {/* Desktop Nav */}
              <nav id="desktop-nav" className="hidden md:flex space-x-8">
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
                      <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gold-500"></span>
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right Action Icons */}
            <div id="nav-actions" className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              {/* Search Toggle */}
              <button
                id="search-toggle-btn"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-[#1A1A1A] hover:text-gold-500 transition-colors p-2 relative"
                aria-label="Search catalog"
              >
                <Search size={18} />
              </button>

              {/* Secure Admin Portal Shortcut */}
              <Link
                id="admin-shortcut"
                to={isAuthenticated ? '/admin' : '/admin/login'}
                className={`p-2 transition-colors relative ${
                  isAuthenticated ? 'text-emerald-600 hover:text-emerald-700' : 'text-[#1A1A1A] hover:text-gold-500'
                }`}
                title={isAuthenticated ? 'Admin Dashboard' : 'Admin Login'}
              >
                <ShieldAlert size={18} />
                {isAuthenticated && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 border border-white"></span>
                )}
              </Link>

              {/* Shopping Bag with Dynamic Badging */}
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

        {/* 3. Dropdown Mobile Menu */}
        {isMobileMenuOpen && (
          <div id="mobile-menu" className="md:hidden border-t border-gold-200 bg-[#FDFCFB] py-4 px-6 space-y-3 shadow-lg animate-fade-in">
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
          </div>
        )}

        {/* 4. Overlay Search Bar */}
        {isSearchOpen && (
          <div id="search-overlay" className="absolute top-full left-0 w-full bg-[#FDFCFB] border-b border-gold-200 py-4 px-4 sm:px-8 shadow-md transition-all duration-300">
            <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex items-center">
              <input
                id="search-input"
                type="text"
                placeholder="Search rings, diamond necklaces, bracelets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full font-serif text-lg tracking-wide bg-transparent border-b border-gold-500 py-2 focus:outline-none text-[#1A1A1A] placeholder-gray-400"
              />
              <button
                id="search-submit"
                type="submit"
                className="ml-4 bg-[#1A1A1A] text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-white transition-colors duration-300"
              >
                Search
              </button>
              <button
                id="search-close"
                type="button"
                onClick={() => setIsSearchOpen(false)}
                className="ml-4 text-gray-400 hover:text-gray-600"
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
