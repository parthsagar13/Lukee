import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import type { Category, SubCategory, SubCategoryGroup } from '../types.js';
import { CATEGORY_TILES } from '../data/luxuryContent.js';
import { MEGA_MENU_GROUP_ORDER, SUBCATEGORY_GROUP_LABELS } from '../subcategorySpec.js';

const MEGA_CATEGORY_SLUGS = new Set([
  'rings',
  'earrings',
  'necklaces',
  'bangles-bracelets',
  'solitaires',
  'mangalsutras-pendants',
  'other-jewellery',
]);

type CategoryNavItem = {
  key: string;
  label: string;
  to: string;
  highlight?: boolean;
  categoryId?: string;
  category?: Category;
};

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [jewelleryOpen, setJewelleryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<SubCategory[]>([]);
  const [hoveredNavKey, setHoveredNavKey] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const closeTimer = useRef<number | null>(null);

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
    setJewelleryOpen(false);
    setIsSearchOpen(false);
    setHoveredNavKey(null);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const loadNav = async () => {
      try {
        const [catRes, subRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/subcategories'),
        ]);
        const catData = await catRes.json();
        const subData = await subRes.json();
        const active = (Array.isArray(catData) ? catData : [])
          .filter((c: Category) => c.status === 'active')
          .sort(
            (a: Category, b: Category) =>
              (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name)
          );
        setCategories(active);
        setSubcategories(
          (Array.isArray(subData) ? subData : []).filter((s: SubCategory) => s.status === 'active')
        );
      } catch (err) {
        console.error('Failed to load header navigation:', err);
      }
    };
    loadNav();
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

  const categoryNav: CategoryNavItem[] = useMemo(() => {
    const megaCats = categories.filter((c) => MEGA_CATEGORY_SLUGS.has(c.slug));
    const fallbackCats = categories.filter((c) => !MEGA_CATEGORY_SLUGS.has(c.slug)).slice(0, 6);
    const main = (megaCats.length > 0 ? megaCats : fallbackCats).map((c) => ({
      key: c._id,
      label: c.name,
      to: `/shop?category=${encodeURIComponent(c.slug)}`,
      categoryId: c._id,
      category: c,
    }));

    return [
      { key: 'bestsellers', label: 'Bestsellers', to: '/shop?bestSeller=true' },
      { key: 'new-arrivals', label: 'New Arrivals', to: '/shop?newArrival=true', highlight: true },
      ...main,
      { key: 'gifts', label: 'Gifts', to: '/shop' },
    ];
  }, [categories]);

  const subsByCategory = useMemo(() => {
    const map = new Map<string, SubCategory[]>();
    for (const sub of subcategories) {
      const list = map.get(sub.categoryId) || [];
      list.push(sub);
      map.set(sub.categoryId, list);
    }
    for (const [id, list] of map) {
      map.set(
        id,
        [...list].sort((a, b) => a.displayOrder - b.displayOrder || a.name.localeCompare(b.name))
      );
    }
    return map;
  }, [subcategories]);

  const activeMegaItem = categoryNav.find((item) => item.key === hoveredNavKey);
  const activeSubs = activeMegaItem?.categoryId
    ? subsByCategory.get(activeMegaItem.categoryId) || []
    : [];

  const groupedSubs = useMemo(() => {
    const groups: Array<{ group: SubCategoryGroup; label: string; items: SubCategory[] }> = [];
    for (const group of MEGA_MENU_GROUP_ORDER) {
      const items = activeSubs.filter((s) => s.group === group);
      if (items.length === 0) continue;
      const label = SUBCATEGORY_GROUP_LABELS[group];
      const existing = groups.find((g) => g.label === label);
      if (existing) {
        existing.items.push(...items);
      } else {
        groups.push({ group, label, items });
      }
    }
    return groups;
  }, [activeSubs]);

  const clearCloseTimer = () => {
    if (closeTimer.current != null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openMega = (key: string) => {
    clearCloseTimer();
    setHoveredNavKey(key);
  };

  const scheduleCloseMega = () => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => setHoveredNavKey(null), 160);
  };

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

  const subLink = (sub: SubCategory, parent?: Category) => {
    if (sub.link) return sub.link;
    if (parent?.slug) {
      return `/shop?category=${encodeURIComponent(parent.slug)}&search=${encodeURIComponent(sub.name)}`;
    }
    return `/shop?search=${encodeURIComponent(sub.name)}`;
  };

  return (
    <>
      <div className="bg-brand text-white text-center py-2.5 px-4 text-[11px] tracking-[0.4px] font-sans font-bold">
        Complimentary insured delivery · Lifetime exchange · Certified diamonds
      </div>

      <header
        className={`sticky top-0 z-40 bg-dark transition-shadow duration-300 ${
          scrolled ? 'luxury-shadow' : 'border-b border-white/10'
        }`}
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[78px] sm:min-h-[88px] gap-4">
            <div className="flex items-center gap-3 lg:gap-8 min-w-0 flex-1">
              <button
                type="button"
                className="lg:hidden p-2.5 text-white hover:text-white/70 rounded-lg"
                onClick={() => setIsMobileMenuOpen((v) => !v)}
                aria-label="Open menu"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <Link to="/" className="flex-shrink-0" aria-label="Lukee Jewels Home">
                <img
                  src="/lukee-logo.png"
                  alt="Lukee Jewels"
                  className="h-[58px] sm:h-[68px] w-auto object-contain brightness-0 invert"
                />
              </Link>

              <nav className="hidden lg:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative text-[13px] font-bold tracking-[0.3px] transition-colors py-1 ${
                      isActive(link.path) ? 'text-white' : 'text-white/75 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive(link.path) && (
                      <span className="absolute -bottom-0.5 left-0 w-full h-0.5 bg-white rounded-full" />
                    )}
                  </Link>
                ))}
                <button
                  type="button"
                  onMouseEnter={() => setJewelleryOpen(true)}
                  onClick={() => setJewelleryOpen((v) => !v)}
                  className="inline-flex items-center gap-1 text-[13px] font-bold tracking-[0.3px] text-white/75 hover:text-white"
                >
                  Jewellery
                  <ChevronDown size={14} className={`transition-transform ${jewelleryOpen ? 'rotate-180' : ''}`} />
                </button>
              </nav>
            </div>

            <form
              onSubmit={handleSearchSubmit}
              className="hidden md:flex flex-1 max-w-sm items-center border border-white/15 bg-white/10 rounded-lg px-3 py-2.5 focus-within:border-white/40 transition-colors"
            >
              <Search size={15} className="text-white/70 flex-shrink-0" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search rings, diamonds, gold…"
                className="w-full ml-2 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
                aria-label="Search products"
              />
            </form>

            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2.5 text-white hover:text-white/70 rounded-lg"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
              <Link
                to="/shop"
                className="hidden sm:inline-flex p-2.5 text-white hover:text-white/70 rounded-lg"
                aria-label="Wishlist"
              >
                <Heart size={18} />
              </Link>
              <Link
                to={isAuthenticated ? '/admin' : '/admin/login'}
                className={`p-2.5 rounded-lg transition-colors ${
                  isAuthenticated ? 'text-white' : 'text-white hover:text-white/70'
                }`}
                title={isAuthenticated ? 'Admin' : 'Account'}
              >
                {isAuthenticated ? <ShieldAlert size={18} /> : <User size={18} />}
              </Link>
              <button
                type="button"
                onClick={toggleCart}
                className="relative p-2.5 text-white hover:text-white/70 rounded-lg"
                aria-label="Open cart"
              >
                <ShoppingBag size={18} />
                {getCartCount() > 0 && (
                  <span className="absolute top-1 right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-white text-dark text-[9px] font-bold flex items-center justify-center">
                    {getCartCount()}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {jewelleryOpen && (
          <div
            className="hidden lg:block absolute left-0 right-0 top-[78px] sm:top-[88px] bg-dark border-t border-white/10 luxury-shadow-lg z-30"
            onMouseLeave={() => setJewelleryOpen(false)}
          >
            <div className="max-w-[1440px] mx-auto px-8 py-8 grid grid-cols-4 gap-8">
              <div>
                <p className="section-eyebrow mb-4">Shop</p>
                <ul className="space-y-2.5">
                  {categoryNav.slice(0, 8).map((item) => (
                    <li key={item.key}>
                      <Link
                        to={item.to}
                        className="text-sm font-medium text-white/80 hover:text-white transition-colors"
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

        <nav
          className="relative bg-[#161c3a] border-t border-white/10"
          aria-label="Product categories"
          onMouseLeave={scheduleCloseMega}
        >
          <div className="max-w-[1440px] mx-auto px-2 sm:px-4">
            <ul className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2">
              {categoryNav.map((item) => {
                const active = isCategoryActive(item);
                const hasMega = Boolean(item.categoryId && (subsByCategory.get(item.categoryId)?.length || 0) > 0);
                return (
                  <li
                    key={item.key}
                    className="flex-shrink-0"
                    onMouseEnter={() => {
                      if (hasMega) openMega(item.key);
                      else {
                        clearCloseTimer();
                        setHoveredNavKey(null);
                      }
                    }}
                  >
                    <Link
                      to={item.to}
                      className={`block px-3 py-1.5 text-[12px] font-bold tracking-[0.3px] whitespace-nowrap rounded-full transition-colors ${
                        hoveredNavKey === item.key || active
                          ? 'bg-white text-dark'
                          : item.highlight
                            ? 'text-white hover:bg-white/10'
                            : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {activeMegaItem && groupedSubs.length > 0 && (
            <div
              className="hidden lg:block absolute left-0 right-0 top-full z-50 bg-white border-t border-line luxury-shadow-lg"
              onMouseEnter={clearCloseTimer}
              onMouseLeave={scheduleCloseMega}
            >
              <div className="max-w-[1440px] mx-auto px-6 py-7 grid grid-cols-12 gap-8">
                <div className="col-span-9 grid grid-cols-2 xl:grid-cols-4 gap-8">
                  {groupedSubs.map((section) => {
                    const withImages = section.items.some((item) => Boolean(item.image));
                    const isStyle = section.group === 'style' || section.group === 'collection';
                    return (
                      <div key={`${section.group}-${section.label}`} className={isStyle ? 'xl:col-span-2' : ''}>
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink border-b border-brand/40 pb-2 mb-4">
                          {section.label}
                        </p>
                        <ul className={`gap-x-6 gap-y-3 ${isStyle ? 'grid grid-cols-1 sm:grid-cols-2' : 'space-y-3'}`}>
                          {section.items.map((sub) => (
                            <li key={sub._id}>
                              <Link
                                to={subLink(sub, activeMegaItem.category)}
                                className="group flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.04em] text-ink/80 hover:text-brand"
                              >
                                {withImages && (
                                  <span className="w-9 h-9 rounded-md overflow-hidden bg-surface border border-line flex-shrink-0">
                                    {sub.image ? (
                                      <img
                                        src={sub.image}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <span className="block w-full h-full bg-line/40" />
                                    )}
                                  </span>
                                )}
                                <span className="leading-snug group-hover:underline underline-offset-4 decoration-brand/50">
                                  {sub.name}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>

                <div className="col-span-3">
                  {activeMegaItem.category?.megaPromoImage ? (
                    <div className="space-y-3">
                      <div className="aspect-[4/5] overflow-hidden rounded-lg bg-surface">
                        <img
                          src={activeMegaItem.category.megaPromoImage}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {activeMegaItem.category.megaPromoCaption && (
                        <p className="text-xs italic text-muted leading-relaxed">
                          {activeMegaItem.category.megaPromoCaption}
                        </p>
                      )}
                      <Link
                        to={activeMegaItem.category.megaPromoLink || activeMegaItem.to}
                        className="inline-block text-[11px] font-bold uppercase tracking-[0.14em] text-ink border-b border-brand pb-0.5 hover:text-brand"
                      >
                        {activeMegaItem.category.megaPromoLinkLabel || 'View all designs'}
                      </Link>
                    </div>
                  ) : (
                    <div className="h-full min-h-[180px] rounded-lg border border-dashed border-line flex items-center justify-center px-4 text-center">
                      <Link
                        to={activeMegaItem.to}
                        className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand"
                      >
                        View all {activeMegaItem.label}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-white/10 bg-dark py-4 px-5 space-y-1 max-h-[70vh] overflow-y-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center border border-white/15 rounded-lg px-3 py-2.5 mb-3 bg-white/10"
            >
              <Search size={16} className="text-white/70" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jewellery…"
                className="w-full ml-2 bg-transparent text-sm text-white placeholder:text-white/50 focus:outline-none"
              />
            </form>
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="block py-3 text-sm font-bold text-white border-b border-white/10"
              >
                {link.label}
              </Link>
            ))}
            <p className="pt-3 text-[11px] uppercase tracking-wider text-white/50 font-bold">Categories</p>
            {categoryNav.map((item) => (
              <div key={item.key} className="border-b border-white/10 pb-2 mb-2">
                <Link
                  to={item.to}
                  className={`block text-sm py-2 ${
                    item.highlight ? 'text-white font-bold' : 'text-white/70 font-medium'
                  }`}
                >
                  {item.label}
                </Link>
                {item.categoryId &&
                  (subsByCategory.get(item.categoryId) || [])
                    .filter((s) => s.group === 'style' || s.group === 'collection')
                    .slice(0, 6)
                    .map((sub) => (
                      <Link
                        key={sub._id}
                        to={subLink(sub, item.category)}
                        className="flex items-center gap-2 pl-3 py-1.5 text-xs text-white/55"
                      >
                        {sub.image && (
                          <img src={sub.image} alt="" className="w-6 h-6 rounded object-cover" />
                        )}
                        {sub.name}
                      </Link>
                    ))}
              </div>
            ))}
          </div>
        )}

        {isSearchOpen && (
          <div className="md:hidden border-t border-white/10 bg-dark py-4 px-4">
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
