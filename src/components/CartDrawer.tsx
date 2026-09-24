import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.js';
import { formatInr } from '../lib/razorpayClient.js';

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartCount,
  } = useCart();
  const navigate = useNavigate();
  const [coupon, setCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState('');

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const freeShippingThreshold = 2500;
  const total = getCartTotal();
  const isFreeShipping = total >= freeShippingThreshold;
  const shippingRemaining = freeShippingThreshold - total;
  const shippingFee = isFreeShipping ? 0 : 50;

  const applyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === 'LUKEE5') {
      setCouponMsg('Code noted — discount applies at checkout where eligible.');
    } else if (coupon.trim()) {
      setCouponMsg('This code is not active. Try LUKEE5 for demo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={closeCart} />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-[0_12px_28px_rgba(0,0,0,0.2)] flex flex-col border-l border-line">
          <div className="px-6 py-5 border-b border-line flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <ShoppingBag size={18} className="text-brand" />
              <h2 className="text-sm font-bold tracking-[0.3px] text-ink">
                Your Bag ({getCartCount()})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2.5 rounded-lg text-muted hover:text-ink hover:bg-surface"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <ShoppingBag size={48} className="mx-auto text-brand/30 stroke-1" />
                <p className="text-sm text-muted">Your bag is empty.</p>
                <button onClick={closeCart} className="btn-ghost">
                  Continue shopping
                </button>
              </div>
            ) : (
              <>
                <div className="bg-brand-soft p-4 border border-brand/20 rounded-xl">
                  {isFreeShipping ? (
                    <p className="text-xs text-brand-dark text-center font-bold">
                      Complimentary insured delivery unlocked.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted text-center">
                        Add{' '}
                        <span className="font-bold text-brand-dark">{formatInr(shippingRemaining)}</span>{' '}
                        more for free insured delivery.
                      </p>
                      <div className="w-full bg-white h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-brand h-full transition-all duration-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (total / freeShippingThreshold) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="divide-y divide-line">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="py-4 flex gap-4">
                      <Link
                        to={`/product/${item.product.slug}`}
                        onClick={closeCart}
                        className="w-20 h-20 bg-surface flex-shrink-0 border border-line rounded-xl overflow-hidden"
                      >
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex-1 flex flex-col min-w-0">
                        <div className="flex justify-between gap-2">
                          <Link
                            to={`/product/${item.product.slug}`}
                            onClick={closeCart}
                            className="font-serif text-[15px] font-semibold text-ink line-clamp-1 hover:text-brand"
                          >
                            {item.product.name}
                          </Link>
                          <span className="text-sm font-bold text-ink whitespace-nowrap">
                            {formatInr(
                              (item.product.salePrice ?? item.product.price) * item.quantity
                            )}
                          </span>
                        </div>
                        <span className="text-[11px] text-brand-dark uppercase tracking-wider font-bold mt-0.5">
                          {item.product.material}
                        </span>
                        <div className="flex justify-between items-center mt-auto pt-2">
                          <div className="flex items-center border border-line rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              className="p-2 text-muted hover:bg-surface"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs w-6 text-center font-bold">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              className="p-2 text-muted hover:bg-surface"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product._id)}
                            className="text-muted hover:text-red-500 p-2 rounded-lg"
                            aria-label="Remove"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={applyCoupon} className="space-y-2">
                  <label className="text-[11px] uppercase tracking-[0.8px] text-muted flex items-center gap-1.5 font-bold">
                    <Tag size={12} /> Coupon
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter code"
                      className="input-luxury flex-1 !py-2.5"
                    />
                    <button type="submit" className="btn-secondary !px-4 !py-2.5">
                      Apply
                    </button>
                  </div>
                  {couponMsg && <p className="text-[12px] text-brand-dark font-medium">{couponMsg}</p>}
                </form>

                <div className="bg-surface border border-line rounded-xl p-4">
                  <p className="text-[11px] uppercase tracking-[0.8px] text-muted mb-1 font-bold">
                    Estimated delivery
                  </p>
                  <p className="text-sm text-ink font-medium">3–5 business days · Insured courier</p>
                </div>
              </>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="px-6 py-6 border-t border-line bg-surface space-y-3">
              <div className="flex justify-between text-xs uppercase tracking-wider text-muted font-bold">
                <span>Subtotal</span>
                <span className="text-ink">{formatInr(total)}</span>
              </div>
              <div className="flex justify-between text-xs uppercase tracking-wider text-muted font-bold">
                <span>Delivery</span>
                <span className="text-brand-dark">
                  {isFreeShipping ? 'Complimentary' : formatInr(shippingFee)}
                </span>
              </div>
              <div className="border-t border-dashed border-line pt-3 flex justify-between items-center">
                <span className="text-xs uppercase tracking-[0.8px] font-bold text-ink">Total</span>
                <span className="text-lg font-bold text-ink">{formatInr(total + shippingFee)}</span>
              </div>
              <button type="button" onClick={handleCheckout} className="w-full btn-primary mt-1">
                Checkout
                <ArrowRight size={14} />
              </button>
              <button
                type="button"
                onClick={closeCart}
                className="w-full text-center text-xs font-bold tracking-[0.4px] text-muted hover:text-brand py-2"
              >
                Continue shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
