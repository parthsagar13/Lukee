import mongoose, { Schema, Document } from 'mongoose';

// 1. Admin Schema
export interface IAdminDoc extends Document {
  email: string;
  password?: string;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminSchema = new Schema<IAdminDoc>({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
}, { timestamps: true });

// 2. Category Schema
export interface ICategoryDoc extends Document {
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  seoTitle: string;
  seoDescription: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const CategorySchema = new Schema<ICategoryDoc>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  displayOrder: { type: Number, default: 0 },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
}, { timestamps: true });

// 3. Product Schema
export interface IProductDoc extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string; // ID of the Category (as a string or ObjectId)
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
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProductDoc>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, required: true },
  shortDescription: { type: String, default: '' },
  category: { type: String, required: true, index: true }, // Store as string reference
  sku: { type: String, required: true, unique: true, index: true },
  price: { type: Number, required: true },
  salePrice: { type: Number },
  material: { type: String, required: true },
  purity: { type: String, required: true },
  weight: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  featured: { type: Boolean, default: false },
  bestSeller: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  images: { type: [String], default: [] },
  seoTitle: { type: String, default: '' },
  seoDescription: { type: String, default: '' },
}, { timestamps: true });

// 4. Order Schema
export interface IOrderDoc extends Document {
  invoiceNumber: string;
  items: {
    productId: string;
    name: string;
    sku: string;
    image?: string;
    price: number;
    quantity: number;
  }[];
  shippingAddress: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  orderStatus: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  razorpayOrderId?: string;
  notes?: Record<string, string>;
  createdAt?: Date;
  updatedAt?: Date;
}

const OrderSchema = new Schema<IOrderDoc>({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
  }],
  shippingAddress: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
  },
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  shipping: { type: Number, default: 0 },
  total: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true,
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
    index: true,
  },
  razorpayOrderId: { type: String, index: true },
  notes: { type: Map, of: String },
}, { timestamps: true });

// 5. Payment Schema
export interface IPaymentDoc extends Document {
  orderId: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  method?: string;
  email?: string;
  contact?: string;
  receipt?: string;
  notes?: Record<string, string>;
  refundStatus?: 'none' | 'partial' | 'full' | 'pending';
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPaymentDoc>({
  orderId: { type: String, required: true, index: true },
  razorpayOrderId: { type: String, required: true, unique: true, index: true },
  razorpayPaymentId: { type: String, index: true, sparse: true },
  razorpaySignature: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'cancelled'],
    default: 'pending',
    index: true,
  },
  method: { type: String },
  email: { type: String },
  contact: { type: String },
  receipt: { type: String },
  notes: { type: Map, of: String },
  refundStatus: {
    type: String,
    enum: ['none', 'partial', 'full', 'pending'],
    default: 'none',
  },
}, { timestamps: true });

// 6. Purchase Schema (line-item ownership after paid order)
export interface IPurchaseDoc extends Document {
  orderId: string;
  productId: string;
  price: number;
  quantity: number;
  licenseType?: string;
  downloadLimit?: number;
  downloadCount?: number;
  status: 'active' | 'revoked';
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const PurchaseSchema = new Schema<IPurchaseDoc>({
  orderId: { type: String, required: true, index: true },
  productId: { type: String, required: true, index: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  licenseType: { type: String, default: 'standard' },
  downloadLimit: { type: Number, default: 0 },
  downloadCount: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'revoked'], default: 'active' },
  email: { type: String, index: true },
}, { timestamps: true });

// Avoid model recompilation errors
export const MongooseAdmin = (mongoose.models.Admin || mongoose.model<IAdminDoc>('Admin', AdminSchema)) as mongoose.Model<IAdminDoc>;
export const MongooseCategory = (mongoose.models.Category || mongoose.model<ICategoryDoc>('Category', CategorySchema)) as mongoose.Model<ICategoryDoc>;
export const MongooseProduct = (mongoose.models.Product || mongoose.model<IProductDoc>('Product', ProductSchema)) as mongoose.Model<IProductDoc>;
export const MongooseOrder = (mongoose.models.Order || mongoose.model<IOrderDoc>('Order', OrderSchema)) as mongoose.Model<IOrderDoc>;
export const MongoosePayment = (mongoose.models.Payment || mongoose.model<IPaymentDoc>('Payment', PaymentSchema)) as mongoose.Model<IPaymentDoc>;
export const MongoosePurchase = (mongoose.models.Purchase || mongoose.model<IPurchaseDoc>('Purchase', PurchaseSchema)) as mongoose.Model<IPurchaseDoc>;
