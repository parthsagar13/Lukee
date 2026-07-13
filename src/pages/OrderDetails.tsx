import React, { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import type { Order } from '../types.js';
import { formatInr } from '../lib/razorpayClient.js';

export const OrderDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [lookupEmail, setLookupEmail] = useState(email);

  const loadOrder = async (orderEmail: string) => {
    if (!id || !orderEmail) {
      setError('Order ID and email are required.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${id}?email=${encodeURIComponent(orderEmail)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load order.');
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError(err instanceof Error ? err.message : 'Failed to load order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) loadOrder(email);
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, email]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-[#1A1A1A]">Order Details</h1>
        <p className="text-xs uppercase tracking-widest text-gold-500 mt-1">Track & review</p>
      </div>

      {!email && (
        <form
          className="border border-gold-200 bg-white p-4 flex flex-col sm:flex-row gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            loadOrder(lookupEmail.trim());
          }}
        >
          <input
            type="email"
            placeholder="Email used at checkout"
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
            className="flex-1 border border-gold-200 px-3 py-2 text-sm focus:outline-none focus:border-gold-500"
            required
          />
          <button
            type="submit"
            className="bg-[#1A1A1A] text-white px-5 py-2 text-xs uppercase tracking-widest hover:bg-gold-500"
          >
            View Order
          </button>
        </form>
      )}

      {loading && (
        <p className="text-xs uppercase tracking-widest text-gray-400">Loading…</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {order && (
        <div className="border border-gold-200 bg-white p-6 space-y-4">
          <div className="flex flex-wrap justify-between gap-2 text-sm">
            <div>
              <p className="font-mono text-gold-500">{order.invoiceNumber}</p>
              <p className="text-xs text-gray-400">{order._id}</p>
            </div>
            <div className="text-right text-xs uppercase tracking-wider space-y-1">
              <p>Payment: <span className="font-bold">{order.paymentStatus}</span></p>
              <p>Status: <span className="font-bold">{order.orderStatus}</span></p>
              <p>Total: <span className="font-mono text-gold-500">{formatInr(order.total)}</span></p>
            </div>
          </div>

          <ul className="divide-y divide-gold-100">
            {order.items.map((item) => (
              <li key={item.productId + item.sku} className="py-3 flex justify-between text-sm">
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span className="font-mono">{formatInr(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to={`/order-success/${order._id}?email=${encodeURIComponent(order.shippingAddress.email)}`}
              className="text-xs uppercase tracking-widest text-gold-500 underline"
            >
              Invoice
            </Link>
            <Link to="/shop" className="text-xs uppercase tracking-widest text-gray-500 underline">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
