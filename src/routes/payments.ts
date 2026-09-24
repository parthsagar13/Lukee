import { Router, Request, Response } from 'express';
import { dbService } from '../db/dbService.js';
import { authMiddleware } from '../middleware/auth.js';
import {
  createRazorpayOrder,
  getRazorpayKeyId,
  verifyPaymentSignature,
  prepareOrderEmails,
} from '../services/razorpayService.js';
import {
  computeShipping,
  generateInvoiceNumber,
  unitPrice,
} from '../services/checkoutPricing.js';
import type { OrderItem, ShippingAddress } from '../types.js';

const router = Router();

function isValidAddress(addr: Partial<ShippingAddress> | undefined): addr is ShippingAddress {
  if (!addr) return false;
  const required: (keyof ShippingAddress)[] = [
    'fullName',
    'email',
    'phone',
    'addressLine1',
    'city',
    'state',
    'postalCode',
    'country',
  ];
  return required.every((k) => typeof addr[k] === 'string' && String(addr[k]).trim().length > 0);
}

/**
 * POST /api/payments/create-order
 * Recalculates totals from DB, creates pending Order + Razorpay order + Payment.
 */
router.post('/payments/create-order', async (req: Request, res: Response) => {
  try {
    const { items, shippingAddress, notes } = req.body as {
      items?: { productId: string; quantity: number }[];
      shippingAddress?: ShippingAddress;
      notes?: Record<string, string>;
    };

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart items are required.' });
      return;
    }

    if (!isValidAddress(shippingAddress)) {
      res.status(400).json({ error: 'A complete shipping address is required.' });
      return;
    }

    const email = shippingAddress.email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ error: 'A valid email is required.' });
      return;
    }

    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const line of items) {
      const qty = Number(line.quantity);
      if (!line.productId || !Number.isFinite(qty) || qty < 1) {
        res.status(400).json({ error: 'Each cart line needs a valid productId and quantity.' });
        return;
      }

      const product = await dbService.getProductById(line.productId);
      if (!product || product.status !== 'active') {
        res.status(400).json({ error: `Product unavailable: ${line.productId}` });
        return;
      }

      if (product.stock < qty) {
        res.status(400).json({
          error: `Insufficient stock for "${product.name}". Available: ${product.stock}.`,
        });
        return;
      }

      const price = unitPrice(product);
      subtotal += price * qty;
      orderItems.push({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        image: product.images?.[0],
        price,
        quantity: qty,
      });
    }

    const discount = 0;
    const tax = 0;
    const shipping = computeShipping(subtotal);
    const total = subtotal - discount + tax + shipping;

    if (total <= 0) {
      res.status(400).json({ error: 'Order total must be greater than zero.' });
      return;
    }

    const invoiceNumber = generateInvoiceNumber();
    const address: ShippingAddress = {
      ...shippingAddress,
      email,
      fullName: shippingAddress.fullName.trim(),
      phone: shippingAddress.phone.trim(),
      addressLine1: shippingAddress.addressLine1.trim(),
      addressLine2: shippingAddress.addressLine2?.trim(),
      city: shippingAddress.city.trim(),
      state: shippingAddress.state.trim(),
      postalCode: shippingAddress.postalCode.trim(),
      country: shippingAddress.country.trim() || 'India',
    };

    const order = await dbService.createPendingOrder({
      invoiceNumber,
      items: orderItems,
      shippingAddress: address,
      subtotal,
      discount,
      tax,
      shipping,
      total,
      currency: 'INR',
      notes: notes || { source: 'checkout' },
    });

    let razorpayOrder: { id: string; amount: number; currency: string; receipt: string };
    try {
      razorpayOrder = await createRazorpayOrder({
        amountInRupees: total,
        receipt: invoiceNumber,
        notes: {
          orderId: order._id,
          invoiceNumber,
          email,
        },
      });
    } catch (err) {
      console.error('[payments] Razorpay order create failed:', err);
      res.status(502).json({
        error: 'Unable to start payment with Razorpay. Check API keys and try again.',
      });
      return;
    }

    await dbService.attachRazorpayOrderId(order._id, razorpayOrder.id);

    const payment = await dbService.createPendingPayment({
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: total,
      currency: 'INR',
      email,
      contact: address.phone,
      receipt: invoiceNumber,
      notes: {
        orderId: order._id,
        invoiceNumber,
      },
    });

    res.status(201).json({
      orderId: order._id,
      paymentId: payment._id,
      invoiceNumber,
      amount: total,
      currency: 'INR',
      razorpayOrderId: razorpayOrder.id,
      razorpayAmountPaise: razorpayOrder.amount,
      keyId: getRazorpayKeyId(),
      prefill: {
        name: address.fullName,
        email,
        contact: address.phone,
      },
      notes: {
        orderId: order._id,
        invoiceNumber,
      },
    });
  } catch (err) {
    console.error('[payments] create-order error:', err);
    res.status(500).json({ error: 'Failed to create payment order.' });
  }
});

/**
 * POST /api/payments/verify
 * Verifies Razorpay signature, finalizes order, decrements stock.
 */
router.post('/payments/verify', async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method,
    } = req.body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
      method?: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: 'Missing Razorpay payment verification fields.' });
      return;
    }

    const valid = verifyPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!valid) {
      await dbService.markPaymentFailed(razorpay_order_id);
      res.status(400).json({ error: 'Payment signature verification failed.' });
      return;
    }

    const result = await dbService.finalizePaidOrder({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      method,
    });

    if (!result.alreadyProcessed) {
      prepareOrderEmails({
        orderId: result.order._id,
        invoiceNumber: result.order.invoiceNumber,
        email: result.order.shippingAddress.email,
        total: result.order.total,
      });
    }

    res.json({
      success: true,
      alreadyProcessed: result.alreadyProcessed,
      order: result.order,
      payment: result.payment,
    });
  } catch (err) {
    console.error('[payments] verify error:', err);
    const message = err instanceof Error ? err.message : 'Payment verification failed.';
    res.status(500).json({ error: message });
  }
});

/** POST /api/payments/mark-failed — client cancelled / failed checkout */
router.post('/payments/mark-failed', async (req: Request, res: Response) => {
  try {
    const { razorpayOrderId } = req.body as { razorpayOrderId?: string };
    if (!razorpayOrderId) {
      res.status(400).json({ error: 'razorpayOrderId is required.' });
      return;
    }
    await dbService.markPaymentFailed(razorpayOrderId);
    res.json({ success: true });
  } catch (err) {
    console.error('[payments] mark-failed error:', err);
    res.status(500).json({ error: 'Unable to update payment status.' });
  }
});

/** GET /api/payments/:id */
router.get('/payments/:id', async (req: Request, res: Response) => {
  try {
    const payment = await dbService.getPaymentById(req.params.id);
    if (!payment) {
      res.status(404).json({ error: 'Payment not found.' });
      return;
    }
    res.json(payment);
  } catch (err) {
    console.error('[payments] get payment error:', err);
    res.status(500).json({ error: 'Failed to load payment.' });
  }
});

/** GET /api/orders — public: filter by email; admin: all */
router.get('/orders', async (req: Request, res: Response) => {
  try {
    const email = typeof req.query.email === 'string' ? req.query.email : undefined;
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      // Defer to admin list when authenticated
      return authMiddleware(req as any, res, async () => {
        try {
          const orders = await dbService.getOrders({
            paymentStatus: typeof req.query.paymentStatus === 'string'
              ? req.query.paymentStatus
              : undefined,
          });
          res.json(orders);
        } catch (err) {
          console.error('[orders] admin list error:', err);
          res.status(500).json({ error: 'Failed to load orders.' });
        }
      });
    }

    if (!email) {
      res.status(400).json({ error: 'Provide email to look up guest orders, or authenticate as admin.' });
      return;
    }

    const orders = await dbService.getOrders({ email });
    res.json(orders);
  } catch (err) {
    console.error('[orders] list error:', err);
    res.status(500).json({ error: 'Failed to load orders.' });
  }
});

/** GET /api/orders/:id — guest access requires matching email query */
router.get('/orders/:id', async (req: Request, res: Response) => {
  try {
    const order = await dbService.getOrderById(req.params.id);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    const email = typeof req.query.email === 'string' ? req.query.email.toLowerCase() : '';
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      return authMiddleware(req as any, res, () => {
        res.json(order);
      });
    }

    if (!email || email !== order.shippingAddress.email.toLowerCase()) {
      res.status(403).json({ error: 'Provide the order email to view this order.' });
      return;
    }

    res.json(order);
  } catch (err) {
    console.error('[orders] get error:', err);
    res.status(500).json({ error: 'Failed to load order.' });
  }
});

/** GET /api/admin/payments — admin payment ledger */
router.get('/admin/payments', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const payments = await dbService.getPayments();
    res.json(payments);
  } catch (err) {
    console.error('[payments] admin list error:', err);
    res.status(500).json({ error: 'Failed to load payments.' });
  }
});

export default router;
