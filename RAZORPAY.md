# Razorpay Integration (Lukee Jewels)

## Overview

Checkout uses **Razorpay** with server-side amount calculation and signature verification.

Flow: Cart → `/checkout` → Create Razorpay order → Checkout modal → Verify signature → Confirm order / reduce stock / clear cart → `/order-success/:id`

There is **no customer login**. Guest checkout uses shipping email + phone.

## Environment variables

### Backend (`.env`)

```
RAZORPAY_KEY_ID=rzp_test_xxxx
RAZORPAY_KEY_SECRET=xxxx
```

### Frontend (Vite)

```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxx
```

Use **test** keys locally and **live** keys in production. Key ID mode must match (both test or both live).

The create-order API also returns `keyId` to the browser (public key only). Never expose `RAZORPAY_KEY_SECRET`.

## Local testing

1. Copy `.env.example` → `.env` and add Razorpay test keys.
2. `npm run dev`
3. Add products to cart → **Proceed to Checkout** → fill address → **Pay Securely**.
4. Use Razorpay test credentials:
   - **Cards:** https://razorpay.com/docs/payments/payments/test-card-upi-details/
   - Success card often: `4111 1111 1111 1111`, any future expiry, any CVV
   - **UPI:** test VPA such as `success@razorpay` (see Razorpay docs for current values)

## API endpoints

| Method | Path | Notes |
|--------|------|--------|
| POST | `/api/payments/create-order` | Recalculates totals from DB |
| POST | `/api/payments/verify` | HMAC signature verify + finalize |
| POST | `/api/payments/mark-failed` | Cancel / failure |
| GET | `/api/payments/:id` | Payment record |
| GET | `/api/orders` | Guest: `?email=`; Admin: Bearer JWT |
| GET | `/api/orders/:id` | Guest needs `?email=` |
| GET | `/api/admin/payments` | Admin JWT |

## Security

- Order totals are always computed on the server from live product prices/stock.
- Frontend payment success is never trusted without signature verification.
- Duplicate payment IDs / already-paid orders are handled idempotently.
- Stock is decremented with MongoDB transactions when Mongo is connected.

## Admin

`/admin/orders` — orders, payments, revenue, failed payments. Refund column is prepared (`refundStatus`); automated refunds are not implemented yet.

## Email hooks

`prepareOrderEmails()` in `src/services/razorpayService.ts` is the integration point for confirmation / invoice / shipping emails. No mailer is wired yet.

## Webhooks (optional)

For production reliability, add a Razorpay webhook endpoint that verifies `X-Razorpay-Signature` and calls the same finalize logic. Not required for local checkout testing.

## Deployment notes

- Set Razorpay env vars on your host (Render / Vercel / etc.).
- If frontend and backend are on different origins, configure CORS and point fetch URLs to the API host (this repo currently uses same-origin `/api`).
- Product catalog prices are treated as **INR** for Razorpay (paise).
