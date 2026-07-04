import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { MongooseAdmin, MongooseCategory, MongooseProduct } from './mongooseModels.js';
import { Admin, Category, Product, DashboardStats } from '../types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface LocalDbSchema {
  admins: Admin[];
  categories: Category[];
  products: Product[];
}

class DbService {
  private isMongoConnected = false;
  private localDb: LocalDbSchema = { admins: [], categories: [], products: [] };

  constructor() {
    this.ensureLocalDir();
  }

  // Ensure local data storage exists
  private ensureLocalDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify({ admins: [], categories: [], products: [] }, null, 2), 'utf8');
    }
    this.readLocalDb();
  }

  private readLocalDb() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      this.localDb = JSON.parse(data);
    } catch (e) {
      this.localDb = { admins: [], categories: [], products: [] };
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
}

export const dbService = new DbService();
