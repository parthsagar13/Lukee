import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Star,
  Share2,
  ShieldCheck,
  Truck,
  RefreshCw,
  ZoomIn,
  X,
  ChevronRight,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Product, Category } from '../types.js';
import { useCart } from '../contexts/CartContext.js';
import { ProductCard } from '../components/ProductCard.js';
import { DUMMY_REVIEWS } from '../data/luxuryContent.js';

const RING_SIZES = ['5', '6', '7', '8', '9', '10'];
const RECENT_KEY = 'lukee_recent';

interface RecentItem {
  id: string;
  slug: string;
  name: string;
  image?: string;
}

const readRecent = (): RecentItem[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const pushRecent = (item: RecentItem) => {
  try {
    const prev = readRecent().filter((r) => r.id !== item.id && r.slug !== item.slug);
    const next = [item, ...prev].slice(0, 4);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore storage errors */
  }
};

const HIGHLIGHTS = [
  'Hand-finished by Lukee atelier artisans',
  'Includes authenticity certificate & gem report',
  'Complimentary resizing within 30 days',
  'Insured express delivery across India',
];

export const ProductDetails: React.FC = () => {
  const { idOrSlug } = useParams<{ idOrSlug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [category, setCategory] = useState<Category | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [selectedSize, setSelectedSize] = useState('7');
  const [pincode, setPincode] = useState('');
  const [pincodeChecked, setPincodeChecked] = useState(false);
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${idOrSlug}`);
        if (!res.ok) {
          navigate('/404');
          return;
        }
        const prodData: Product = await res.json();
        setProduct(prodData);
        setActiveImage(prodData.images?.[0] || '');
        setQuantity(1);
        setSelectedSize('7');
        setPincode('');
        setPincodeChecked(false);

        pushRecent({
          id: prodData._id,
          slug: prodData.slug,
          name: prodData.name,
          image: prodData.images?.[0],
        });
        setRecentItems(readRecent().filter((r) => r.id !== prodData._id));

        const catRes = await fetch(`/api/categories/${prodData.category}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategory(catData);
        }

        const relRes = await fetch(`/api/products?category=${prodData.category}&limit=4`);
        if (relRes.ok) {
          const relData = await relRes.json();
          setRelatedProducts(
            (relData.products || []).filter((p: Product) => p._id !== prodData._id).slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (idOrSlug) {
      fetchProductDetails();
    }
  }, [idOrSlug, navigate]);

  if (loading) {
    return (
      <div className="w-full px-3 sm:px-5 lg:px-6 xl:px-8 py-16 font-sans bg-white">
        <div className="animate-pulse grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="aspect-square bg-line/60 rounded-xl" />
          <div className="space-y-4">
            <div className="h-3 w-1/3 bg-line/60 rounded" />
            <div className="h-8 w-3/4 bg-line/60 rounded" />
            <div className="h-4 w-1/2 bg-line/40 rounded" />
            <div className="h-24 bg-line/40 rounded-xl" />
            <div className="h-12 bg-line/50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-40 text-muted text-xs tracking-widest font-sans uppercase bg-white">
        Product not found.
      </div>
    );
  }

  const isOnSale =
    product.salePrice !== undefined && product.salePrice !== null && product.salePrice < product.price;
  const pincodeValid = /^\d{6}$/.test(pincode);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handlePincodeCheck = () => {
    setPincodeChecked(true);
  };

  return (
    <div
      id="product-details-page"
      className="w-full px-3 sm:px-5 lg:px-6 xl:px-8 py-8 sm:py-12 font-sans bg-white text-ink"
    >
      <nav
        id="breadcrumbs"
        className="flex items-center space-x-2 text-[0.7rem] text-muted uppercase tracking-widest mb-8 sm:mb-10 overflow-x-auto whitespace-nowrap"
      >
        <Link to="/" className="hover:text-brand transition-colors">
          Home
        </Link>
        <ChevronRight size={10} className="text-line" />
        <Link to="/shop" className="hover:text-brand transition-colors">
          Shop
        </Link>
        {category && (
          <>
            <ChevronRight size={10} className="text-line" />
            <Link
              to={`/shop?category=${category.slug}`}
              className="hover:text-brand transition-colors"
            >
              {category.name}
            </Link>
          </>
        )}
        <ChevronRight size={10} className="text-line" />
        <span className="text-ink font-light truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 xl:gap-16 items-start">
        <div id="product-gallery" className="space-y-4">
          <div className="relative aspect-square bg-white border border-line overflow-hidden group rounded-xl luxury-shadow">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-4 right-4 bg-white/95 p-2.5 rounded-full luxury-shadow text-muted hover:text-brand transition-all"
              title="Zoom Image"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1.5">
              {product.images.map((imgUrl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 bg-white border flex-shrink-0 transition-all rounded-xl overflow-hidden ${
                    activeImage === imgUrl
                      ? 'border-brand ring-1 ring-brand-soft'
                      : 'border-line hover:border-brand'
                  }`}
                >
                  <img
                    src={imgUrl}
                    alt={`${product.name} gallery ${idx + 1}`}
                    className="w-full h-full object-cover object-center"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div id="product-actions-pane" className="lg:sticky lg:top-28 space-y-6">
          <div className="space-y-2">
            <p className="section-eyebrow">
              {product.material} · {product.purity}
            </p>
            <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight font-light">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 text-xs text-muted">
              <span className="font-mono">SKU: {product.sku}</span>
              <span>·</span>
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-brand text-brand" />
                  ))}
                </div>
                <span className="text-muted font-mono">(4.9)</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-line rounded-xl py-4 px-4 flex flex-wrap items-center gap-3 luxury-shadow">
            {isOnSale ? (
              <>
                <span className="font-serif text-2xl sm:text-3xl text-brand-dark font-semibold">
                  ₹{product.salePrice?.toLocaleString('en-IN')}
                </span>
                <span className="font-serif text-base text-muted line-through">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="bg-brand-soft text-brand-dark text-[0.65rem] tracking-wider uppercase font-semibold px-2.5 py-1 rounded-lg border border-line">
                  Save ₹{(product.price - product.salePrice!).toLocaleString('en-IN')}
                </span>
              </>
            ) : (
              <span className="font-serif text-2xl sm:text-3xl text-ink font-semibold">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          <p className="text-xs sm:text-sm text-muted leading-relaxed font-light">
            {product.shortDescription ||
              'An exquisite, masterfully finished bespoke piece designed with attention to every facet and polished standard.'}
          </p>

          {/* Size selector — local UI only */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="section-eyebrow !text-[0.65rem]">Ring Size</label>
              <span className="text-[0.65rem] text-muted">Selected: {selectedSize}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {RING_SIZES.map((size) => (
                <button
                  type="button"
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-11 h-11 text-xs font-mono rounded-xl border transition-colors ${
                    selectedSize === size
                      ? 'bg-ink text-white border-ink'
                      : 'bg-white text-ink border-line hover:border-brand'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery pincode — local UI only */}
          <div className="bg-white border border-line rounded-xl p-4 space-y-3 luxury-shadow">
            <label className="section-eyebrow !text-[0.65rem] flex items-center gap-1.5">
              <MapPin size={12} className="text-brand" />
              Check Delivery
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit pincode"
                value={pincode}
                onChange={(e) => {
                  setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setPincodeChecked(false);
                }}
                className="input-luxury !py-2.5 !text-xs rounded-xl flex-1"
              />
              <button
                type="button"
                onClick={handlePincodeCheck}
                className="btn-secondary !px-4 !py-2.5 !text-[0.65rem] rounded-xl"
              >
                Check
              </button>
            </div>
            {pincodeChecked && (
              <p className={`text-xs ${pincodeValid ? 'text-brand-dark' : 'text-muted'}`}>
                {pincodeValid
                  ? 'Delivers in 3–5 days · Fully insured courier'
                  : 'Please enter a valid 6-digit pincode'}
              </p>
            )}
          </div>

          <div className="space-y-4 pt-1">
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center border border-line h-12 w-full sm:w-32 justify-between px-4 bg-white rounded-xl">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="text-muted hover:text-brand text-lg font-bold"
                    disabled={quantity <= 1}
                  >
                    −
                  </button>
                  <span className="font-mono text-sm text-ink w-8 text-center font-semibold">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                    className="text-muted hover:text-brand text-lg font-bold"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 btn-primary h-12 !py-0 rounded-xl"
                >
                  <ShoppingBag size={14} />
                  <span>Add To Shopping Bag</span>
                </button>
              </div>
            ) : (
              <div className="bg-white p-4 text-center border border-line rounded-xl">
                <span className="text-xs uppercase tracking-widest text-ink font-semibold">
                  Currently Out of Stock
                </span>
                <p className="text-[0.65rem] text-muted font-light mt-1">
                  Contact our boutique concierge team to reserve subsequent casting editions.
                </p>
              </div>
            )}

            {product.stock > 0 && (
              <p className="text-[0.65rem] text-muted font-light italic">
                Only {product.stock} items remaining in our boutique vaults.
              </p>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-line text-xs text-muted font-light">
            <div className="flex items-center space-x-3">
              <Truck size={16} className="text-brand flex-shrink-0" />
              <span>Free fully insured express delivery. Dispatched in 2–4 days.</span>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshCw size={16} className="text-brand flex-shrink-0" />
              <span>30-Day complimentary returns or exchanges with free insured pickup.</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck size={16} className="text-brand flex-shrink-0" />
              <span>Accompanied by a Lukee Jewels Authenticity Certificate & gem report.</span>
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-4 border-t border-line">
            <span className="text-[0.65rem] uppercase tracking-widest text-muted font-light">
              Share Design:
            </span>
            <button
              type="button"
              onClick={handleShare}
              className="text-muted hover:text-brand transition-colors flex items-center space-x-1.5 text-xs font-semibold"
              title="Copy URL link"
            >
              <Share2 size={14} />
              <span>{copiedShare ? 'Copied link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Highlights & Specs */}
      <section id="specifications-tabs" className="mt-16 sm:mt-20 pt-10 border-t border-line space-y-10">
        <div className="text-center space-y-2">
          <p className="section-eyebrow">Boutique reference</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">
            Highlights & Specifications
          </h2>
          <div className="w-8 h-px bg-brand mx-auto mt-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-line rounded-xl p-6 luxury-shadow space-y-4">
            <h3 className="font-serif text-lg text-ink font-light flex items-center gap-2">
              <Sparkles size={16} className="text-brand" />
              Product Highlights
            </h3>
            <ul className="space-y-3">
              {HIGHLIGHTS.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white border border-line rounded-xl p-6 luxury-shadow space-y-3 text-xs text-muted font-light">
            <div className="flex justify-between border-b border-line pb-2.5">
              <span className="text-muted uppercase tracking-wider text-[0.65rem]">Precious Metal</span>
              <span className="text-ink font-semibold">{product.material}</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2.5">
              <span className="text-muted uppercase tracking-wider text-[0.65rem]">Metal Purity</span>
              <span className="text-ink font-semibold">{product.purity}</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2.5">
              <span className="text-muted uppercase tracking-wider text-[0.65rem]">Total Metal Weight</span>
              <span className="text-ink font-semibold font-mono">{product.weight} grams</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2.5">
              <span className="text-muted uppercase tracking-wider text-[0.65rem]">SKU Reference</span>
              <span className="text-ink font-semibold font-mono">{product.sku}</span>
            </div>
            <div className="flex justify-between border-b border-line pb-2.5">
              <span className="text-muted uppercase tracking-wider text-[0.65rem]">Casting Salon</span>
              <span className="text-ink font-semibold">Lukee Boutique Salon</span>
            </div>
            <div className="flex justify-between pb-1">
              <span className="text-muted uppercase tracking-wider text-[0.65rem]">Bespoke Sizing</span>
              <span className="text-ink font-semibold text-right">Complimentary Custom Engravings</span>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-2 max-w-3xl mx-auto text-center sm:text-left">
          <h3 className="font-serif text-lg text-ink font-light">The Design Narrative</h3>
          <p className="text-xs sm:text-sm text-muted leading-relaxed font-light">{product.description}</p>
        </div>
      </section>

      {/* Reviews */}
      <section id="reviews-section" className="mt-16 sm:mt-20 space-y-8">
        <div className="text-center space-y-2">
          <p className="section-eyebrow">Client voices</p>
          <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">Customer Reviews</h2>
          <div className="w-12 h-px bg-brand mx-auto mt-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DUMMY_REVIEWS.map((review) => (
            <article
              key={review.name}
              className="bg-white border border-line rounded-xl p-6 luxury-shadow space-y-3"
            >
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={
                      i < review.rating ? 'fill-brand text-brand' : 'text-line'
                    }
                  />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted leading-relaxed font-light">{review.text}</p>
              <div className="pt-2 border-t border-line flex justify-between items-center">
                <span className="text-xs font-semibold text-ink">{review.name}</span>
                <span className="text-[0.65rem] text-muted">{review.date}</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section id="related-products-section" className="mt-16 sm:mt-24 space-y-10">
          <div className="text-center space-y-2">
            <p className="section-eyebrow">You May Also Like</p>
            <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-ink">Complementary Pieces</h2>
            <div className="w-12 h-px bg-brand mx-auto mt-4" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* Recently viewed */}
      {recentItems.length > 0 && (
        <section id="recently-viewed" className="mt-16 sm:mt-20 space-y-6 border-t border-line pt-10">
          <div className="space-y-1">
            <p className="section-eyebrow">Continue browsing</p>
            <h2 className="text-xl sm:text-2xl font-serif font-semibold text-ink">Recently Viewed</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            {recentItems.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.slug}`}
                className="group flex items-center gap-3 bg-white border border-line rounded-xl px-3 py-2.5 luxury-shadow hover:border-brand transition-colors max-w-xs"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-line">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : null}
                </div>
                <span className="text-xs text-ink font-light line-clamp-2 group-hover:text-brand-dark transition-colors">
                  {item.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 backdrop-blur-md p-4">
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-6 right-6 text-white/75 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all"
            title="Close zoom"
          >
            <X size={20} />
          </button>
          <div className="max-w-4xl max-h-[90vh] overflow-auto flex justify-center">
            <img
              src={activeImage}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
};
