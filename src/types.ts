export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  seoTitle: string;
  seoDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string; // Category ID
  sku: string;
  price: number;
  salePrice?: number;
  material: string;
  purity: string;
  weight: number;
  stock: number;
  featured: boolean;
  bestSeller: boolean;
  newArrival: boolean;
  status: 'active' | 'inactive';
  images: string[];
  seoTitle: string;
  seoDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Admin {
  _id: string;
  email: string;
  password?: string;
  name: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStockCount: number;
  featuredCount: number;
  categoryStats: { name: string; count: number }[];
  materialStats: { name: string; count: number }[];
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  image?: string;
  price: number;
  quantity: number;
}

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  _id: string;
  invoiceNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  razorpayOrderId?: string;
  notes?: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  _id: string;
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method?: string;
  email?: string;
  contact?: string;
  receipt?: string;
  notes?: Record<string, string>;
  refundStatus?: 'none' | 'partial' | 'full' | 'pending';
  createdAt?: string;
  updatedAt?: string;
}

export interface Purchase {
  _id: string;
  orderId: string;
  productId: string;
  price: number;
  quantity: number;
  licenseType?: string;
  downloadLimit?: number;
  downloadCount?: number;
  status: 'active' | 'revoked';
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}
