import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Order, Payment } from '../../types.js';
import { useAdmin } from '../../contexts/AdminContext.js';
import { formatInr } from '../../lib/razorpayClient.js';

export const AdminOrders: React.FC = () => {
  const { token } = useAdmin();
  const [orders, setOrders] = useState<Order[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [tab, setTab] = useState<'orders' | 'payments'>('orders');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const [oRes, pRes] = await Promise.all([
          fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('/api/admin/payments', { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        const oData = await oRes.json();
        const pData = await pRes.json();
        if (!oRes.ok) throw new Error(oData.error || 'Failed to load orders');
        if (!pRes.ok) throw new Error(pData.error || 'Failed to load payments');
        setOrders(oData);
        setPayments(pData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const paidRevenue = payments
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const failedCount = payments.filter((p) => p.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-[#1A1A1A]">Orders & Payments</h1>
        <p className="text-xs uppercase tracking-widest text-gold-500 mt-1">Commerce ledger</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gold-200 p-4">
          <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">Orders</p>
          <p className="font-mono text-2xl mt-1">{orders.length}</p>
        </div>
        <div className="bg-white border border-gold-200 p-4">
          <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">Paid Revenue</p>
          <p className="font-mono text-2xl mt-1 text-gold-500">{formatInr(paidRevenue)}</p>
        </div>
        <div className="bg-white border border-gold-200 p-4">
          <p className="text-[0.65rem] uppercase tracking-widest text-gray-400">Failed Payments</p>
          <p className="font-mono text-2xl mt-1 text-red-500">{failedCount}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('orders')}
          className={`px-4 py-2 text-xs uppercase tracking-widest ${
            tab === 'orders' ? 'bg-[#1A1A1A] text-white' : 'border border-gold-200'
          }`}
        >
          Orders
        </button>
        <button
          type="button"
          onClick={() => setTab('payments')}
          className={`px-4 py-2 text-xs uppercase tracking-widest ${
            tab === 'payments' ? 'bg-[#1A1A1A] text-white' : 'border border-gold-200'
          }`}
        >
          Payments
        </button>
      </div>

      {loading && <p className="text-xs text-gray-400 uppercase tracking-widest">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && tab === 'orders' && (
        <div className="bg-white border border-gold-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-widest text-gray-400 border-b">
                <th className="p-3">Invoice</th>
                <th className="p-3">Customer</th>
                <th className="p-3">Total</th>
                <th className="p-3">Payment</th>
                <th className="p-3">Order</th>
                <th className="p-3">Refund*</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-gold-50">
                  <td className="p-3 font-mono text-xs">
                    <Link
                      to={`/order-success/${o._id}?email=${encodeURIComponent(o.shippingAddress.email)}`}
                      className="text-gold-500 hover:underline"
                      target="_blank"
                    >
                      {o.invoiceNumber}
                    </Link>
                  </td>
                  <td className="p-3">
                    <p>{o.shippingAddress.fullName}</p>
                    <p className="text-xs text-gray-400">{o.shippingAddress.email}</p>
                  </td>
                  <td className="p-3 font-mono">{formatInr(o.total)}</td>
                  <td className="p-3 uppercase text-xs">{o.paymentStatus}</td>
                  <td className="p-3 uppercase text-xs">{o.orderStatus}</td>
                  <td className="p-3 text-xs text-gray-400">none</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400 text-sm">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <p className="text-[0.65rem] text-gray-400 p-3">* Refund status structure prepared; refunds not automated yet.</p>
        </div>
      )}

      {!loading && tab === 'payments' && (
        <div className="bg-white border border-gold-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[0.65rem] uppercase tracking-widest text-gray-400 border-b">
                <th className="p-3">Razorpay Order</th>
                <th className="p-3">Payment ID</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Method</th>
                <th className="p-3">Refund</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id} className="border-b border-gold-50">
                  <td className="p-3 font-mono text-[0.65rem]">{p.razorpayOrderId}</td>
                  <td className="p-3 font-mono text-[0.65rem]">{p.razorpayPaymentId || '—'}</td>
                  <td className="p-3 font-mono">{formatInr(p.amount)}</td>
                  <td className="p-3 uppercase text-xs">{p.status}</td>
                  <td className="p-3 text-xs">{p.method || '—'}</td>
                  <td className="p-3 text-xs">{p.refundStatus || 'none'}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400 text-sm">
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
