import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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

  if (!isCartOpen) return null;

  const handleCheckout = () => {
    closeCart();
    navigate('/checkout');
  };

  const freeShippingThreshold = 2500;
  const total = getCartTotal();
  const isFreeShipping = total >= freeShippingThreshold;
  const shippingRemaining = freeShippingThreshold - total;

  return (
    <div id="cart-drawer-overlay" className="fixed inset-0 z-50 overflow-hidden font-sans">
      <div
        className="absolute inset-0 bg-[#11100e]/40 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex">
        <div id="cart-drawer-panel" className="w-screen max-w-md bg-[#FDFCFB] shadow-2xl flex flex-col border-l border-gold-200">
          <div className="px-6 py-5 border-b border-gold-200 flex justify-between items-center bg-[#F9F6F2]">
            <div className="flex items-center space-x-2.5">
              <ShoppingBag size={18} className="text-gold-500" />
              <h2 className="text-sm uppercase tracking-widest text-[#1A1A1A] font-bold">
                Your Shopping Bag ({getCartCount()})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-20 space-y-4 text-gray-400">
                <ShoppingBag size={48} className="mx-auto text-gold-200 stroke-1" />
                <p className="text-sm font-light">Your luxury cart is currently empty.</p>
                <button
                  onClick={closeCart}
                  className="text-xs uppercase tracking-widest text-gold-500 hover:text-gold-600 font-bold border-b border-gold-300 pb-0.5"
                >
                  Browse our Collections
                </button>
              </div>
            ) : (
              <>
                <div className="bg-[#F9F6F2] p-4 border border-gold-200 rounded-sm">
                  {isFreeShipping ? (
                    <p className="text-xs text-gold-800 text-center font-semibold tracking-wide">
                      Your order qualifies for Free Fully Insured Courier Shipping!
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-600 text-center font-light">
                        Add{' '}
                        <span className="font-semibold text-gold-500">
                          {formatInr(shippingRemaining)}
                        </span>{' '}
                        more to qualify for{' '}
                        <span className="font-semibold text-gold-500">
                          Free Insured Courier Delivery
                        </span>
                        .
                      </p>
                      <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                        <div
                          className="bg-gold-500 h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (total / freeShippingThreshold) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="divide-y divide-gold-200">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="py-4 flex space-x-4">
                      <div className="w-20 h-20 bg-[#F9F6F2] flex-shrink-0 border border-gold-200 rounded-sm overflow-hidden">
                        <img
                          src={item.product.images?.[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between text-xs font-serif text-[#1A1A1A]">
                          <h4 className="font-semibold line-clamp-1 max-w-[180px] hover:text-gold-500">
                            <a href={`/product/${item.product.slug}`} onClick={closeCart}>
                              {item.product.name}
                            </a>
                          </h4>
                          <span className="font-mono font-semibold">
                            {formatInr(
                              (item.product.salePrice ?? item.product.price) * item.quantity
                            )}
                          </span>
                        </div>
                        <span className="text-[0.65rem] text-gold-500 uppercase font-semibold mt-0.5">
                          {item.product.material}
                        </span>

                        <div className="flex justify-between items-center mt-auto">
                          <div className="flex items-center border border-gold-200 rounded-sm">
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                              className="p-1 text-gray-500 hover:bg-gold-100/50"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-xs text-gray-700 w-6 text-center font-mono">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                              className="p-1 text-gray-500 hover:bg-gold-100/50"
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus size={12} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product._id)}
                            className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="px-6 py-6 border-t border-gold-200 bg-[#F9F6F2] space-y-4">
              <div className="flex justify-between text-xs tracking-wider uppercase text-gray-500 font-medium">
                <span>Subtotal</span>
                <span className="font-mono text-sm text-[#1A1A1A] font-semibold">
                  {formatInr(total)}
                </span>
              </div>
              <div className="flex justify-between text-xs tracking-wider uppercase text-gray-500 font-medium">
                <span>Courier Delivery</span>
                <span className="font-sans text-xs text-emerald-600 font-semibold">
                  {isFreeShipping ? 'COMPLIMENTARY' : formatInr(50)}
                </span>
              </div>
              <div className="border-t border-dashed border-gold-200 pt-3 flex justify-between text-xs tracking-widest uppercase text-[#1A1A1A] font-bold">
                <span>Order Total</span>
                <span className="font-mono text-base text-gold-500 font-bold">
                  {formatInr(total + (isFreeShipping ? 0 : 50))}
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleCheckout}
                  className="w-full bg-[#1A1A1A] text-white py-3.5 px-4 text-xs tracking-widest uppercase font-bold hover:bg-gold-500 transition-all duration-300 flex items-center justify-center space-x-2 rounded-sm"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </button>
              </div>
              <p className="text-[0.65rem] text-center text-gray-400 font-light italic">
                Secure checkout with Razorpay. Reservations are fully insured during courier dispatch.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
