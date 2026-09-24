import type { ShippingAddress } from '../types.js';

export interface CreatePaymentOrderResponse {
  orderId: string;
  paymentId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayAmountPaise: number;
  keyId: string;
  prefill: { name: string; email: string; contact: string };
  notes: Record<string, string>;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (response: unknown) => void) => void;
    };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

export function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay can only load in the browser.'));
  }
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      razorpayScriptPromise = null;
      reject(new Error('Failed to load Razorpay Checkout.'));
    };
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export async function createPaymentOrder(payload: {
  items: { productId: string; quantity: number }[];
  shippingAddress: ShippingAddress;
}): Promise<CreatePaymentOrderResponse> {
  const res = await fetch('/api/payments/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Unable to create payment order.');
  }
  return data;
}

export async function verifyPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  method?: string;
}) {
  const res = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Payment verification failed.');
  }
  return data as {
    success: boolean;
    alreadyProcessed: boolean;
    order: import('../types.js').Order;
    payment: import('../types.js').Payment;
  };
}

export async function markPaymentFailed(razorpayOrderId: string) {
  await fetch('/api/payments/mark-failed', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ razorpayOrderId }),
  });
}

export function formatInr(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
