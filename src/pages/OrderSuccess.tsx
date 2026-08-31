import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, Download, Package, ShoppingBag } from 'lucide-react';
import type { Order } from '../types.js';
import { formatInr } from '../lib/razorpayClient.js';

export const OrderSuccess: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id || !email) {
        setError('Missing order reference.');
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/orders/${id}?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load order.');
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, email]);

  useEffect(() => {
    const cached = sessionStorage.getItem(`lukee_payment_${id}`);
    if (cached) setPaymentId(cached);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-xs uppercase tracking-widest text-muted">Confirming your order…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
          <p className="text-red-600 text-sm">{error || 'Order not found.'}</p>
          <Link to="/shop" className="btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
        <div className="text-center space-y-3 mb-10">
          <CheckCircle2 className="mx-auto text-brand" size={48} />
          <p className="section-eyebrow">Confirmed</p>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-ink">Payment Successful</h1>
          <p className="text-sm text-muted">
            Thank you. Your order{' '}
            <span className="font-mono text-brand">{order.invoiceNumber}</span> is confirmed.
          </p>
        </div>

        <div id="invoice-print" className="border border-line bg-white p-6 md:p-8 space-y-6 luxury-shadow">
          <div className="flex flex-wrap justify-between gap-4 border-b border-line pb-4">
            <div>
              <img
                src="/lukee-logo.png"
                alt="Lukee Jewels"
                className="h-16 w-auto max-w-[140px] object-contain"
              />
              <p className="text-[0.65rem] uppercase tracking-widest text-muted mt-2">
                Tax Invoice / Receipt
              </p>
            </div>
            <div className="text-right text-xs space-y-1 text-muted">
              <p>
                Invoice: <span className="font-mono text-ink">{order.invoiceNumber}</span>
              </p>
              <p>
                Order ID: <span className="font-mono text-[0.65rem] text-ink">{order._id}</span>
              </p>
              {order.razorpayOrderId && (
                <p>
                  Razorpay Order:{' '}
                  <span className="font-mono text-[0.65rem] text-ink">{order.razorpayOrderId}</span>
                </p>
              )}
              {paymentId && (
                <p>
                  Payment ID: <span className="font-mono text-[0.65rem] text-ink">{paymentId}</span>
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-muted mb-2">Ship To</h3>
              <p className="font-medium text-ink">{order.shippingAddress.fullName}</p>
              <p className="text-muted">{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p className="text-muted">{order.shippingAddress.addressLine2}</p>
              )}
              <p className="text-muted">
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.postalCode}
              </p>
              <p className="text-muted">{order.shippingAddress.country}</p>
              <p className="text-muted mt-2">{order.shippingAddress.email}</p>
              <p className="text-muted">{order.shippingAddress.phone}</p>
            </div>
            <div className="sm:text-right space-y-1 text-xs uppercase tracking-wider text-muted">
              <p>
                Payment:{' '}
                <span className="text-emerald-600 font-bold">{order.paymentStatus}</span>
              </p>
              <p>
                Order: <span className="text-ink font-bold">{order.orderStatus}</span>
              </p>
              <p>Method: Razorpay</p>
              <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</p>
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-widest text-muted border-b border-line">
                <th className="py-2">Product</th>
                <th className="py-2">Qty</th>
                <th className="py-2 text-right">Price</th>
                <th className="py-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {order.items.map((item) => (
                <tr key={`${item.productId}-${item.sku}`}>
                  <td className="py-3">
                    <p className="font-serif text-ink">{item.name}</p>
                    <p className="text-[0.65rem] text-muted">{item.sku}</p>
                  </td>
                  <td className="py-3 font-mono">{item.quantity}</td>
                  <td className="py-3 text-right font-mono">{formatInr(item.price)}</td>
                  <td className="py-3 text-right font-mono">
                    {formatInr(item.price * item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-line pt-4 space-y-1 text-sm max-w-xs ml-auto">
            <div className="flex justify-between text-muted">
              <span>Subtotal</span>
              <span className="font-mono text-ink">{formatInr(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Tax</span>
              <span className="font-mono text-ink">{formatInr(order.tax)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>Shipping</span>
              <span className="font-mono text-ink">
                {order.shipping === 0 ? 'Free' : formatInr(order.shipping)}
              </span>
            </div>
            <div className="flex justify-between font-bold text-ink pt-2 border-t border-dashed border-line">
              <span>Grand Total</span>
              <span className="font-mono text-brand">{formatInr(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-center mt-8 print:hidden">
          <button type="button" onClick={() => window.print()} className="btn-primary">
            <Download size={14} />
            Download Invoice
          </button>
          <Link
            to={`/orders/${order._id}?email=${encodeURIComponent(order.shippingAddress.email)}`}
            className="btn-secondary"
          >
            <Package size={14} />
            View Order
          </Link>
          <Link to="/shop" className="btn-gold">
            <ShoppingBag size={14} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};
