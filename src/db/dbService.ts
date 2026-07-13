import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import {
  MongooseAdmin,
  MongooseCategory,
  MongooseProduct,
  MongooseOrder,
  MongoosePayment,
  MongoosePurchase,
} from './mongooseModels.js';
import {
  Admin,
  Category,
  Product,
  DashboardStats,
  Order,
  Payment,
  Purchase,
  ShippingAddress,
  OrderItem,
} from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface LocalDbSchema {
  admins: Admin[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  payments: Payment[];
  purchases: Purchase[];
}

class DbService {
  private isMongoConnected = false;
  private localDb: LocalDbSchema = {
    admins: [],
    categories: [],
    products: [],
    orders: [],
    payments: [],
    purchases: [],
  };

  constructor() {
    this.ensureLocalDir();
  }

  // Ensure local data storage exists
  private ensureLocalDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(
        DB_FILE,
        JSON.stringify(
          { admins: [], categories: [], products: [], orders: [], payments: [], purchases: [] },
          null,
          2
        ),
        'utf8'
      );
    }
    this.readLocalDb();
  }

  private readLocalDb() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(data);
      this.localDb = {
        admins: parsed.admins || [],
        categories: parsed.categories || [],
        products: parsed.products || [],
        orders: parsed.orders || [],
        payments: parsed.payments || [],
        purchases: parsed.purchases || [],
      };
    } catch (e) {
      this.localDb = {
        admins: [],
        categories: [],
        products: [],
        orders: [],
        payments: [],
        purchases: [],
      };
    }
  }

  private saveLocalDb() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.localDb, null, 2), 'utf8');
    } catch (e) {
      console.error('Error saving local database:', e);
    }
  }

  // Initialize and connect to DB
  async connect(): Promise<boolean> {
    const mongoUri = process.env.MONGODB_URI?.trim();
    if (mongoUri) {
      try {
        console.log('[dbService] Attempting to connect to MongoDB...');
        await mongoose.connect(mongoUri, {
          serverSelectionTimeoutMS: 5000,
        });
        this.isMongoConnected = true;
        console.log('[dbService] Successfully connected to MongoDB Atlas!');
        return true;
      } catch (err) {
        console.error('[dbService] MongoDB Atlas connection failed — falling back to local JSON DB.');
        console.error('[dbService] Connection error details:', err instanceof Error ? err.message : err);
        this.isMongoConnected = false;
      }
    } else {
      console.log('[dbService] MONGODB_URI is not set — using local persistent JSON DB.');
      this.isMongoConnected = false;
    }
    this.ensureLocalDir();
    return false;
  }

  getDbStatus(): { connected: boolean; engine: 'mongodb' | 'json' } {
    return {
      connected: this.isMongoConnected,
      engine: this.isMongoConnected ? 'mongodb' : 'json'
    };
  }

  // ==========================================
  // ADMIN CRUD
  // ==========================================
  async getAdminByEmail(email: string): Promise<Admin | null> {
    if (this.isMongoConnected) {
      const doc = await MongooseAdmin.findOne({ email }).lean();
      if (!doc) return null;
      return { _id: doc._id.toString(), email: doc.email, password: doc.password, name: doc.name };
    } else {
      this.readLocalDb();
      const admin = this.localDb.admins.find(a => a.email.toLowerCase() === email.toLowerCase());
      return admin || null;
    }
  }

  async createAdmin(adminData: Partial<Admin>): Promise<Admin> {
    if (this.isMongoConnected) {
      const doc = await MongooseAdmin.create(adminData);
      return { _id: doc._id.toString(), email: doc.email, password: doc.password, name: doc.name };
    } else {
      this.readLocalDb();
      const newAdmin: Admin = {
        _id: 'admin_' + Math.random().toString(36).substr(2, 9),
        email: adminData.email || '',
        password: adminData.password || '',
        name: adminData.name || 'Admin',
        createdAt: new Date().toISOString()
      };
      this.localDb.admins.push(newAdmin);
      this.saveLocalDb();
      return newAdmin;
    }
  }

  // ==========================================
  // CATEGORIES CRUD
  // ==========================================
  async getCategories(): Promise<Category[]> {
    if (this.isMongoConnected) {
      const docs = await MongooseCategory.find().sort({ displayOrder: 1, name: 1 }).lean();
      return docs.map(d => ({
        _id: d._id.toString(),
        name: d.name,
        slug: d.slug,
        description: d.description,
        status: d.status,
        displayOrder: d.displayOrder,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription
      }));
    } else {
      this.readLocalDb();
      return [...this.localDb.categories].sort((a, b) => {
        if (a.displayOrder !== b.displayOrder) {
          return a.displayOrder - b.displayOrder;
        }
        return a.name.localeCompare(b.name);
      });
    }
  }

  async getCategoryById(id: string): Promise<Category | null> {
    if (this.isMongoConnected) {
      try {
        const doc = await MongooseCategory.findById(id).lean();
        if (!doc) return null;
        return {
          _id: doc._id.toString(),
          name: doc.name,
          slug: doc.slug,
          description: doc.description,
          status: doc.status,
          displayOrder: doc.displayOrder,
          seoTitle: doc.seoTitle,
          seoDescription: doc.seoDescription
        };
      } catch {
        return null;
      }
    } else {
      this.readLocalDb();
      return this.localDb.categories.find(c => c._id === id) || null;
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | null> {
    if (this.isMongoConnected) {
      const doc = await MongooseCategory.findOne({ slug }).lean();
      if (!doc) return null;
      return {
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        status: doc.status,
        displayOrder: doc.displayOrder,
        seoTitle: doc.seoTitle,
        seoDescription: doc.seoDescription
      };
    } else {
      this.readLocalDb();
      return this.localDb.categories.find(c => c.slug === slug) || null;
    }
  }

  async createCategory(catData: Partial<Category>): Promise<Category> {
    if (this.isMongoConnected) {
      const doc = await MongooseCategory.create(catData);
      return {
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        status: doc.status,
        displayOrder: doc.displayOrder,
        seoTitle: doc.seoTitle,
        seoDescription: doc.seoDescription
      };
    } else {
      this.readLocalDb();
      const newCat: Category = {
        _id: 'cat_' + Math.random().toString(36).substr(2, 9),
        name: catData.name || '',
        slug: catData.slug || '',
        description: catData.description || '',
        status: catData.status || 'active',
        displayOrder: Number(catData.displayOrder) || 0,
        seoTitle: catData.seoTitle || '',
        seoDescription: catData.seoDescription || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.localDb.categories.push(newCat);
      this.saveLocalDb();
      return newCat;
    }
  }

  async updateCategory(id: string, catData: Partial<Category>): Promise<Category | null> {
    if (this.isMongoConnected) {
      try {
        const doc = await MongooseCategory.findByIdAndUpdate(id, catData, { new: true }).lean();
        if (!doc) return null;
        return {
          _id: doc._id.toString(),
          name: doc.name,
          slug: doc.slug,
          description: doc.description,
          status: doc.status,
          displayOrder: doc.displayOrder,
          seoTitle: doc.seoTitle,
          seoDescription: doc.seoDescription
        };
      } catch {
        return null;
      }
    } else {
      this.readLocalDb();
      const idx = this.localDb.categories.findIndex(c => c._id === id);
      if (idx === -1) return null;
      const updated: Category = {
        ...this.localDb.categories[idx],
        ...catData,
        updatedAt: new Date().toISOString()
      };
      this.localDb.categories[idx] = updated;
      this.saveLocalDb();
      return updated;
    }
  }

  async deleteCategory(id: string): Promise<boolean> {
    if (this.isMongoConnected) {
      try {
        const res = await MongooseCategory.findByIdAndDelete(id);
        return !!res;
      } catch {
        return false;
      }
    } else {
      this.readLocalDb();
      const initialLen = this.localDb.categories.length;
      this.localDb.categories = this.localDb.categories.filter(c => c._id !== id);
      if (this.localDb.categories.length !== initialLen) {
        this.saveLocalDb();
        return true;
      }
      return false;
    }
  }

  // ==========================================
  // PRODUCTS CRUD
  // ==========================================
  async getProducts(params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    material?: string;
    sort?: string;
    limit?: number;
    skip?: number;
    status?: 'active' | 'inactive' | 'all';
    featured?: boolean;
    bestSeller?: boolean;
    newArrival?: boolean;
  }): Promise<{ products: Product[]; total: number }> {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      material,
      sort,
      limit = 1000,
      skip = 0,
      status = 'active',
      featured,
      bestSeller,
      newArrival
    } = params || {};

    if (this.isMongoConnected) {
      const query: any = {};
      
      if (status !== 'all') {
        query.status = status;
      }
      if (category) {
        query.category = category;
      }
      if (featured !== undefined) {
        query.featured = featured;
      }
      if (bestSeller !== undefined) {
        query.bestSeller = bestSeller;
      }
      if (newArrival !== undefined) {
        query.newArrival = newArrival;
      }
      if (material) {
        query.material = { $regex: new RegExp(`^${material}$`, 'i') };
      }
      if (minPrice !== undefined || maxPrice !== undefined) {
        query.$and = [];
        if (minPrice !== undefined) {
          query.$and.push({
            $or: [
              { salePrice: { $gte: minPrice } },
              { $and: [{ salePrice: { $exists: false } }, { price: { $gte: minPrice } }] },
              { $and: [{ salePrice: null }, { price: { $gte: minPrice } }] }
            ]
          });
        }
        if (maxPrice !== undefined) {
          query.$and.push({
            $or: [
              { salePrice: { $lte: maxPrice } },
              { $and: [{ salePrice: { $exists: false } }, { price: { $lte: maxPrice } }] },
              { $and: [{ salePrice: null }, { price: { $lte: maxPrice } }] }
            ]
          });
        }
      }

      if (search) {
        const searchRegex = new RegExp(search, 'i');
        query.$or = [
          { name: searchRegex },
          { sku: searchRegex },
          { material: searchRegex },
          { description: searchRegex },
          { shortDescription: searchRegex }
        ];
      }

      let sortQuery: any = { createdAt: -1 };
      if (sort === 'price-asc') {
        sortQuery = { salePrice: 1, price: 1 };
      } else if (sort === 'price-desc') {
        sortQuery = { salePrice: -1, price: -1 };
      } else if (sort === 'featured') {
        sortQuery = { featured: -1, createdAt: -1 };
      } else if (sort === 'newest') {
        sortQuery = { createdAt: -1 };
      }

      const total = await MongooseProduct.countDocuments(query);
      const docs = await MongooseProduct.find(query)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .lean();

      const mappedProducts = docs.map((d: any) => ({
        _id: d._id.toString(),
        name: d.name,
        slug: d.slug,
        description: d.description,
        shortDescription: d.shortDescription,
        category: d.category,
        sku: d.sku,
        price: d.price,
        salePrice: d.salePrice,
        material: d.material,
        purity: d.purity,
        weight: d.weight,
        stock: d.stock,
        featured: d.featured,
        bestSeller: d.bestSeller,
        newArrival: d.newArrival,
        status: d.status,
        images: d.images,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
        createdAt: d.createdAt ? d.createdAt.toISOString() : undefined,
        updatedAt: d.updatedAt ? d.updatedAt.toISOString() : undefined,
      }));

      return { products: mappedProducts, total };
    } else {
      this.readLocalDb();
      let list = [...this.localDb.products];

      // Filters
      if (status !== 'all') {
        list = list.filter(p => p.status === status);
      }
      if (category) {
        list = list.filter(p => p.category === category);
      }
      if (featured !== undefined) {
        list = list.filter(p => p.featured === featured);
      }
      if (bestSeller !== undefined) {
        list = list.filter(p => p.bestSeller === bestSeller);
      }
      if (newArrival !== undefined) {
        list = list.filter(p => p.newArrival === newArrival);
      }
      if (material) {
        list = list.filter(p => p.material.toLowerCase() === material.toLowerCase());
      }
      if (minPrice !== undefined) {
        list = list.filter(p => {
          const effectivePrice = p.salePrice !== undefined && p.salePrice !== null ? p.salePrice : p.price;
          return effectivePrice >= minPrice;
        });
      }
      if (maxPrice !== undefined) {
        list = list.filter(p => {
          const effectivePrice = p.salePrice !== undefined && p.salePrice !== null ? p.salePrice : p.price;
          return effectivePrice <= maxPrice;
        });
      }

      if (search) {
        const queryStr = search.toLowerCase();
        list = list.filter(p => 
          p.name.toLowerCase().includes(queryStr) ||
          p.sku.toLowerCase().includes(queryStr) ||
          p.material.toLowerCase().includes(queryStr) ||
          p.description.toLowerCase().includes(queryStr) ||
          p.shortDescription.toLowerCase().includes(queryStr)
        );
      }

      // Sorting
      if (sort === 'price-asc') {
        list.sort((a, b) => {
          const pA = a.salePrice !== undefined && a.salePrice !== null ? a.salePrice : a.price;
          const pB = b.salePrice !== undefined && b.salePrice !== null ? b.salePrice : b.price;
          return pA - pB;
        });
      } else if (sort === 'price-desc') {
        list.sort((a, b) => {
          const pA = a.salePrice !== undefined && a.salePrice !== null ? a.salePrice : a.price;
          const pB = b.salePrice !== undefined && b.salePrice !== null ? b.salePrice : b.price;
          return pB - pA;
        });
      } else if (sort === 'featured') {
        list.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0; // maintain order
        });
      } else {
        // default "newest" / ID descending
        list.sort((a, b) => {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        });
      }

      const total = list.length;
      const paginated = list.slice(skip, skip + limit);

      return { products: paginated, total };
    }
  }

  async getProductById(id: string): Promise<Product | null> {
    if (this.isMongoConnected) {
      try {
        const doc = await MongooseProduct.findById(id).lean();
        if (!doc) return null;
        return {
          _id: doc._id.toString(),
          name: doc.name,
          slug: doc.slug,
          description: doc.description,
          shortDescription: doc.shortDescription,
          category: doc.category,
          sku: doc.sku,
          price: doc.price,
          salePrice: doc.salePrice,
          material: doc.material,
          purity: doc.purity,
          weight: doc.weight,
          stock: doc.stock,
          featured: doc.featured,
          bestSeller: doc.bestSeller,
          newArrival: doc.newArrival,
          status: doc.status,
          images: doc.images,
          seoTitle: doc.seoTitle,
          seoDescription: doc.seoDescription,
          createdAt: doc.createdAt ? doc.createdAt.toISOString() : undefined,
          updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : undefined,
        };
      } catch {
        return null;
      }
    } else {
      this.readLocalDb();
      return this.localDb.products.find(p => p._id === id) || null;
    }
  }

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (this.isMongoConnected) {
      const doc = await MongooseProduct.findOne({ slug }).lean();
      if (!doc) return null;
      return {
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        shortDescription: doc.shortDescription,
        category: doc.category,
        sku: doc.sku,
        price: doc.price,
        salePrice: doc.salePrice,
        material: doc.material,
        purity: doc.purity,
        weight: doc.weight,
        stock: doc.stock,
        featured: doc.featured,
        bestSeller: doc.bestSeller,
        newArrival: doc.newArrival,
        status: doc.status,
        images: doc.images,
        seoTitle: doc.seoTitle,
        seoDescription: doc.seoDescription,
        createdAt: doc.createdAt ? doc.createdAt.toISOString() : undefined,
        updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : undefined,
      };
    } else {
      this.readLocalDb();
      return this.localDb.products.find(p => p.slug === slug) || null;
    }
  }

  async createProduct(prodData: Partial<Product>): Promise<Product> {
    if (this.isMongoConnected) {
      const doc = await MongooseProduct.create(prodData);
      return {
        _id: doc._id.toString(),
        name: doc.name,
        slug: doc.slug,
        description: doc.description,
        shortDescription: doc.shortDescription,
        category: doc.category,
        sku: doc.sku,
        price: doc.price,
        salePrice: doc.salePrice,
        material: doc.material,
        purity: doc.purity,
        weight: doc.weight,
        stock: doc.stock,
        featured: doc.featured,
        bestSeller: doc.bestSeller,
        newArrival: doc.newArrival,
        status: doc.status,
        images: doc.images,
        seoTitle: doc.seoTitle,
        seoDescription: doc.seoDescription
      };
    } else {
      this.readLocalDb();
      const newProd: Product = {
        _id: 'prod_' + Math.random().toString(36).substr(2, 9),
        name: prodData.name || '',
        slug: prodData.slug || '',
        description: prodData.description || '',
        shortDescription: prodData.shortDescription || '',
        category: prodData.category || '',
        sku: prodData.sku || '',
        price: Number(prodData.price) || 0,
        salePrice: prodData.salePrice !== undefined && prodData.salePrice !== null ? Number(prodData.salePrice) : undefined,
        material: prodData.material || '',
        purity: prodData.purity || '',
        weight: Number(prodData.weight) || 0,
        stock: Number(prodData.stock) || 0,
        featured: !!prodData.featured,
        bestSeller: !!prodData.bestSeller,
        newArrival: !!prodData.newArrival,
        status: prodData.status || 'active',
        images: Array.isArray(prodData.images) ? prodData.images : [],
        seoTitle: prodData.seoTitle || '',
        seoDescription: prodData.seoDescription || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.localDb.products.push(newProd);
      this.saveLocalDb();
      return newProd;
    }
  }

  async updateProduct(id: string, prodData: Partial<Product>): Promise<Product | null> {
    if (this.isMongoConnected) {
      try {
        const doc = await MongooseProduct.findByIdAndUpdate(id, prodData, { new: true }).lean();
        if (!doc) return null;
        return {
          _id: doc._id.toString(),
          name: doc.name,
          slug: doc.slug,
          description: doc.description,
          shortDescription: doc.shortDescription,
          category: doc.category,
          sku: doc.sku,
          price: doc.price,
          salePrice: doc.salePrice,
          material: doc.material,
          purity: doc.purity,
          weight: doc.weight,
          stock: doc.stock,
          featured: doc.featured,
          bestSeller: doc.bestSeller,
          newArrival: doc.newArrival,
          status: doc.status,
          images: doc.images,
          seoTitle: doc.seoTitle,
          seoDescription: doc.seoDescription
        };
      } catch {
        return null;
      }
    } else {
      this.readLocalDb();
      const idx = this.localDb.products.findIndex(p => p._id === id);
      if (idx === -1) return null;
      const updated: Product = {
        ...this.localDb.products[idx],
        ...prodData,
        price: prodData.price !== undefined ? Number(prodData.price) : this.localDb.products[idx].price,
        salePrice: prodData.salePrice !== undefined ? (prodData.salePrice === null ? undefined : Number(prodData.salePrice)) : this.localDb.products[idx].salePrice,
        weight: prodData.weight !== undefined ? Number(prodData.weight) : this.localDb.products[idx].weight,
        stock: prodData.stock !== undefined ? Number(prodData.stock) : this.localDb.products[idx].stock,
        updatedAt: new Date().toISOString()
      };
      this.localDb.products[idx] = updated;
      this.saveLocalDb();
      return updated;
    }
  }

  async deleteProduct(id: string): Promise<boolean> {
    if (this.isMongoConnected) {
      try {
        const res = await MongooseProduct.findByIdAndDelete(id);
        return !!res;
      } catch {
        return false;
      }
    } else {
      this.readLocalDb();
      const initialLen = this.localDb.products.length;
      this.localDb.products = this.localDb.products.filter(p => p._id !== id);
      if (this.localDb.products.length !== initialLen) {
        this.saveLocalDb();
        return true;
      }
      return false;
    }
  }

  // ==========================================
  // DASHBOARD STATS
  // ==========================================
  async getDashboardStats(): Promise<DashboardStats> {
    if (this.isMongoConnected) {
      const [totalProducts, totalCategories, lowStockCount, featuredCount] = await Promise.all([
        MongooseProduct.countDocuments(),
        MongooseCategory.countDocuments(),
        MongooseProduct.countDocuments({ stock: { $lt: 5 } }),
        MongooseProduct.countDocuments({ featured: true }),
      ]);

      // Category counts aggregation
      const categories = await MongooseCategory.find().lean();
      const products = await MongooseProduct.find().lean();

      const catCountsMap: Record<string, number> = {};
      products.forEach((p: any) => {
        catCountsMap[p.category] = (catCountsMap[p.category] || 0) + 1;
      });

      const categoryStats = categories.map((c: any) => ({
        name: c.name,
        count: catCountsMap[c._id.toString()] || 0
      }));

      // Material counts
      const materialCountsMap: Record<string, number> = {};
      products.forEach((p: any) => {
        const m = p.material || 'Other';
        materialCountsMap[m] = (materialCountsMap[m] || 0) + 1;
      });

      const materialStats = Object.keys(materialCountsMap).map(name => ({
        name,
        count: materialCountsMap[name]
      }));

      return {
        totalProducts,
        totalCategories,
        lowStockCount,
        featuredCount,
        categoryStats,
        materialStats
      };
    } else {
      this.readLocalDb();
      const products = this.localDb.products;
      const categories = this.localDb.categories;

      const totalProducts = products.length;
      const totalCategories = categories.length;
      const lowStockCount = products.filter(p => p.stock < 5).length;
      const featuredCount = products.filter(p => p.featured).length;

      // Category Stats
      const catCountsMap: Record<string, number> = {};
      products.forEach(p => {
        catCountsMap[p.category] = (catCountsMap[p.category] || 0) + 1;
      });
      const categoryStats = categories.map(c => ({
        name: c.name,
        count: catCountsMap[c._id] || 0
      }));

      // Material Stats
      const materialCountsMap: Record<string, number> = {};
      products.forEach(p => {
        const m = p.material || 'Other';
        materialCountsMap[m] = (materialCountsMap[m] || 0) + 1;
      });
      const materialStats = Object.keys(materialCountsMap).map(name => ({
        name,
        count: materialCountsMap[name]
      }));

      return {
        totalProducts,
        totalCategories,
        lowStockCount,
        featuredCount,
        categoryStats,
        materialStats
      };
    }
  }

  // ==========================================
  // ORDERS / PAYMENTS / PURCHASES
  // ==========================================

  private mapOrder(doc: any): Order {
    return {
      _id: doc._id?.toString?.() ?? String(doc._id),
      invoiceNumber: doc.invoiceNumber,
      items: (doc.items || []).map((i: any) => ({
        productId: i.productId,
        name: i.name,
        sku: i.sku,
        image: i.image,
        price: i.price,
        quantity: i.quantity,
      })),
      shippingAddress: doc.shippingAddress,
      subtotal: doc.subtotal,
      discount: doc.discount ?? 0,
      tax: doc.tax ?? 0,
      shipping: doc.shipping ?? 0,
      total: doc.total,
      currency: doc.currency || 'INR',
      paymentStatus: doc.paymentStatus,
      orderStatus: doc.orderStatus,
      razorpayOrderId: doc.razorpayOrderId,
      notes: doc.notes instanceof Map ? Object.fromEntries(doc.notes) : doc.notes,
      createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
      updatedAt: doc.updatedAt?.toISOString?.() ?? doc.updatedAt,
    };
  }

  private mapPayment(doc: any): Payment {
    return {
      _id: doc._id?.toString?.() ?? String(doc._id),
      orderId: doc.orderId,
      razorpayOrderId: doc.razorpayOrderId,
      razorpayPaymentId: doc.razorpayPaymentId,
      razorpaySignature: doc.razorpaySignature,
      amount: doc.amount,
      currency: doc.currency || 'INR',
      status: doc.status,
      method: doc.method,
      email: doc.email,
      contact: doc.contact,
      receipt: doc.receipt,
      notes: doc.notes instanceof Map ? Object.fromEntries(doc.notes) : doc.notes,
      refundStatus: doc.refundStatus || 'none',
      createdAt: doc.createdAt?.toISOString?.() ?? doc.createdAt,
      updatedAt: doc.updatedAt?.toISOString?.() ?? doc.updatedAt,
    };
  }

  async createPendingOrder(data: {
    invoiceNumber: string;
    items: OrderItem[];
    shippingAddress: ShippingAddress;
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    currency?: string;
    notes?: Record<string, string>;
  }): Promise<Order> {
    if (this.isMongoConnected) {
      const doc = await MongooseOrder.create({
        ...data,
        currency: data.currency || 'INR',
        paymentStatus: 'pending',
        orderStatus: 'pending',
      });
      return this.mapOrder(doc);
    }

    this.readLocalDb();
    const order: Order = {
      _id: `ord_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      invoiceNumber: data.invoiceNumber,
      items: data.items,
      shippingAddress: data.shippingAddress,
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      shipping: data.shipping,
      total: data.total,
      currency: data.currency || 'INR',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.localDb.orders.push(order);
    this.saveLocalDb();
    return order;
  }

  async attachRazorpayOrderId(orderId: string, razorpayOrderId: string): Promise<Order | null> {
    if (this.isMongoConnected) {
      const doc = await MongooseOrder.findByIdAndUpdate(
        orderId,
        { razorpayOrderId },
        { new: true }
      );
      return doc ? this.mapOrder(doc) : null;
    }

    this.readLocalDb();
    const idx = this.localDb.orders.findIndex((o) => o._id === orderId);
    if (idx < 0) return null;
    this.localDb.orders[idx].razorpayOrderId = razorpayOrderId;
    this.localDb.orders[idx].updatedAt = new Date().toISOString();
    this.saveLocalDb();
    return this.localDb.orders[idx];
  }

  async createPendingPayment(data: {
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency?: string;
    email?: string;
    contact?: string;
    receipt?: string;
    notes?: Record<string, string>;
  }): Promise<Payment> {
    if (this.isMongoConnected) {
      const doc = await MongoosePayment.create({
        ...data,
        currency: data.currency || 'INR',
        status: 'pending',
        refundStatus: 'none',
      });
      return this.mapPayment(doc);
    }

    this.readLocalDb();
    const payment: Payment = {
      _id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      orderId: data.orderId,
      razorpayOrderId: data.razorpayOrderId,
      amount: data.amount,
      currency: data.currency || 'INR',
      status: 'pending',
      email: data.email,
      contact: data.contact,
      receipt: data.receipt,
      notes: data.notes,
      refundStatus: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.localDb.payments.push(payment);
    this.saveLocalDb();
    return payment;
  }

  async getOrderById(id: string): Promise<Order | null> {
    if (this.isMongoConnected) {
      const doc = await MongooseOrder.findById(id).lean();
      return doc ? this.mapOrder(doc) : null;
    }
    this.readLocalDb();
    return this.localDb.orders.find((o) => o._id === id) || null;
  }

  async getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
    if (this.isMongoConnected) {
      const doc = await MongooseOrder.findOne({ razorpayOrderId }).lean();
      return doc ? this.mapOrder(doc) : null;
    }
    this.readLocalDb();
    return this.localDb.orders.find((o) => o.razorpayOrderId === razorpayOrderId) || null;
  }

  async getOrders(filters?: { email?: string; paymentStatus?: string }): Promise<Order[]> {
    if (this.isMongoConnected) {
      const q: Record<string, unknown> = {};
      if (filters?.email) q['shippingAddress.email'] = filters.email.toLowerCase();
      if (filters?.paymentStatus) q.paymentStatus = filters.paymentStatus;
      const docs = await MongooseOrder.find(q).sort({ createdAt: -1 }).lean();
      return docs.map((d) => this.mapOrder(d));
    }

    this.readLocalDb();
    let list = [...this.localDb.orders];
    if (filters?.email) {
      const email = filters.email.toLowerCase();
      list = list.filter((o) => o.shippingAddress.email.toLowerCase() === email);
    }
    if (filters?.paymentStatus) {
      list = list.filter((o) => o.paymentStatus === filters.paymentStatus);
    }
    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    if (this.isMongoConnected) {
      const doc = await MongoosePayment.findById(id).lean();
      return doc ? this.mapPayment(doc) : null;
    }
    this.readLocalDb();
    return this.localDb.payments.find((p) => p._id === id) || null;
  }

  async getPaymentByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    if (this.isMongoConnected) {
      const doc = await MongoosePayment.findOne({ razorpayOrderId }).lean();
      return doc ? this.mapPayment(doc) : null;
    }
    this.readLocalDb();
    return this.localDb.payments.find((p) => p.razorpayOrderId === razorpayOrderId) || null;
  }

  async getPaymentByRazorpayPaymentId(razorpayPaymentId: string): Promise<Payment | null> {
    if (this.isMongoConnected) {
      const doc = await MongoosePayment.findOne({ razorpayPaymentId }).lean();
      return doc ? this.mapPayment(doc) : null;
    }
    this.readLocalDb();
    return this.localDb.payments.find((p) => p.razorpayPaymentId === razorpayPaymentId) || null;
  }

  async getPayments(): Promise<Payment[]> {
    if (this.isMongoConnected) {
      const docs = await MongoosePayment.find().sort({ createdAt: -1 }).lean();
      return docs.map((d) => this.mapPayment(d));
    }
    this.readLocalDb();
    return [...this.localDb.payments].sort((a, b) =>
      (b.createdAt || '').localeCompare(a.createdAt || '')
    );
  }

  async markPaymentFailed(razorpayOrderId: string): Promise<void> {
    if (this.isMongoConnected) {
      await MongoosePayment.findOneAndUpdate(
        { razorpayOrderId, status: 'pending' },
        { status: 'failed' }
      );
      await MongooseOrder.findOneAndUpdate(
        { razorpayOrderId, paymentStatus: 'pending' },
        { paymentStatus: 'failed' }
      );
      return;
    }

    this.readLocalDb();
    const pIdx = this.localDb.payments.findIndex(
      (p) => p.razorpayOrderId === razorpayOrderId && p.status === 'pending'
    );
    if (pIdx >= 0) {
      this.localDb.payments[pIdx].status = 'failed';
      this.localDb.payments[pIdx].updatedAt = new Date().toISOString();
    }
    const oIdx = this.localDb.orders.findIndex(
      (o) => o.razorpayOrderId === razorpayOrderId && o.paymentStatus === 'pending'
    );
    if (oIdx >= 0) {
      this.localDb.orders[oIdx].paymentStatus = 'failed';
      this.localDb.orders[oIdx].updatedAt = new Date().toISOString();
    }
    this.saveLocalDb();
  }

  /**
   * Finalize paid order: verify idempotency, decrement stock, create purchases.
   * Uses a Mongo session transaction when available.
   */
  async finalizePaidOrder(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    method?: string;
  }): Promise<{ order: Order; payment: Payment; alreadyProcessed: boolean }> {
    const existingByPaymentId = await this.getPaymentByRazorpayPaymentId(params.razorpayPaymentId);
    if (existingByPaymentId?.status === 'paid') {
      const order = await this.getOrderById(existingByPaymentId.orderId);
      if (!order) throw new Error('Order missing for completed payment.');
      return { order, payment: existingByPaymentId, alreadyProcessed: true };
    }

    const payment = await this.getPaymentByRazorpayOrderId(params.razorpayOrderId);
    if (!payment) throw new Error('Payment record not found.');

    if (payment.status === 'paid') {
      const order = await this.getOrderById(payment.orderId);
      if (!order) throw new Error('Order missing for completed payment.');
      return { order, payment, alreadyProcessed: true };
    }

    const order = await this.getOrderById(payment.orderId);
    if (!order) throw new Error('Order not found.');

    if (this.isMongoConnected) {
      const session = await mongoose.startSession();
      try {
        session.startTransaction();

        for (const item of order.items) {
          const updated = await MongooseProduct.findOneAndUpdate(
            { _id: item.productId, stock: { $gte: item.quantity } },
            { $inc: { stock: -item.quantity } },
            { new: true, session }
          );
          if (!updated) {
            throw new Error(`Insufficient stock for product ${item.name}`);
          }
        }

        const purchases = order.items.map((item) => ({
          orderId: order._id,
          productId: item.productId,
          price: item.price,
          quantity: item.quantity,
          licenseType: 'standard',
          downloadLimit: 0,
          downloadCount: 0,
          status: 'active' as const,
          email: order.shippingAddress.email,
        }));
        await MongoosePurchase.insertMany(purchases, { session });

        const paidPayment = await MongoosePayment.findByIdAndUpdate(
          payment._id,
          {
            status: 'paid',
            razorpayPaymentId: params.razorpayPaymentId,
            razorpaySignature: params.razorpaySignature,
            method: params.method || 'razorpay',
          },
          { new: true, session }
        );

        const paidOrder = await MongooseOrder.findByIdAndUpdate(
          order._id,
          {
            paymentStatus: 'paid',
            orderStatus: 'confirmed',
          },
          { new: true, session }
        );

        await session.commitTransaction();

        return {
          order: this.mapOrder(paidOrder!),
          payment: this.mapPayment(paidPayment!),
          alreadyProcessed: false,
        };
      } catch (err) {
        await session.abortTransaction();
        throw err;
      } finally {
        session.endSession();
      }
    }

    // Local JSON fallback (no multi-doc transactions)
    this.readLocalDb();

    for (const item of order.items) {
      const pIdx = this.localDb.products.findIndex((p) => p._id === item.productId);
      if (pIdx < 0 || this.localDb.products[pIdx].stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.name}`);
      }
    }

    for (const item of order.items) {
      const pIdx = this.localDb.products.findIndex((p) => p._id === item.productId);
      this.localDb.products[pIdx].stock -= item.quantity;
    }

    const purchases: Purchase[] = order.items.map((item) => ({
      _id: `pur_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      orderId: order._id,
      productId: item.productId,
      price: item.price,
      quantity: item.quantity,
      licenseType: 'standard',
      downloadLimit: 0,
      downloadCount: 0,
      status: 'active',
      email: order.shippingAddress.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    this.localDb.purchases.push(...purchases);

    const payIdx = this.localDb.payments.findIndex((p) => p._id === payment._id);
    this.localDb.payments[payIdx] = {
      ...this.localDb.payments[payIdx],
      status: 'paid',
      razorpayPaymentId: params.razorpayPaymentId,
      razorpaySignature: params.razorpaySignature,
      method: params.method || 'razorpay',
      updatedAt: new Date().toISOString(),
    };

    const ordIdx = this.localDb.orders.findIndex((o) => o._id === order._id);
    this.localDb.orders[ordIdx] = {
      ...this.localDb.orders[ordIdx],
      paymentStatus: 'paid',
      orderStatus: 'confirmed',
      updatedAt: new Date().toISOString(),
    };

    this.saveLocalDb();

    return {
      order: this.localDb.orders[ordIdx],
      payment: this.localDb.payments[payIdx],
      alreadyProcessed: false,
    };
  }
}

export const dbService = new DbService();
