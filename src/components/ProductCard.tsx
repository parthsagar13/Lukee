import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart, Star } from 'lucide-react';
import { Product } from '../types.js';
import { useCart } from '../contexts/CartContext.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [wishlisted, setWishlisted] = useState(false);

  const mainImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80';
  const hoverImage = product.images?.[1] || mainImage;
  const isOnSale =
    product.salePrice !== undefined &&
    product.salePrice !== null &&
    product.salePrice < product.price;
  const discountPct = isOnSale
    ? Math.round(((product.price - (product.salePrice || 0)) / product.price) * 100)
    : 0;

  const ratingSeed = (product.sku || product._id || 'x').charCodeAt(0) % 10;
  const rating = 4 + (ratingSeed % 10) / 10;
  const reviewCount = 12 + (ratingSeed * 7) % 80;

  return (
    <div className="group relative flex flex-col bg-white overflow-hidden rounded-xl border border-line luxury-shadow transition-all duration-300 hover:-translate-y-1 hover:luxury-shadow-lg">
      <div className="relative aspect-[4/5] w-full bg-surface overflow-hidden rounded-t-xl">
        <img
          src={mainImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-500 group-hover:opacity-0"
        />
        <img
          src={hoverImage}
          alt=""
          aria-hidden
          referrerPolicy="no-referrer"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-0 scale-105 transition-all duration-700 group-hover:opacity-100 group-hover:scale-100"
        />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOnSale && (
            <span className="bg-brand text-white font-sans text-[11px] font-bold tracking-[0.3px] px-2.5 py-1 rounded-full">
              −{discountPct}%
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-btn-dark text-white font-sans text-[11px] font-bold tracking-[0.3px] px-2.5 py-1 rounded-full">
              Best Seller
            </span>
          )}
          {product.newArrival && !product.bestSeller && (
            <span className="bg-brand-soft text-brand-dark font-sans text-[11px] font-bold tracking-[0.3px] px-2.5 py-1 rounded-full">
              New
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => setWishlisted((v) => !v)}
          className={`absolute top-3 right-3 z-10 p-2.5 rounded-full bg-white luxury-shadow transition-colors ${
            wishlisted ? 'text-brand' : 'text-muted hover:text-brand'
          }`}
          aria-label="Wishlist"
        >
          <Heart size={15} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 z-10">
          <Link
            to={`/product/${product.slug}`}
            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white text-ink py-2.5 text-[12px] font-bold rounded-lg hover:bg-brand-soft hover:text-brand-dark transition-colors"
          >
            <Eye size={13} />
            View
          </Link>
          {product.stock > 0 ? (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 bg-brand text-white py-2.5 text-[12px] font-bold rounded-lg hover:bg-brand-dark transition-colors"
            >
              <ShoppingBag size={13} />
              Add
            </button>
          ) : (
            <span className="flex-1 text-center bg-btn-dark/80 text-white py-2.5 text-[12px] font-bold rounded-lg">
              Sold Out
            </span>
          )}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow text-left">
        <span className="text-[11px] font-sans tracking-[0.4px] text-brand-dark uppercase font-bold mb-1">
          {product.material} · {product.purity}
        </span>

        <h3 className="font-serif text-[17px] text-ink line-clamp-1 mb-1.5 font-semibold group-hover:text-brand transition-colors">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        <div className="flex items-center gap-1.5 mb-3">
          <Star size={12} className="text-brand fill-brand" />
          <span className="text-xs text-ink font-bold">{rating.toFixed(1)}</span>
          <span className="text-[12px] text-muted">({reviewCount})</span>
        </div>

        <div className="mt-auto flex items-baseline gap-2">
          {isOnSale ? (
            <>
              <span className="font-sans text-[15px] text-ink font-bold">
                ₹{product.salePrice?.toLocaleString('en-IN')}
              </span>
              <span className="font-sans text-xs text-muted line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="font-sans text-[15px] text-ink font-bold">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
