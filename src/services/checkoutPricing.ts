/**
 * Checkout pricing helpers — server is source of truth for totals.
 * Free insured shipping at ₹2500+ (matches CartDrawer threshold).
 */
export const FREE_SHIPPING_THRESHOLD = 2500;
export const FLAT_SHIPPING_FEE = 50;

export function unitPrice(product: { price: number; salePrice?: number }): number {
  return product.salePrice != null && product.salePrice > 0 ? product.salePrice : product.price;
}

export function computeShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

export function generateInvoiceNumber(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `LK-${y}${m}${day}-${rand}`;
}
