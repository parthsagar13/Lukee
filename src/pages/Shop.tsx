import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, ArrowUpDown, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Product, Category } from '../types.js';
import { ProductCard } from '../components/ProductCard.js';

const MATERIALS_PRESETS = [
  '18k Yellow Gold',
  '14k White Gold',
  '950 Platinum',
  '18k Rose Gold',
  '925 Sterling Silver'
];

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Read URL params (with defaults)
  const activeCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const activeMaterial = searchParams.get('material') || '';
  const activeSort = searchParams.get('sort') || 'newest';
  const activePage = parseInt(searchParams.get('page') || '1', 10);

  const limit = 12; // 12 items per page for luxury layout
  const skip = (activePage - 1) * limit;

  // Load all active categories for side filter
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data.filter((c: Category) => c.status === 'active'));
      } catch (err) {
        console.error('Error fetching categories for filter:', err);
      }
    };
    fetchCats();
  }, []);

  // Fetch products whenever filters or pagination change
  useEffect(() => {
    const fetchProds = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (activeCategory) queryParams.set('category', activeCategory);
        if (searchQuery) queryParams.set('search', searchQuery);
        if (minPrice) queryParams.set('minPrice', minPrice);
        if (maxPrice) queryParams.set('maxPrice', maxPrice);
        if (activeMaterial) queryParams.set('material', activeMaterial);
        if (activeSort) queryParams.set('sort', activeSort);
        queryParams.set('limit', String(limit));
        queryParams.set('skip', String(skip));

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
        setTotalProducts(data.total || 0);
      } catch (err) {
        console.error('Error fetching filtered products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProds();
  }, [activeCategory, searchQuery, minPrice, maxPrice, activeMaterial, activeSort, activePage]);

  // Helper to update a URL parameter safely without losing other states
  const updateUrlParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Always reset page to 1 when changing filters
    if (key !== 'page') {
      newParams.delete('page');
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
    setIsMobileFilterOpen(false);
  };

  const totalPages = Math.ceil(totalProducts / limit) || 1;

  return (
    <div id="shop-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* Page Header */}
      <div className="border-b border-gold-200 pb-8 mb-10 text-center sm:text-left space-y-3">
        <h1 className="text-3xl sm:text-5xl font-light tracking-wide">The Salon Collection</h1>
        <p className="text-xs sm:text-sm text-gray-500 font-light max-w-2xl leading-relaxed">
          Exquisite custom jewels masterfully configured across metals, materials, and stone cuts. Utilize our filters below to narrow your selection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* 1. Filter Sidebar (Desktop) */}
        <aside id="desktop-filters" className="hidden lg:block space-y-8 sticky top-32 h-fit">
          <div className="flex justify-between items-center border-b border-gold-200 pb-4">
            <h3 className="text-xs uppercase tracking-widest font-semibold text-[#1A1A1A] flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-gold-500" />
              Filter Catalog
            </h3>
            {(activeCategory || searchQuery || minPrice || maxPrice || activeMaterial) && (
              <button
                onClick={handleClearFilters}
                className="text-[0.65rem] uppercase tracking-widest text-gold-600 hover:text-gold-800 font-semibold border-b border-gold-300"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Search Box inside Sidebar */}
          <div className="space-y-2.5">
            <label className="text-xs tracking-wider uppercase text-gray-500 block">Search Keyword</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search name, SKU..."
                value={searchQuery}
                onChange={(e) => updateUrlParam('search', e.target.value)}
                className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-2.5 px-3 pr-8 rounded-sm focus:outline-none focus:border-gold-500 text-[#1A1A1A] font-light"
              />
              <Search size={14} className="absolute right-2.5 top-3 text-gray-400" />
            </div>
          </div>

          {/* Categories Filter */}
          <div className="space-y-3">
            <label className="text-xs tracking-wider uppercase text-gray-500 block">Category</label>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-2">
              <button
                onClick={() => updateUrlParam('category', '')}
                className={`w-full text-left text-xs uppercase py-1 tracking-wider block transition-colors ${
                  !activeCategory ? 'text-gold-500 font-bold' : 'text-gray-500 hover:text-gold-500'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() => updateUrlParam('category', cat.slug)}
                  className={`w-full text-left text-xs uppercase py-1 tracking-wider block transition-colors ${
                    activeCategory === cat.slug || activeCategory === cat._id
                      ? 'text-gold-500 font-bold'
                      : 'text-gray-500 hover:text-gold-500'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3">
            <label className="text-xs tracking-wider uppercase text-gray-500 block">Price Range ($)</label>
            <div className="grid grid-cols-2 gap-3 items-center">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateUrlParam('minPrice', e.target.value)}
                className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-2 px-2.5 rounded-sm focus:outline-none focus:border-gold-500 text-[#1A1A1A] font-mono"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateUrlParam('maxPrice', e.target.value)}
                className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-2 px-2.5 rounded-sm focus:outline-none focus:border-gold-500 text-[#1A1A1A] font-mono"
              />
            </div>
            {/* Price presets */}
            <div className="flex flex-wrap gap-1.5 pt-1.5">
              {['0-1500', '1500-3000', '3000-5000', '5000+'].map((range) => {
                const parts = range.split('-');
                const min = parts[0];
                const max = parts[1] || '';
                const isSelected = minPrice === min && maxPrice === max;
                return (
                  <button
                    key={range}
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('minPrice', min);
                      if (max) newParams.set('maxPrice', max);
                      else newParams.delete('maxPrice');
                      newParams.delete('page');
                      setSearchParams(newParams);
                    }}
                    className={`text-[0.65rem] px-2 py-1 uppercase rounded-sm border transition-colors ${
                      isSelected ? 'bg-gold-500 text-white border-gold-500' : 'bg-[#FDFCFB] text-gray-500 border-gold-200 hover:border-gold-400'
                    }`}
                  >
                    ${range}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Materials Filter */}
          <div className="space-y-3">
            <label className="text-xs tracking-wider uppercase text-gray-500 block">Metal / Material</label>
            <div className="space-y-1.5">
              <button
                onClick={() => updateUrlParam('material', '')}
                className={`w-full text-left text-xs uppercase py-1 tracking-wider block transition-colors ${
                  !activeMaterial ? 'text-gold-500 font-bold' : 'text-gray-500 hover:text-[#C5A059]'
                }`}
              >
                All Metals
              </button>
              {MATERIALS_PRESETS.map((m) => (
                <button
                  key={m}
                  onClick={() => updateUrlParam('material', m)}
                  className={`w-full text-left text-xs uppercase py-1 tracking-wider block transition-colors ${
                    activeMaterial === m ? 'text-gold-500 font-bold' : 'text-gray-500 hover:text-gold-500'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* 2. Main Product Catalog Grid & Controllers */}
        <section id="catalog-grid-area" className="lg:col-span-3 space-y-8">
          
          {/* Grid Toolbar Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center bg-[#F9F6F2] border border-gold-200 p-4 gap-4 rounded-sm">
            <span className="text-xs text-gray-500 font-light order-2 sm:order-1">
              Showing <span className="font-semibold text-gray-800">{products.length}</span> of <span className="font-semibold text-gray-800">{totalProducts}</span> exquisite designs
            </span>
 
            <div className="flex items-center space-x-3 w-full sm:w-auto order-1 sm:order-2 justify-end">
              {/* Mobile Filter Button */}
              <button
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center space-x-2 text-xs uppercase tracking-widest text-gray-700 bg-[#FDFCFB] border border-gold-200 px-3 py-2 rounded-sm hover:border-gold-500"
              >
                <SlidersHorizontal size={12} />
                <span>Filters</span>
              </button>
 
              {/* Sort Dropdown */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <ArrowUpDown size={12} className="text-gold-500 flex-shrink-0" />
                <select
                  value={activeSort}
                  onChange={(e) => updateUrlParam('sort', e.target.value)}
                  className="bg-[#FDFCFB] border border-gold-200 text-xs px-2.5 py-2 focus:outline-none focus:border-gold-500 text-gray-700 tracking-wider rounded-sm"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
 
          {/* Active Filter Badges */}
          {(activeCategory || searchQuery || minPrice || maxPrice || activeMaterial) && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.65rem] uppercase tracking-widest text-gray-400">Active filters:</span>
              {activeCategory && (
                <span className="text-[0.65rem] bg-gold-100 border border-gold-200 px-2.5 py-1 text-gold-800 rounded-full flex items-center gap-1">
                  Category: {activeCategory}
                  <button onClick={() => updateUrlParam('category', '')}><X size={10} /></button>
                </span>
              )}
              {searchQuery && (
                <span className="text-[0.65rem] bg-gold-100 border border-gold-200 px-2.5 py-1 text-gold-800 rounded-full flex items-center gap-1">
                  Keyword: {searchQuery}
                  <button onClick={() => updateUrlParam('search', '')}><X size={10} /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="text-[0.65rem] bg-gold-100 border border-gold-200 px-2.5 py-1 text-gold-800 rounded-full flex items-center gap-1">
                  Price: ${minPrice || '0'} - ${maxPrice || '&infin;'}
                  <button onClick={() => {
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('minPrice');
                    newParams.delete('maxPrice');
                    setSearchParams(newParams);
                  }}><X size={10} /></button>
                </span>
              )}
              {activeMaterial && (
                <span className="text-[0.65rem] bg-gold-100 border border-gold-200 px-2.5 py-1 text-gold-800 rounded-full flex items-center gap-1">
                  Metal: {activeMaterial}
                  <button onClick={() => updateUrlParam('material', '')}><X size={10} /></button>
                </span>
              )}
            </div>
          )}
 
          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-20 text-gray-400 text-xs">Awaiting inventory delivery...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <p className="text-sm font-light text-gray-500">No matching luxury items were found in our catalog.</p>
              <button
                onClick={handleClearFilters}
                className="bg-[#1A1A1A] text-white px-6 py-2.5 text-xs uppercase tracking-widest hover:bg-gold-500 hover:text-white transition-all rounded-sm"
              >
                Reset Filter Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}
 
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-10 border-t border-gold-200">
              <button
                onClick={() => updateUrlParam('page', String(activePage - 1))}
                disabled={activePage <= 1}
                className="p-2 border border-gold-200 rounded-sm hover:bg-gold-100 text-gray-500 disabled:opacity-40 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateUrlParam('page', String(pageNum))}
                    className={`px-3 py-1.5 text-xs font-mono rounded-sm transition-colors ${
                      activePage === pageNum
                        ? 'bg-[#1A1A1A] text-white font-bold'
                        : 'border border-gold-200 hover:bg-gold-100 text-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => updateUrlParam('page', String(activePage + 1))}
                disabled={activePage >= totalPages}
                className="p-2 border border-gold-200 rounded-sm hover:bg-gold-100 text-gray-500 disabled:opacity-40 transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>

      {/* 3. Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-[#11100e]/40 backdrop-blur-xs"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative w-screen max-w-sm bg-[#FDFCFB] shadow-xl flex flex-col h-full ml-auto">
            <div className="px-5 py-4 border-b border-gold-200 flex justify-between items-center bg-[#F9F6F2]">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-[#1A1A1A]">
                Filter Catalog
              </h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Search */}
              <div className="space-y-2.5">
                <label className="text-xs tracking-wider uppercase text-gray-500 block">Keyword search</label>
                <input
                  type="text"
                  placeholder="Search name, SKU..."
                  value={searchQuery}
                  onChange={(e) => updateUrlParam('search', e.target.value)}
                  className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-2.5 px-3 rounded-sm focus:outline-none focus:border-gold-500 text-[#1A1A1A]"
                />
              </div>

              {/* Categories */}
              <div className="space-y-3">
                <label className="text-xs tracking-wider uppercase text-gray-500 block">Category</label>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      updateUrlParam('category', '');
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left text-xs uppercase py-1.5 block ${
                      !activeCategory ? 'text-gold-500 font-bold' : 'text-gray-500'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat._id}
                      onClick={() => {
                        updateUrlParam('category', cat.slug);
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-left text-xs uppercase py-1.5 block ${
                        activeCategory === cat.slug || activeCategory === cat._id
                          ? 'text-gold-500 font-bold'
                          : 'text-gray-500'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price range */}
              <div className="space-y-3">
                <label className="text-xs tracking-wider uppercase text-gray-500 block">Price Range ($)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => updateUrlParam('minPrice', e.target.value)}
                    className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-2 px-2 rounded-sm text-[#1A1A1A]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => updateUrlParam('maxPrice', e.target.value)}
                    className="w-full text-xs bg-[#F9F6F2] border border-gold-200 py-2 px-2 rounded-sm text-[#1A1A1A]"
                  />
                </div>
              </div>

              {/* Material */}
              <div className="space-y-3">
                <label className="text-xs tracking-wider uppercase text-gray-500 block">Metal / Material</label>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      updateUrlParam('material', '');
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left text-xs uppercase py-1.5 block ${
                      !activeMaterial ? 'text-gold-500 font-bold' : 'text-gray-500'
                    }`}
                  >
                    All Metals
                  </button>
                  {MATERIALS_PRESETS.map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        updateUrlParam('material', m);
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-left text-xs uppercase py-1.5 block ${
                        activeMaterial === m ? 'text-gold-500 font-bold' : 'text-gray-500'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gold-200 bg-[#F9F6F2] flex gap-3">
              <button
                onClick={handleClearFilters}
                className="w-1/2 border border-gold-300 text-[#1A1A1A] text-xs uppercase tracking-widest py-3 hover:bg-gold-100 rounded-sm font-semibold"
              >
                Reset
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest py-3 hover:bg-gold-500 hover:text-white rounded-sm font-semibold transition-colors"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
