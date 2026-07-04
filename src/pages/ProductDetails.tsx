import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Star, Share2, ShieldCheck, Truck, RefreshCw, ZoomIn, X, ChevronRight } from 'lucide-react';
import { Product, Category } from '../types.js';
import { useCart } from '../contexts/CartContext.js';
import { ProductCard } from '../components/ProductCard.js';

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

        // Fetch category
        const catRes = await fetch(`/api/categories/${prodData.category}`);
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategory(catData);
        }

        // Fetch related products in same category
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
    return <div className="text-center py-40 text-gray-400 text-xs tracking-widest font-sans uppercase">Opening Vault...</div>;
  }

  if (!product) {
    return <div className="text-center py-40 text-gray-400 text-xs tracking-widest font-sans uppercase">Product not found.</div>;
  }

  const isOnSale = product.salePrice !== undefined && product.salePrice !== null && product.salePrice < product.price;
  const effectivePrice = isOnSale ? product.salePrice! : product.price;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  return (
    <div id="product-details-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
      
      {/* 1. Breadcrumbs */}
      <nav id="breadcrumbs" className="flex items-center space-x-2 text-[0.7rem] text-gray-400 uppercase tracking-widest mb-10 overflow-x-auto whitespace-nowrap">
        <Link to="/" className="hover:text-gold-500 transition-colors">Home</Link>
        <ChevronRight size={10} className="text-gray-300" />
        <Link to="/shop" className="hover:text-gold-500 transition-colors">Shop</Link>
        {category && (
          <>
            <ChevronRight size={10} className="text-gray-300" />
            <Link to={`/shop?category=${category.slug}`} className="hover:text-gold-500 transition-colors">{category.name}</Link>
          </>
        )}
        <ChevronRight size={10} className="text-gray-300" />
        <span className="text-[#1A1A1A] font-light truncate">{product.name}</span>
      </nav>

      {/* 2. Main Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Left Side: Dynamic Gallery Showcase */}
        <div id="product-gallery" className="space-y-4">
          <div className="relative aspect-square bg-[#F9F6F2] border border-gold-200 overflow-hidden group rounded-sm">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            {/* Zoom Button Trigger */}
            <button
              onClick={() => setIsZoomOpen(true)}
              className="absolute top-4 right-4 bg-[#FDFCFB]/90 p-2.5 rounded-full shadow-md text-gray-600 hover:text-gold-500 hover:bg-[#FDFCFB] transition-all"
              title="Zoom Image"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Thumbnails list */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
              {product.images.map((imgUrl, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(imgUrl)}
                  className={`w-20 h-20 bg-[#F9F6F2] border flex-shrink-0 transition-all rounded-sm overflow-hidden ${
                    activeImage === imgUrl ? 'border-gold-500 ring-1 ring-gold-200' : 'border-gold-200 hover:border-gold-400'
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

        {/* Right Side: Product Details & Purchase controls */}
        <div id="product-actions-pane" className="space-y-6">
          
          {/* Header specs */}
          <div className="space-y-2">
            <span className="text-xs tracking-[0.3em] text-gold-500 uppercase font-semibold block">
              {product.material} &bull; {product.purity}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1A1A1A] leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <span className="font-mono">SKU: {product.sku}</span>
              <span>&bull;</span>
              <div className="flex items-center space-x-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-gold-500 text-gold-500" />
                  ))}
                </div>
                <span className="text-gray-500 font-mono">(4.9)</span>
              </div>
            </div>
          </div>

          {/* Price Box */}
          <div className="bg-[#F9F6F2] border-y border-gold-200 py-4 px-3.5 flex items-center space-x-4">
            {isOnSale ? (
              <>
                <span className="font-serif text-2xl sm:text-3xl text-gold-500 font-semibold">
                  ${product.salePrice?.toLocaleString()}
                </span>
                <span className="font-serif text-base text-gray-400 line-through">
                  ${product.price.toLocaleString()}
                </span>
                <span className="bg-gold-100 text-gold-700 text-[0.65rem] tracking-wider uppercase font-semibold px-2 py-0.5 rounded-sm border border-gold-200">
                  Save ${(product.price - product.salePrice!).toLocaleString()}
                </span>
              </>
            ) : (
              <span className="font-serif text-2xl sm:text-3xl text-[#1A1A1A] font-semibold">
                ${product.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Short description */}
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light font-sans">
            {product.shortDescription || 'An exquisite, masterfully finished bespoke piece designed with attention to every facet and polished standard.'}
          </p>

          {/* Buying & Quantity Selectors */}
          <div className="space-y-4 pt-2">
            {product.stock > 0 ? (
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Quantity select */}
                <div className="flex items-center border border-gold-200 h-12 w-full sm:w-32 justify-between px-4 bg-[#FDFCFB] rounded-sm">
                  <button
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="text-gray-500 hover:text-gold-500 text-lg font-bold"
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="font-mono text-sm text-[#1A1A1A] w-8 text-center font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="text-gray-500 hover:text-gold-500 text-lg font-bold"
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>

                {/* Add to Bag Button */}
                <button
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest font-semibold hover:bg-gold-500 hover:text-white h-12 flex items-center justify-center space-x-2.5 transition-all duration-300 rounded-sm"
                >
                  <ShoppingBag size={14} />
                  <span>Add To Shopping Bag</span>
                </button>
              </div>
            ) : (
              <div className="bg-[#1A1A1A]/5 p-4 text-center border border-gold-200 rounded-sm">
                <span className="text-xs uppercase tracking-widest text-[#1A1A1A] font-semibold">
                  Currently Out of Stock
                </span>
                <p className="text-[0.65rem] text-gray-500 font-light mt-1">
                  Contact our boutique concierge team to reserve subsequent casting editions.
                </p>
              </div>
            )}

            {/* Subtext info */}
            {product.stock > 0 && (
              <p className="text-[0.65rem] text-gray-400 font-light italic">
                Only {product.stock} items remaining in our New York boutique vaults.
              </p>
            )}
          </div>

          {/* Trust assurances block */}
          <div className="space-y-3 pt-4 border-t border-gold-200 text-xs text-gray-600 font-light">
            <div className="flex items-center space-x-3">
              <Truck size={16} className="text-gold-500 flex-shrink-0" />
              <span>Free fully insured express delivery worldwide. Dispatched in 2-4 days.</span>
            </div>
            <div className="flex items-center space-x-3">
              <RefreshCw size={16} className="text-gold-500 flex-shrink-0" />
              <span>30-Day complimentary returns or exchanges with free insured pickup.</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck size={16} className="text-gold-500 flex-shrink-0" />
              <span>Accompanied by a Lukee Jewels Authenticity Certificate & gem report.</span>
            </div>
          </div>

          {/* Social and Share button */}
          <div className="flex items-center space-x-4 pt-4 border-t border-gold-200">
            <span className="text-[0.65rem] uppercase tracking-widest text-gray-400 font-light">Share Design:</span>
            <button
              onClick={handleShare}
              className="text-gray-500 hover:text-gold-500 transition-colors flex items-center space-x-1.5 text-xs font-semibold"
              title="Copy URL link"
            >
              <Share2 size={14} />
              <span>{copiedShare ? 'Copied link!' : 'Copy Link'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. Detailed Specifications Accordion / Tab */}
      <section id="specifications-tabs" className="mt-20 pt-10 border-t border-gold-200 max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-light">Technical Specifications</h2>
          <p className="text-[0.7rem] text-gray-400 uppercase tracking-widest">Boutique reference and certified details</p>
          <div className="w-8 h-[1px] bg-gold-500 mx-auto mt-2"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-gray-600 font-light">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gold-200 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[0.65rem]">Precious Metal</span>
              <span className="text-[#1A1A1A] font-semibold">{product.material}</span>
            </div>
            <div className="flex justify-between border-b border-gold-200 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[0.65rem]">Metal Purity</span>
              <span className="text-[#1A1A1A] font-semibold">{product.purity}</span>
            </div>
            <div className="flex justify-between border-b border-gold-200 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[0.65rem]">Total Metal Weight</span>
              <span className="text-[#1A1A1A] font-semibold font-mono">{product.weight} grams</span>
            </div>
          </div>
          {/* Col 2 */}
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gold-200 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[0.65rem]">Unique SKU reference</span>
              <span className="text-[#1A1A1A] font-semibold font-mono">{product.sku}</span>
            </div>
            <div className="flex justify-between border-b border-gold-200 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[0.65rem]">Casting Salon</span>
              <span className="text-[#1A1A1A] font-semibold">Lukee Boutique Salon, NY</span>
            </div>
            <div className="flex justify-between border-b border-gold-200 pb-2">
              <span className="text-gray-400 uppercase tracking-wider text-[0.65rem]">Bespoke Sizing</span>
              <span className="text-[#1A1A1A] font-semibold">Complimentary Custom Engravings Included</span>
            </div>
          </div>
        </div>

        {/* Main description paragraph */}
        <div className="space-y-4 pt-6 border-t border-gold-200">
          <h3 className="font-serif text-lg text-[#1A1A1A] font-light">The Design Narrative</h3>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-light font-sans">
            {product.description}
          </p>
        </div>
      </section>

      {/* 4. Related Products Grid */}
      {relatedProducts.length > 0 && (
        <section id="related-products-section" className="mt-24 space-y-10">
          <div className="text-center space-y-2">
            <span className="text-xs tracking-[0.3em] text-gold-500 uppercase font-medium">You May Also Like</span>
            <h2 className="text-2xl sm:text-3xl font-light">Complementary Pieces</h2>
            <div className="w-12 h-[1px] bg-gold-400 mx-auto mt-4"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((prod) => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </section>
      )}

      {/* 5. Fullscreen Lightbox Zoom Modal */}
      {isZoomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
          <button
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
              className="max-w-full max-h-[85vh] object-contain rounded-sm"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

    </div>
  );
};
