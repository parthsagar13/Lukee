import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, Loader2, ShieldCheck, BadgeCheck, Truck } from 'lucide-react';
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

const STEPS = [
  { id: 1, label: 'Bag' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Pay' },
] as const;

export const Checkout: React.FC = () => {
  const { cartItems, getCartTotal, clearCart, closeCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = getCartTotal();
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal + shipping;

  const addressComplete = useMemo(() => {
    return !!(
      address.fullName.trim() &&
      address.email.trim() &&
      address.phone.trim() &&
      address.addressLine1.trim() &&
      address.city.trim() &&
      address.state.trim() &&
      address.postalCode.trim() &&
      address.country.trim()
    );
  }, [address]);

  const activeStep = paying ? 3 : addressComplete ? 2 : 1;

  const canPay = useMemo(() => {
    return cartItems.length > 0 && addressComplete && !paying;
  }, [addressComplete, cartItems.length, paying]);

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
        theme: { color: '#232c57' },
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
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-5">
          <p className="section-eyebrow">Checkout</p>
          <h1 className="font-serif text-3xl sm:text-4xl text-ivory font-light">Your bag is empty</h1>
          <p className="text-sm text-muted">Add pieces from the shop before checking out.</p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="text-ivory min-h-[60vh]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted hover:text-brand mb-8 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Shop
        </Link>

        <div className="text-center sm:text-left mb-10 space-y-2">
          <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ivory">Checkout</h1>
          <p className="section-eyebrow">Secure payment powered by Razorpay</p>
        </div>

        {/* Progress: Bag → Review → Pay */}
        <nav aria-label="Checkout progress" className="mb-12">
          <ol className="flex items-center justify-center sm:justify-start gap-0 max-w-lg">
            {STEPS.map((step, idx) => {
              const done = activeStep > step.id;
              const current = activeStep === step.id;
              return (
                <li key={step.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={`w-9 h-9 flex items-center justify-center text-xs font-semibold tracking-wider border transition-colors ${
                        done || current
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-muted border-line'
                      }`}
                    >
                      {step.id}
                    </span>
                    <span
                      className={`text-[0.65rem] uppercase tracking-[0.2em] ${
                        current || done ? 'text-white font-semibold' : 'text-white/50'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`h-px flex-1 mx-3 mb-6 ${
                        activeStep > step.id ? 'bg-brand' : 'bg-line'
                      }`}
                      aria-hidden
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-10">
          <div className="lg:col-span-3 space-y-6">
            <section className="bg-white border border-line p-6 sm:p-8 space-y-5 luxury-shadow">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
                <h2 className="font-serif text-xl font-semibold text-ink">Shipping Address</h2>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-brand">Step 1</span>
              </div>
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
                    <span className="uppercase tracking-wider text-muted">{label}</span>
                    <input
                      type={key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text'}
                      value={address[key] || ''}
                      onChange={(e) => updateField(key, e.target.value)}
                      className="input-luxury"
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
            <div className="bg-white border border-line p-6 sm:p-7 space-y-5 sticky top-28 luxury-shadow">
              <div className="flex items-center justify-between gap-3 border-b border-line pb-4">
                <h2 className="font-serif text-xl font-semibold text-ink">Order Review</h2>
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-brand">Step 2</span>
              </div>

              <ul className="space-y-0 max-h-64 overflow-y-auto divide-y divide-line">
                {cartItems.map((item) => {
                  const price = item.product.salePrice ?? item.product.price;
                  return (
                    <li
                      key={item.product._id}
                      className="py-3 first:pt-0 flex justify-between gap-3 text-sm"
                    >
                      <div>
                        <p className="font-serif text-ink">{item.product.name}</p>
                        <p className="text-[0.65rem] uppercase tracking-wider text-muted">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <span className="font-mono text-xs whitespace-nowrap text-ink">
                        {formatInr(price * item.quantity)}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <div className="space-y-2 text-xs uppercase tracking-wider text-muted border-t border-line pt-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-mono text-ink">{formatInr(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-mono text-ink">
                    {shipping === 0 ? 'Complimentary' : formatInr(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-ink font-bold pt-2 border-t border-dashed border-line">
                  <span>Total</span>
                  <span className="font-mono text-brand text-base">{formatInr(total)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={!canPay}
                onClick={handlePay}
                className="btn-primary w-full disabled:opacity-60"
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

              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { icon: ShieldCheck, label: 'Encrypted' },
                  { icon: BadgeCheck, label: 'Razorpay' },
                  { icon: Truck, label: 'Insured' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 py-2.5 border border-line bg-white text-center"
                  >
                    <Icon size={14} className="text-brand" />
                    <span className="text-[0.55rem] uppercase tracking-wider text-muted">{label}</span>
                  </div>
                ))}
              </div>

              <p className="text-[0.65rem] text-center text-muted leading-relaxed">
                Amounts are recalculated on the server. Never trust client totals. Free insured shipping
                on orders {formatInr(FREE_SHIPPING_THRESHOLD)}+.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
