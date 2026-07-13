import Razorpay from 'razorpay';
import crypto from 'crypto';

let razorpayClient: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET must be configured.');
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayClient;
}

export function getRazorpayKeyId(): string {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  if (!keyId) {
    throw new Error('RAZORPAY_KEY_ID is not configured.');
  }
  return keyId;
}

/** Amount in INR rupees → paise (Razorpay expects integer paise). */
export function toPaise(amountInRupees: number): number {
  return Math.round(amountInRupees * 100);
}

export async function createRazorpayOrder(params: {
  amountInRupees: number;
  receipt: string;
  notes?: Record<string, string>;
}): Promise<{ id: string; amount: number; currency: string; receipt: string }> {
  const client = getRazorpayClient();
  const order = await client.orders.create({
    amount: toPaise(params.amountInRupees),
    currency: 'INR',
    receipt: params.receipt.slice(0, 40),
    notes: params.notes || {},
  });

  return {
    id: String(order.id),
    amount: Number(order.amount),
    currency: String(order.currency),
    receipt: String(order.receipt || params.receipt),
  };
}

export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
  if (!keySecret) return false;

  const body = `${params.razorpayOrderId}|${params.razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'utf8'),
      Buffer.from(params.razorpaySignature, 'utf8')
    );
  } catch {
    return expected === params.razorpaySignature;
  }
}

/** Email / shipping hooks — wire to a mailer when infrastructure exists. */
export function prepareOrderEmails(_payload: {
  orderId: string;
  invoiceNumber: string;
  email: string;
  total: number;
}): void {
  // Integration point: order confirmation + invoice + shipping updates
}
