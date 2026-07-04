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

// Avoid model recompilation errors
export const MongooseAdmin = (mongoose.models.Admin || mongoose.model<IAdminDoc>('Admin', AdminSchema)) as mongoose.Model<IAdminDoc>;
export const MongooseCategory = (mongoose.models.Category || mongoose.model<ICategoryDoc>('Category', CategorySchema)) as mongoose.Model<ICategoryDoc>;
export const MongooseProduct = (mongoose.models.Product || mongoose.model<IProductDoc>('Product', ProductSchema)) as mongoose.Model<IProductDoc>;
