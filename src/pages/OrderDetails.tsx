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
    <div className="text-ivory min-h-[50vh]">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-light text-ink">Order Details</h1>
          <p className="section-eyebrow mt-2">Track &amp; review</p>
        </div>

        {!email && (
          <form
            className="border border-line bg-white p-5 flex flex-col sm:flex-row gap-3 luxury-shadow"
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
              className="input-luxury flex-1"
              required
            />
            <button type="submit" className="btn-primary whitespace-nowrap">
              View Order
            </button>
          </form>
        )}

        {loading && (
          <p className="text-xs uppercase tracking-widest text-muted">Loading…</p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        {order && (
          <div className="border border-line bg-white p-6 space-y-5 luxury-shadow">
            <div className="flex flex-wrap justify-between gap-2 text-sm border-b border-line pb-4">
              <div>
                <p className="font-mono text-brand">{order.invoiceNumber}</p>
                <p className="text-xs text-muted">{order._id}</p>
              </div>
              <div className="text-right text-xs uppercase tracking-wider space-y-1 text-muted">
                <p>
                  Payment: <span className="font-bold text-ink">{order.paymentStatus}</span>
                </p>
                <p>
                  Status: <span className="font-bold text-ink">{order.orderStatus}</span>
                </p>
                <p>
                  Total:{' '}
                  <span className="font-mono text-brand">{formatInr(order.total)}</span>
                </p>
              </div>
            </div>

            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <li
                  key={item.productId + item.sku}
                  className="py-3 flex justify-between text-sm gap-3"
                >
                  <span className="text-ink">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-mono text-ink">
                    {formatInr(item.price * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to={`/order-success/${order._id}?email=${encodeURIComponent(order.shippingAddress.email)}`}
                className="btn-gold"
              >
                Invoice
              </Link>
              <Link to="/shop" className="btn-secondary">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
