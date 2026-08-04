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
  '925 Sterling Silver',
];

const ProductSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-3">
    <div className="aspect-[4/5] bg-line/60 rounded-xl" />
    <div className="h-3 w-2/3 bg-line/60 rounded" />
    <div className="h-3 w-1/2 bg-line/40 rounded" />
    <div className="h-3 w-1/3 bg-line/40 rounded" />
  </div>
);

const FilterPanel: React.FC<{
  searchQuery: string;
  activeCategory: string;
  categories: Category[];
  minPrice: string;
  maxPrice: string;
  activeMaterial: string;
  searchParams: URLSearchParams;
  updateUrlParam: (key: string, value: string) => void;
  setSearchParams: (params: URLSearchParams) => void;
  onCategoryPick?: () => void;
  onMaterialPick?: () => void;
}> = ({
  searchQuery,
  activeCategory,
  categories,
  minPrice,
  maxPrice,
  activeMaterial,
  searchParams,
  updateUrlParam,
  setSearchParams,
  onCategoryPick,
  onMaterialPick,
}) => (
  <div className="space-y-6">
    <div className="space-y-2.5">
      <label className="section-eyebrow !text-[0.65rem] block">Search Keyword</label>
      <div className="relative">
        <input
          type="text"
          placeholder="Search name, SKU..."
          value={searchQuery}
          onChange={(e) => updateUrlParam('search', e.target.value)}
          className="input-luxury !py-2.5 !pr-9 !text-xs rounded-xl"
        />
        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted" />
      </div>
    </div>

    <div className="space-y-3">
      <label className="section-eyebrow !text-[0.65rem] block">Category</label>
      <div className="space-y-0.5 max-h-56 overflow-y-auto pr-1">
        <button
          type="button"
          onClick={() => {
            updateUrlParam('category', '');
            onCategoryPick?.();
          }}
          className={`w-full text-left text-xs uppercase py-2 px-2.5 tracking-wider rounded-lg transition-colors ${
            !activeCategory
              ? 'bg-brand-soft text-brand-dark font-semibold'
              : 'text-muted hover:bg-white hover:text-ink'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            type="button"
            key={cat._id}
            onClick={() => {
              updateUrlParam('category', cat.slug);
              onCategoryPick?.();
            }}
            className={`w-full text-left text-xs uppercase py-2 px-2.5 tracking-wider rounded-lg transition-colors ${
              activeCategory === cat.slug || activeCategory === cat._id
                ? 'bg-brand-soft text-brand-dark font-semibold'
                : 'text-muted hover:bg-white hover:text-ink'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>

    <div className="space-y-3">
      <label className="section-eyebrow !text-[0.65rem] block">Price Range (₹)</label>
      <div className="grid grid-cols-2 gap-3 items-center">
        <input
          type="number"
          placeholder="Min"
          value={minPrice}
          onChange={(e) => updateUrlParam('minPrice', e.target.value)}
          className="input-luxury !py-2 !text-xs !font-mono rounded-xl"
        />
        <input
          type="number"
          placeholder="Max"
          value={maxPrice}
          onChange={(e) => updateUrlParam('maxPrice', e.target.value)}
          className="input-luxury !py-2 !text-xs !font-mono rounded-xl"
        />
      </div>
      <div className="flex flex-wrap gap-1.5 pt-1">
        {['0-1500', '1500-3000', '3000-5000', '5000+'].map((range) => {
          const parts = range.split('-');
          const min = parts[0];
          const max = parts[1] || '';
          const isSelected = minPrice === min && maxPrice === max;
          return (
            <button
              type="button"
              key={range}
              onClick={() => {
                const newParams = new URLSearchParams(searchParams);
                newParams.set('minPrice', min);
                if (max) newParams.set('maxPrice', max);
                else newParams.delete('maxPrice');
                newParams.delete('page');
                setSearchParams(newParams);
              }}
              className={`text-[0.65rem] px-2.5 py-1 uppercase rounded-lg border transition-colors ${
                isSelected
                  ? 'bg-brand text-ink border-brand font-semibold'
                  : 'bg-white text-muted border-line hover:border-brand'
              }`}
            >
              ₹{range}
            </button>
          );
        })}
      </div>
    </div>

    <div className="space-y-3">
      <label className="section-eyebrow !text-[0.65rem] block">Metal / Material</label>
      <div className="space-y-0.5">
        <button
          type="button"
          onClick={() => {
            updateUrlParam('material', '');
            onMaterialPick?.();
          }}
          className={`w-full text-left text-xs uppercase py-2 px-2.5 tracking-wider rounded-lg transition-colors ${
            !activeMaterial
              ? 'bg-brand-soft text-brand-dark font-semibold'
              : 'text-muted hover:bg-white hover:text-ink'
          }`}
        >
          All Metals
        </button>
        {MATERIALS_PRESETS.map((m) => (
          <button
            type="button"
            key={m}
            onClick={() => {
              updateUrlParam('material', m);
              onMaterialPick?.();
            }}
            className={`w-full text-left text-xs uppercase py-2 px-2.5 tracking-wider rounded-lg transition-colors ${
              activeMaterial === m
                ? 'bg-brand-soft text-brand-dark font-semibold'
                : 'text-muted hover:bg-white hover:text-ink'
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  </div>
);

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const activeCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const activeMaterial = searchParams.get('material') || '';
  const activeSort = searchParams.get('sort') || 'newest';
  const activePage = parseInt(searchParams.get('page') || '1', 10);
  const bestSellerOnly = searchParams.get('bestSeller') === 'true';
  const newArrivalOnly = searchParams.get('newArrival') === 'true';

  const limit = 12;
  const skip = (activePage - 1) * limit;

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
        if (bestSellerOnly) queryParams.set('bestSeller', 'true');
        if (newArrivalOnly) queryParams.set('newArrival', 'true');
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
  }, [
    activeCategory,
    searchQuery,
    minPrice,
    maxPrice,
    activeMaterial,
    activeSort,
    activePage,
    bestSellerOnly,
    newArrivalOnly,
  ]);

  const updateUrlParam = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
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
  const hasActiveFilters = !!(activeCategory || searchQuery || minPrice || maxPrice || activeMaterial);

  const filterProps = {
    searchQuery,
    activeCategory,
    categories,
    minPrice,
    maxPrice,
    activeMaterial,
    searchParams,
    updateUrlParam,
    setSearchParams,
  };

  return (
    <div id="shop-page" className="w-full px-3 sm:px-5 lg:px-6 xl:px-8 py-8 sm:py-12 font-sans bg-white text-ink">
      <div className="border-b border-line pb-8 mb-8 text-center sm:text-left space-y-3">
        <p className="section-eyebrow">Curated for you</p>
        <h1 className="text-3xl sm:text-5xl font-serif font-light tracking-wide text-ink">
          The Salon Collection
        </h1>
        <p className="text-xs sm:text-sm text-muted font-light max-w-2xl leading-relaxed">
          Exquisite custom jewels masterfully configured across metals, materials, and stone cuts.
          Utilize our filters below to narrow your selection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] xl:grid-cols-[280px_1fr] gap-6 xl:gap-8">
        <aside id="desktop-filters" className="hidden lg:block sticky top-28 h-fit">
          <div className="bg-white border border-line rounded-xl luxury-shadow p-5 space-y-6">
            <div className="flex justify-between items-center border-b border-line pb-4">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-ink flex items-center gap-2">
                <SlidersHorizontal size={14} className="text-brand" />
                Filter Catalog
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-[0.65rem] uppercase tracking-widest text-brand-dark hover:text-brand-dark font-semibold border-b border-brand/30"
                >
                  Clear All
                </button>
              )}
            </div>
            <FilterPanel {...filterProps} />
          </div>
        </aside>

        <section id="catalog-grid-area" className="min-w-0 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-line p-4 gap-4 rounded-xl luxury-shadow">
            <span className="text-xs text-muted font-light order-2 sm:order-1">
              Showing{' '}
              <span className="font-semibold text-ink">{products.length}</span> of{' '}
              <span className="font-semibold text-ink">{totalProducts}</span> exquisite designs
            </span>

            <div className="flex items-center space-x-3 w-full sm:w-auto order-1 sm:order-2 justify-end">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center space-x-2 text-xs uppercase tracking-widest text-ink bg-white border border-line px-3 py-2 rounded-xl hover:border-brand"
              >
                <SlidersHorizontal size={12} />
                <span>Filters</span>
              </button>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <ArrowUpDown size={12} className="text-brand flex-shrink-0" />
                <select
                  value={activeSort}
                  onChange={(e) => updateUrlParam('sort', e.target.value)}
                  className="bg-white border border-line text-xs px-2.5 py-2 focus:outline-none focus:border-brand text-ink tracking-wider rounded-xl w-full sm:w-auto"
                >
                  <option value="newest">Sort: Newest</option>
                  <option value="featured">Sort: Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[0.65rem] uppercase tracking-widest text-muted">Active filters:</span>
              {activeCategory && (
                <span className="text-[0.65rem] bg-brand-soft border border-line px-2.5 py-1 text-brand-dark rounded-full flex items-center gap-1.5">
                  Category: {activeCategory}
                  <button type="button" onClick={() => updateUrlParam('category', '')} aria-label="Remove category">
                    <X size={10} />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="text-[0.65rem] bg-brand-soft border border-line px-2.5 py-1 text-brand-dark rounded-full flex items-center gap-1.5">
                  Keyword: {searchQuery}
                  <button type="button" onClick={() => updateUrlParam('search', '')} aria-label="Remove search">
                    <X size={10} />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="text-[0.65rem] bg-brand-soft border border-line px-2.5 py-1 text-brand-dark rounded-full flex items-center gap-1.5">
                  Price: ₹{minPrice || '0'} – {maxPrice || '∞'}
                  <button
                    type="button"
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('minPrice');
                      newParams.delete('maxPrice');
                      setSearchParams(newParams);
                    }}
                    aria-label="Remove price"
                  >
                    <X size={10} />
                  </button>
                </span>
              )}
              {activeMaterial && (
                <span className="text-[0.65rem] bg-brand-soft border border-line px-2.5 py-1 text-brand-dark rounded-full flex items-center gap-1.5">
                  Metal: {activeMaterial}
                  <button type="button" onClick={() => updateUrlParam('material', '')} aria-label="Remove material">
                    <X size={10} />
                  </button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 space-y-5 bg-white border border-line rounded-xl luxury-shadow">
              <p className="text-sm font-light text-muted">No matching luxury items were found in our catalog.</p>
              <button type="button" onClick={handleClearFilters} className="btn-primary">
                Reset Filter Catalog
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-5">
              {products.map((prod) => (
                <ProductCard key={prod._id} product={prod} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 pt-10 border-t border-line">
              <button
                type="button"
                onClick={() => updateUrlParam('page', String(activePage - 1))}
                disabled={activePage <= 1}
                className="p-2 border border-line rounded-xl hover:bg-brand-soft text-muted disabled:opacity-40 transition-colors"
                title="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>
              {[...Array(totalPages)].map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    type="button"
                    key={pageNum}
                    onClick={() => updateUrlParam('page', String(pageNum))}
                    className={`px-3 py-1.5 text-xs font-mono rounded-xl transition-colors ${
                      activePage === pageNum
                        ? 'bg-ink text-white font-bold'
                        : 'border border-line hover:bg-brand-soft text-muted'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => updateUrlParam('page', String(activePage + 1))}
                disabled={activePage >= totalPages}
                className="p-2 border border-line rounded-xl hover:bg-brand-soft text-muted disabled:opacity-40 transition-colors"
                title="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>

      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setIsMobileFilterOpen(false)}
          />

          <div className="relative w-screen max-w-sm bg-white shadow-xl flex flex-col h-full ml-auto">
            <div className="px-5 py-4 border-b border-line flex justify-between items-center bg-white">
              <h3 className="text-xs uppercase tracking-widest font-semibold text-ink">Filter Catalog</h3>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="text-muted hover:text-ink p-1"
                aria-label="Close filters"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              <FilterPanel
                {...filterProps}
                onCategoryPick={() => setIsMobileFilterOpen(false)}
                onMaterialPick={() => setIsMobileFilterOpen(false)}
              />
            </div>

            <div className="p-4 border-t border-line bg-white flex gap-3">
              <button type="button" onClick={handleClearFilters} className="w-1/2 btn-secondary !py-3">
                Reset
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-1/2 btn-primary !py-3"
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
