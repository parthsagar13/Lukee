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
      <div className="min-h-[50vh] flex items-center justify-center text-xs uppercase tracking-widest text-gray-400">
        Confirming your order…
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-red-600 text-sm">{error || 'Order not found.'}</p>
        <Link to="/shop" className="text-xs uppercase tracking-widest text-gold-500 underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="text-center space-y-3 mb-10">
        <CheckCircle2 className="mx-auto text-emerald-600" size={48} />
        <h1 className="font-serif text-3xl text-[#1A1A1A]">Payment Successful</h1>
        <p className="text-sm text-gray-500">
          Thank you. Your order <span className="font-mono text-gold-500">{order.invoiceNumber}</span> is confirmed.
        </p>
      </div>

      <div id="invoice-print" className="border border-gold-200 bg-white p-6 md:p-8 space-y-6">
        <div className="flex flex-wrap justify-between gap-4 border-b border-gold-200 pb-4">
          <div>
            <p className="font-serif text-xl tracking-widest">LUKEE JEWELS</p>
            <p className="text-[0.65rem] uppercase tracking-widest text-gray-400 mt-1">Tax Invoice / Receipt</p>
          </div>
          <div className="text-right text-xs space-y-1 text-gray-600">
            <p>Invoice: <span className="font-mono">{order.invoiceNumber}</span></p>
            <p>Order ID: <span className="font-mono text-[0.65rem]">{order._id}</span></p>
            {order.razorpayOrderId && (
              <p>Razorpay Order: <span className="font-mono text-[0.65rem]">{order.razorpayOrderId}</span></p>
            )}
            {paymentId && (
              <p>Payment ID: <span className="font-mono text-[0.65rem]">{paymentId}</span></p>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 text-sm">
          <div>
            <h3 className="text-xs uppercase tracking-widest text-gray-400 mb-2">Ship To</h3>
            <p className="font-medium text-[#1A1A1A]">{order.shippingAddress.fullName}</p>
            <p className="text-gray-600">{order.shippingAddress.addressLine1}</p>
            {order.shippingAddress.addressLine2 && (
              <p className="text-gray-600">{order.shippingAddress.addressLine2}</p>
            )}
            <p className="text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
            <p className="text-gray-600">{order.shippingAddress.country}</p>
            <p className="text-gray-600 mt-2">{order.shippingAddress.email}</p>
            <p className="text-gray-600">{order.shippingAddress.phone}</p>
          </div>
          <div className="sm:text-right space-y-1 text-xs uppercase tracking-wider text-gray-500">
            <p>Payment: <span className="text-emerald-600 font-bold">{order.paymentStatus}</span></p>
            <p>Order: <span className="text-[#1A1A1A] font-bold">{order.orderStatus}</span></p>
            <p>Method: Razorpay</p>
            <p>Date: {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}</p>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[0.65rem] uppercase tracking-widest text-gray-400 border-b border-gold-200">
              <th className="py-2">Product</th>
              <th className="py-2">Qty</th>
              <th className="py-2 text-right">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold-100">
            {order.items.map((item) => (
              <tr key={`${item.productId}-${item.sku}`}>
                <td className="py-3">
                  <p className="font-serif text-[#1A1A1A]">{item.name}</p>
                  <p className="text-[0.65rem] text-gray-400">{item.sku}</p>
                </td>
                <td className="py-3 font-mono">{item.quantity}</td>
                <td className="py-3 text-right font-mono">{formatInr(item.price)}</td>
                <td className="py-3 text-right font-mono">{formatInr(item.price * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gold-200 pt-4 space-y-1 text-sm max-w-xs ml-auto">
          <div className="flex justify-between text-gray-500">
            <span>Subtotal</span>
            <span className="font-mono">{formatInr(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Tax</span>
            <span className="font-mono">{formatInr(order.tax)}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Shipping</span>
            <span className="font-mono">{order.shipping === 0 ? 'Free' : formatInr(order.shipping)}</span>
          </div>
          <div className="flex justify-between font-bold text-[#1A1A1A] pt-2 border-t border-dashed border-gold-200">
            <span>Grand Total</span>
            <span className="font-mono text-gold-500">{formatInr(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mt-8 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white px-5 py-3 text-xs uppercase tracking-widest hover:bg-gold-500 transition-colors"
        >
          <Download size={14} />
          Download Invoice
        </button>
        <Link
          to={`/orders/${order._id}?email=${encodeURIComponent(order.shippingAddress.email)}`}
          className="inline-flex items-center gap-2 border border-gold-300 px-5 py-3 text-xs uppercase tracking-widest text-[#1A1A1A] hover:border-gold-500"
        >
          <Package size={14} />
          View Order
        </Link>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 border border-gold-300 px-5 py-3 text-xs uppercase tracking-widest text-[#1A1A1A] hover:border-gold-500"
        >
          <ShoppingBag size={14} />
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};
