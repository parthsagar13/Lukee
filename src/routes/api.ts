import { Router, Request, Response } from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../db/dbService.js';
import { authMiddleware, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth.js';
import paymentsRouter from './payments.js';

const router = Router();

router.use(paymentsRouter);

// Helper to create slugs
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

// ==========================================
// ADMIN AUTHENTICATION
// ==========================================

// POST /api/auth/login
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Please provide both email and password.' });
    return;
  }

  try {
    const admin = await dbService.getAdminByEmail(email);
    if (!admin || !admin.password) {
      res.status(401).json({ error: 'Invalid administrative credentials.' });
      return;
    }

    const isMatch = bcryptjs.compareSync(password, admin.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid administrative credentials.' });
      return;
    }

    // Sign JWT
    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        _id: admin._id,
        email: admin.email,
        name: admin.name
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'An unexpected authentication error occurred.' });
  }
});

// GET /api/auth/me
router.get('/auth/me', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.adminEmail) {
      res.status(401).json({ error: 'Access denied.' });
      return;
    }

    const admin = await dbService.getAdminByEmail(req.adminEmail);
    if (!admin) {
      res.status(404).json({ error: 'Admin account not found.' });
      return;
    }

    res.json({
      _id: admin._id,
      email: admin.email,
      name: admin.name
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch admin details.' });
  }
});


// ==========================================
// CATEGORIES ENDPOINTS
// ==========================================

// GET /api/categories
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const categories = await dbService.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve categories.' });
  }
});

// GET /api/categories/:idOrSlug
router.get('/categories/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    let cat = await dbService.getCategoryById(idOrSlug);
    if (!cat) {
      cat = await dbService.getCategoryBySlug(idOrSlug);
    }

    if (!cat) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }
    res.json(cat);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve category.' });
  }
});

// POST /api/categories
router.post('/categories', authMiddleware, async (req: Request, res: Response) => {
  const { name, description, status, displayOrder, seoTitle, seoDescription } = req.body;

  if (!name) {
    res.status(400).json({ error: 'Category name is required.' });
    return;
  }

  try {
    const slug = slugify(name);
    // check unique slug
    const existing = await dbService.getCategoryBySlug(slug);
    if (existing) {
      res.status(400).json({ error: 'A category with this name or slug already exists.' });
      return;
    }

    const newCat = await dbService.createCategory({
      name,
      slug,
      description: description || '',
      status: status || 'active',
      displayOrder: Number(displayOrder) || 0,
      seoTitle: seoTitle || `${name} Collection | Lukee Jewels`,
      seoDescription: seoDescription || `Explore the finest selection of luxury ${name} designs.`
    });

    res.status(201).json(newCat);
  } catch (err) {
    res.status(500).json({ error: 'Could not create category.' });
  }
});

// PUT /api/categories/:id
router.put('/categories/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, description, status, displayOrder, seoTitle, seoDescription } = req.body;

  try {
    const current = await dbService.getCategoryById(id);
    if (!current) {
      res.status(404).json({ error: 'Category to update not found.' });
      return;
    }

    const updateFields: any = {
      description,
      status,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : undefined,
      seoTitle,
      seoDescription
    };

    if (name && name !== current.name) {
      const newSlug = slugify(name);
      // Ensure new slug is unique
      const existing = await dbService.getCategoryBySlug(newSlug);
      if (existing && existing._id !== id) {
        res.status(400).json({ error: 'A category with this name or slug already exists.' });
        return;
      }
      updateFields.name = name;
      updateFields.slug = newSlug;
    }

    const updated = await dbService.updateCategory(id, updateFields);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category.' });
  }
});

// DELETE /api/categories/:id
router.put('/categories/:id/status', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  if (status !== 'active' && status !== 'inactive') {
    res.status(400).json({ error: 'Status must be active or inactive.' });
    return;
  }
  try {
    const updated = await dbService.updateCategory(id, { status });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update category status.' });
  }
});

router.delete('/categories/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const success = await dbService.deleteCategory(id);
    if (!success) {
      res.status(404).json({ error: 'Category not found or already deleted.' });
      return;
    }
    res.json({ success: true, message: 'Category removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete category.' });
  }
});


// ==========================================
// PRODUCTS ENDPOINTS
// ==========================================

// GET /api/products
router.get('/products', async (req: Request, res: Response) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    material,
    sort,
    limit,
    skip,
    status,
    featured,
    bestSeller,
    newArrival
  } = req.query;

  try {
    let categoryId: string | undefined;

    if (category) {
      // Resolve category slug or id to id
      const catSlugOrId = String(category);
      const cat = await dbService.getCategoryById(catSlugOrId) || await dbService.getCategoryBySlug(catSlugOrId);
      if (cat) {
        categoryId = cat._id;
      } else {
        // Category requested but not found, return empty results
        res.json({ products: [], total: 0 });
        return;
      }
    }

    const filters: any = {
      category: categoryId,
      search: search ? String(search) : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      material: material ? String(material) : undefined,
      sort: sort ? String(sort) : undefined,
      limit: limit ? Number(limit) : undefined,
      skip: skip ? Number(skip) : undefined,
      status: status ? (String(status) as any) : 'active',
      featured: featured === 'true' ? true : undefined,
      bestSeller: bestSeller === 'true' ? true : undefined,
      newArrival: newArrival === 'true' ? true : undefined,
    };

    const results = await dbService.getProducts(filters);
    res.json(results);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to retrieve products.' });
  }
});

// GET /api/products/:idOrSlug
router.get('/products/:idOrSlug', async (req: Request, res: Response) => {
  try {
    const { idOrSlug } = req.params;
    let prod = await dbService.getProductById(idOrSlug);
    if (!prod) {
      prod = await dbService.getProductBySlug(idOrSlug);
    }

    if (!prod) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json(prod);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve product details.' });
  }
});

// POST /api/products
router.post('/products', authMiddleware, async (req: Request, res: Response) => {
  const {
    name,
    description,
    shortDescription,
    category,
    sku,
    price,
    salePrice,
    material,
    purity,
    weight,
    stock,
    featured,
    bestSeller,
    newArrival,
    status,
    images,
    seoTitle,
    seoDescription
  } = req.body;

  // Validations
  if (!name || !category || !sku || price === undefined || !material || !purity || weight === undefined) {
    res.status(400).json({ error: 'Required fields: name, category, sku, price, material, purity, weight.' });
    return;
  }

  try {
    const slug = slugify(name) + '-' + Math.floor(Math.random() * 1000);
    
    // Check if category exists
    const cat = await dbService.getCategoryById(category);
    if (!cat) {
      res.status(400).json({ error: 'Invalid category reference ID.' });
      return;
    }

    const newProd = await dbService.createProduct({
      name,
      slug,
      description,
      shortDescription: shortDescription || '',
      category,
      sku,
      price: Number(price),
      salePrice: salePrice ? Number(salePrice) : undefined,
      material,
      purity,
      weight: Number(weight),
      stock: stock !== undefined ? Number(stock) : 0,
      featured: !!featured,
      bestSeller: !!bestSeller,
      newArrival: !!newArrival,
      status: status || 'active',
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80'
      ],
      seoTitle: seoTitle || `${name} in Premium ${material} | Lukee Jewels`,
      seoDescription: seoDescription || shortDescription || `${name} luxury fine jewelry accessory.`
    });

    res.status(201).json(newProd);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Failed to create product.' });
  }
});

// PUT /api/products/:id
router.put('/products/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    description,
    shortDescription,
    category,
    sku,
    price,
    salePrice,
    material,
    purity,
    weight,
    stock,
    featured,
    bestSeller,
    newArrival,
    status,
    images,
    seoTitle,
    seoDescription
  } = req.body;

  try {
    const current = await dbService.getProductById(id);
    if (!current) {
      res.status(404).json({ error: 'Product to update not found.' });
      return;
    }

    if (category) {
      const cat = await dbService.getCategoryById(category);
      if (!cat) {
        res.status(400).json({ error: 'Invalid category reference ID.' });
        return;
      }
    }

    const updateFields: any = {
      description,
      shortDescription,
      category,
      sku,
      price: price !== undefined ? Number(price) : undefined,
      salePrice: salePrice !== undefined ? (salePrice === '' || salePrice === null ? null : Number(salePrice)) : undefined,
      material,
      purity,
      weight: weight !== undefined ? Number(weight) : undefined,
      stock: stock !== undefined ? Number(stock) : undefined,
      featured,
      bestSeller,
      newArrival,
      status,
      images,
      seoTitle,
      seoDescription
    };

    if (name && name !== current.name) {
      updateFields.name = name;
      updateFields.slug = slugify(name) + '-' + id.substring(id.length - 4);
    }

    const updated = await dbService.updateProduct(id, updateFields);
    res.json(updated);
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Failed to update product.' });
  }
});

// DELETE /api/products/:id
router.delete('/products/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const success = await dbService.deleteProduct(id);
    if (!success) {
      res.status(404).json({ error: 'Product not found or already deleted.' });
      return;
    }
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product.' });
  }
});


// ==========================================
// DASHBOARD ANALYTICS ENDPOINTS
// ==========================================

// GET /api/dashboard/stats
router.get('/dashboard/stats', authMiddleware, async (req: Request, res: Response) => {
  try {
    const stats = await dbService.getDashboardStats();
    res.json(stats);
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: 'Failed to compile dashboard statistics.' });
  }
});

export default router;
