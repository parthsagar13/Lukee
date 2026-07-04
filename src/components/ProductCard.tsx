import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { Product } from '../types.js';
import { useCart } from '../contexts/CartContext.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  // Use first image as main, fallback if empty
  const mainImage = product.images?.[0] || 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80';
  const hoverImage = product.images?.[1] || mainImage;

  const isOnSale = product.salePrice !== undefined && product.salePrice !== null && product.salePrice < product.price;

  return (
    <div id={`product-${product._id}`} className="group relative flex flex-col bg-[#FDFCFB] overflow-hidden border border-gold-200 luxury-shadow transition-all duration-300 hover:shadow-lg">
      {/* Image Container with Hover Overlay */}
      <div className="relative aspect-[4/5] w-full bg-[#F9F6F2] overflow-hidden">
        {/* Main Product Image */}
        <img
          src={mainImage}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Floating Custom luxury Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          {isOnSale && (
            <span className="bg-gold-500 text-white font-sans text-[0.65rem] font-semibold tracking-widest px-2.5 py-1 uppercase rounded-sm">
              Sale
            </span>
          )}
          {product.bestSeller && (
            <span className="bg-[#1A1A1A] text-white font-sans text-[0.65rem] font-semibold tracking-widest px-2.5 py-1 uppercase rounded-sm">
              Best Seller
            </span>
          )}
          {product.newArrival && (
            <span className="bg-gold-100 text-gold-700 font-sans text-[0.65rem] font-semibold tracking-widest px-2.5 py-1 uppercase rounded-sm border border-gold-200">
              New
            </span>
          )}
        </div>

        {/* Hover Quick Action Buttons */}
        <div className="absolute inset-0 bg-[#1A1A1A]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Link
            to={`/product/${product.slug}`}
            className="p-3 bg-[#FDFCFB] text-gray-800 rounded-full shadow-md hover:bg-gold-100 hover:text-gold-500 transition-all duration-200 transform translate-y-4 group-hover:translate-y-0"
            title="View Details"
          >
            <Eye size={18} />
          </Link>
          {product.stock > 0 ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="p-3 bg-[#FDFCFB] text-gray-800 rounded-full shadow-md hover:bg-gold-500 hover:text-white transition-all duration-200 transform translate-y-4 group-hover:translate-y-0 delay-75"
              title="Add to Bag"
            >
              <ShoppingBag size={18} />
            </button>
          ) : (
            <span className="bg-[#1A1A1A]/90 text-white text-[0.6rem] uppercase tracking-widest px-4 py-2 font-semibold font-sans rounded-sm">
              Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Product Information */}
      <div className="p-5 flex flex-col flex-grow text-center bg-[#FDFCFB]">
        {/* Material & Purity tag */}
        <span className="text-[0.65rem] font-sans tracking-[0.2em] text-gold-500 uppercase font-semibold mb-1.5">
          {product.material} &bull; {product.purity}
        </span>

        {/* Title */}
        <h3 className="font-serif text-base text-[#1A1A1A] line-clamp-1 mb-2 hover:text-gold-500 transition-colors">
          <Link to={`/product/${product.slug}`}>
            {product.name}
          </Link>
        </h3>

        {/* SKU (Fine technical touch) */}
        <span className="text-[0.6rem] font-mono tracking-widest text-gray-400 uppercase mb-3 block">
          SKU: {product.sku}
        </span>

        {/* Price Tag */}
        <div className="mt-auto flex justify-center items-baseline space-x-2">
          {isOnSale ? (
            <>
              <span className="font-serif text-base text-gold-500 font-semibold">
                ${product.salePrice?.toLocaleString()}
              </span>
              <span className="font-serif text-xs text-gray-400 line-through">
                ${product.price.toLocaleString()}
              </span>
            </>
          ) : (
            <span className="font-serif text-base text-[#1A1A1A] font-semibold">
              ${product.price.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
