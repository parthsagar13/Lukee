import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Loader2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext.js';
import type { ShippingAddress } from '../types.js';
import {
  createPaymentOrder,
  formatInr,
  loadRazorpayScript,
  markPaymentFailed,
  verifyPayment,
} from '../lib/razorpayClient.js';
import { FREE_SHIPPING_THRESHOLD, FLAT_SHIPPING_FEE } from '../services/checkoutPricing.js';

const emptyAddress: ShippingAddress = {
  fullName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
};

export const Checkout: React.FC = () => {
  const { cartItems, getCartTotal, clearCart, closeCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getCartTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shipping;

  const canPay = useMemo(() => {
    return (
      cartItems.length > 0 &&
      address.fullName.trim() &&
      address.email.trim() &&
      address.phone.trim() &&
      address.addressLine1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.postalCode.trim() &&
      address.country.trim() &&
      !paying
    );
  }, [address, cartItems.length, paying]);

  const updateField = (key: keyof ShippingAddress, value: string) => {
    setAddress((prev) => ({ ...prev, [key]: value }));
  };

  const handlePay = async () => {
    if (!canPay) return;
    setError(null);
    setPaying(true);
    closeCart();

    let razorpayOrderId: string | undefined;

    try {
      await loadRazorpayScript();

      const orderPayload = await createPaymentOrder({
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress: address,
      });

      razorpayOrderId = orderPayload.razorpayOrderId;

      if (!window.Razorpay) {
        throw new Error('Razorpay Checkout failed to initialize.');
      }

      const rzp = new window.Razorpay({
        key: orderPayload.keyId,
        amount: orderPayload.razorpayAmountPaise,
        currency: orderPayload.currency,
        name: 'Lukee Jewels',
        description: `Order ${orderPayload.invoiceNumber}`,
        order_id: orderPayload.razorpayOrderId,
        prefill: orderPayload.prefill,
        notes: orderPayload.notes,
        theme: { color: '#C5A059' },
        handler: async (response: unknown) => {
          try {
            const raw = response as {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            };
            const verified = await verifyPayment({
              razorpay_order_id: raw.razorpay_order_id,
              razorpay_payment_id: raw.razorpay_payment_id,
              razorpay_signature: raw.razorpay_signature,
            });
            sessionStorage.setItem(
              `lukee_payment_${verified.order._id}`,
              verified.payment.razorpayPaymentId || verified.payment._id
            );
            clearCart();
            navigate(
              `/order-success/${verified.order._id}?email=${encodeURIComponent(verified.order.shippingAddress.email)}`,
              { replace: true }
            );
          } catch (verifyErr) {
            setError(verifyErr instanceof Error ? verifyErr.message : 'Verification failed.');
            setPaying(false);
          }
        },
        modal: {
          ondismiss: async () => {
            if (razorpayOrderId) {
              await markPaymentFailed(razorpayOrderId);
            }
            setPaying(false);
            setError('Payment was cancelled. You can retry when ready.');
          },
        },
      });

      rzp.on('payment.failed', async () => {
        if (razorpayOrderId) {
          await markPaymentFailed(razorpayOrderId);
        }
        setPaying(false);
        setError('Payment failed. Please try again with another method.');
      });

      rzp.open();
    } catch (err) {
      if (razorpayOrderId) {
        await markPaymentFailed(razorpayOrderId);
      }
      setError(err instanceof Error ? err.message : 'Unable to start payment.');
      setPaying(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h1 className="font-serif text-3xl text-[#1A1A1A]">Your bag is empty</h1>
        <p className="text-sm text-gray-500">Add pieces from the shop before checking out.</p>
        <Link
          to="/shop"
          className="inline-block bg-[#1A1A1A] text-white px-6 py-3 text-xs uppercase tracking-widest hover:bg-gold-500 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
      <Link
        to="/shop"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gray-500 hover:text-gold-500 mb-8"
      >
        <ArrowLeft size={14} />
        Back to Shop
      </Link>

      <h1 className="font-serif text-3xl md:text-4xl text-[#1A1A1A] mb-2">Checkout</h1>
      <p className="text-xs uppercase tracking-widest text-gold-500 mb-10">
        Secure payment powered by Razorpay
      </p>

      <div className="grid lg:grid-cols-5 gap-10">
        <div className="lg:col-span-3 space-y-6">
          <section className="border border-gold-200 bg-white p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]">
              Shipping Address
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {(
                [
                  ['fullName', 'Full Name'],
                  ['email', 'Email'],
                  ['phone', 'Phone'],
                  ['addressLine1', 'Address Line 1'],
                  ['addressLine2', 'Address Line 2 (optional)'],
                  ['city', 'City'],
                  ['state', 'State'],
                  ['postalCode', 'Postal Code'],
                  ['country', 'Country'],
                ] as const
              ).map(([key, label]) => (
                <label
                  key={key}
                  className={`block text-xs space-y-1.5 ${
                    key === 'addressLine1' || key === 'addressLine2' ? 'sm:col-span-2' : ''
                  }`}
                >
                  <span className="uppercase tracking-wider text-gray-500">{label}</span>
                  <input
                    type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                    value={address[key] || ''}
                    onChange={(e) => updateField(key, e.target.value)}
                    className="w-full border border-gold-200 bg-[#FDFCFB] px-3 py-2.5 text-sm text-[#1A1A1A] focus:outline-none focus:border-gold-500"
                    required={key !== 'addressLine2'}
                  />
                </label>
              ))}
            </div>
          </section>

          {error && (
            <div className="border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
              {error}
              <button
                type="button"
                onClick={() => setError(null)}
                className="ml-3 underline text-xs uppercase tracking-wider"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <aside className="lg:col-span-2">
          <div className="border border-gold-200 bg-[#F9F6F2] p-6 space-y-5 sticky top-28">
            <h2 className="text-xs uppercase tracking-widest font-bold text-[#1A1A1A]">
              Order Review
            </h2>
            <ul className="space-y-3 max-h-64 overflow-y-auto divide-y divide-gold-200">
              {cartItems.map((item) => {
                const price = item.product.salePrice ?? item.product.price;
                return (
                  <li key={item.product._id} className="pt-3 first:pt-0 flex justify-between gap-3 text-sm">
                    <div>
                      <p className="font-serif text-[#1A1A1A]">{item.product.name}</p>
                      <p className="text-[0.65rem] uppercase tracking-wider text-gray-500">
                        Qty {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono text-xs whitespace-nowrap">
                      {formatInr(price * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-2 text-xs uppercase tracking-wider text-gray-500 border-t border-gold-200 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-[#1A1A1A]">{formatInr(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono text-[#1A1A1A]">
                  {shipping === 0 ? 'Complimentary' : formatInr(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-[#1A1A1A] font-bold pt-2 border-t border-dashed border-gold-200">
                <span>Total</span>
                <span className="font-mono text-gold-500 text-base">{formatInr(total)}</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!canPay}
              onClick={handlePay}
              className="w-full bg-[#1A1A1A] text-white py-3.5 text-xs uppercase tracking-widest font-bold hover:bg-gold-500 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {paying ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Processing…
                </>
              ) : (
                <>
                  <Lock size={14} />
                  Pay Securely
                </>
              )}
            </button>
            <p className="text-[0.65rem] text-center text-gray-400 leading-relaxed">
              Amounts are recalculated on the server. Never trust client totals.
              Free insured shipping on orders {formatInr(FREE_SHIPPING_THRESHOLD)}+.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
};
