import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye } from 'lucide-react';
import { Product } from '../types.js';
import { useCart } from '../contexts/CartContext.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const mainImage =
    product.images?.[0] ||
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80';
  const hoverImage = product.images?.[1] || mainImage;
  const isOnSale =
    product.salePrice !== undefined &&
    product.salePrice !== null &&
    product.salePrice < product.price;

  return (
    <div
      id={`product-${product._id}`}
      className="group relative flex flex-col bg-white overflow-hidden rounded-2xl border border-gold-200/80 luxury-shadow transition-all duration-500 hover:-translate-y-1 hover:luxury-shadow-lg"
    >
      <div className="relative aspect-[4/5] w-full bg-[#F3EEE6] overflow-hidden rounded-t-2xl">
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
            <span className="bg-gold-500 text-[#1A1A1A] font-sans text-[0.65rem] font-semibold tracking-[0.18em] px-2.5 py-1 uppercase">
              Sale
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-[#1A1A1A] text-white font-sans text-[0.65rem] font-semibold tracking-[0.18em] px-2.5 py-1 uppercase">
              Best Seller
            </span>
          )}
          {product.newArrival && (
            <span className="bg-white/95 text-gold-700 font-sans text-[0.65rem] font-semibold tracking-[0.18em] px-2.5 py-1 uppercase border border-gold-200">
              New
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-[#1A1A1A]/0 group-hover:bg-[#1A1A1A]/15 transition-colors duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/product/${product.slug}`}
            className="p-3 bg-white text-[#1A1A1A] shadow-md opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-gold-500 hover:text-white"
            title="View Details"
          >
            <Eye size={18} />
          </Link>
          {product.stock > 0 ? (
            <button
              type="button"
              onClick={() => addToCart(product, 1)}
              className="p-3 bg-white text-[#1A1A1A] shadow-md opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 delay-75 hover:bg-gold-500 hover:text-white"
              title="Add to Bag"
            >
              <ShoppingBag size={18} />
            </button>
          ) : (
            <span className="bg-[#1A1A1A]/90 text-white text-[0.6rem] uppercase tracking-[0.18em] px-4 py-2 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow text-center bg-white">
        <span className="text-[0.65rem] font-sans tracking-[0.2em] text-gold-500 uppercase font-medium mb-1.5">
          {product.material} · {product.purity}
        </span>

        <h3 className="font-serif text-lg text-[#1A1A1A] line-clamp-1 mb-2 font-light hover:text-gold-600 transition-colors">
          <Link to={`/product/${product.slug}`}>{product.name}</Link>
        </h3>

        <span className="text-[0.6rem] font-mono tracking-widest text-gray-400 uppercase mb-3 block">
          SKU: {product.sku}
        </span>

        <div className="mt-auto flex justify-center items-baseline space-x-2">
          {isOnSale ? (
            <>
              <span className="font-sans text-sm text-gold-600 font-semibold tracking-wide">
                ₹{product.salePrice?.toLocaleString('en-IN')}
              </span>
              <span className="font-sans text-xs text-gray-400 line-through">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
            </>
          ) : (
            <span className="font-sans text-sm text-[#1A1A1A] font-semibold tracking-wide">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
