import { Router, Request, Response } from 'express';
import path from 'path';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { dbService } from '../db/dbService.js';
import { authMiddleware, AuthenticatedRequest, JWT_SECRET } from '../middleware/auth.js';
import paymentsRouter from './payments.js';
import { readImageSize } from '../db/imageDimensions.js';
import { HERO_BANNER_MAX_BYTES, bannerSizeError } from '../bannerSpec.js';
import { listProductLibraryImages, saveUploadedImage } from '../db/imageStorage.js';

const ALLOWED_IMAGE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const ALLOWED_VIDEO_EXT = new Set(['.mp4', '.webm', '.mov']);

const router = Router();

router.use(paymentsRouter);

// GET /api/db-status — verify production is using MongoDB (not ephemeral JSON)
router.get('/db-status', async (_req: Request, res: Response) => {
  res.json(dbService.getDbStatus());
});

// Helper to create slugs
function cleanMediaUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => String(item || '').trim()).filter(Boolean);
}

function pickMainImage(images: string[], mainImage: unknown): string {
  const chosen = typeof mainImage === 'string' ? mainImage.trim() : '';
  if (chosen && images.includes(chosen)) return chosen;
  return images[0] || '';
}

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
  const {
    name,
    description,
    status,
    displayOrder,
    seoTitle,
    seoDescription,
    megaPromoImage,
    megaPromoCaption,
    megaPromoLink,
    megaPromoLinkLabel,
  } = req.body;

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
      seoDescription: seoDescription || `Explore the finest selection of luxury ${name} designs.`,
      megaPromoImage: megaPromoImage || '',
      megaPromoCaption: megaPromoCaption || '',
      megaPromoLink: megaPromoLink || '',
      megaPromoLinkLabel: megaPromoLinkLabel || '',
    });

    res.status(201).json(newCat);
  } catch (err) {
    console.error('Create category error:', err);
    const message = err instanceof Error ? err.message : 'Could not create category.';
    res.status(500).json({ error: message });
  }
});

// PUT /api/categories/:id
router.put('/categories/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const {
    name,
    description,
    status,
    displayOrder,
    seoTitle,
    seoDescription,
    megaPromoImage,
    megaPromoCaption,
    megaPromoLink,
    megaPromoLinkLabel,
  } = req.body;

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
      seoDescription,
      megaPromoImage,
      megaPromoCaption,
      megaPromoLink,
      megaPromoLinkLabel,
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

function isAdminRequest(req: Request): boolean {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  try {
    jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// SUBCATEGORIES
// ==========================================

const VALID_SUB_GROUPS = new Set([
  'style',
  'material',
  'price',
  'audience',
  'occasion',
  'collection',
  'accessories',
  'chains',
]);

router.get('/subcategories', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.status === 'all';
    if (includeInactive && !isAdminRequest(req)) {
      res.status(401).json({ error: 'Access denied. Unauthorized credentials.' });
      return;
    }
    const categoryId = typeof req.query.categoryId === 'string' ? req.query.categoryId : undefined;
    const items = await dbService.getSubCategories({ categoryId, includeInactive });
    res.json(items);
  } catch (err) {
    console.error('Error listing subcategories:', err);
    res.status(500).json({ error: 'Failed to retrieve subcategories.' });
  }
});

router.get('/subcategories/:id', async (req: Request, res: Response) => {
  try {
    const item = await dbService.getSubCategoryById(req.params.id);
    if (!item) {
      res.status(404).json({ error: 'Subcategory not found.' });
      return;
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve subcategory.' });
  }
});

router.post('/subcategories', authMiddleware, async (req: Request, res: Response) => {
  const { name, slug, categoryId, group, image, link, displayOrder, status } = req.body;
  if (!name || !String(name).trim()) {
    res.status(400).json({ error: 'Subcategory name is required.' });
    return;
  }
  if (!categoryId) {
    res.status(400).json({ error: 'Parent category is required.' });
    return;
  }
  if (!group || !VALID_SUB_GROUPS.has(group)) {
    res.status(400).json({ error: 'A valid mega-menu group is required.' });
    return;
  }

  try {
    const parent = await dbService.getCategoryById(categoryId);
    if (!parent) {
      res.status(400).json({ error: 'Invalid parent category.' });
      return;
    }

    const finalSlug = slugify(slug || name);
    const item = await dbService.createSubCategory({
      name: String(name).trim(),
      slug: finalSlug,
      categoryId,
      group,
      image: image || '',
      link: link || '',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      status: status === 'inactive' ? 'inactive' : 'active',
    });
    res.status(201).json(item);
  } catch (err) {
    console.error('Error creating subcategory:', err);
    const message = err instanceof Error ? err.message : 'Failed to create subcategory.';
    res.status(500).json({ error: message });
  }
});

router.put('/subcategories/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, slug, categoryId, group, image, link, displayOrder, status } = req.body;

  try {
    const current = await dbService.getSubCategoryById(id);
    if (!current) {
      res.status(404).json({ error: 'Subcategory not found.' });
      return;
    }

    if (categoryId) {
      const parent = await dbService.getCategoryById(categoryId);
      if (!parent) {
        res.status(400).json({ error: 'Invalid parent category.' });
        return;
      }
    }

    if (group && !VALID_SUB_GROUPS.has(group)) {
      res.status(400).json({ error: 'Invalid mega-menu group.' });
      return;
    }

    const updated = await dbService.updateSubCategory(id, {
      name: name !== undefined ? String(name).trim() : current.name,
      slug: slug !== undefined ? slugify(slug) : name !== undefined ? slugify(name) : current.slug,
      categoryId: categoryId || current.categoryId,
      group: group || current.group,
      image: image !== undefined ? String(image).trim() : current.image,
      link: link !== undefined ? String(link).trim() : current.link,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : current.displayOrder,
      status: status === 'inactive' ? 'inactive' : status === 'active' ? 'active' : current.status,
    });

    if (!updated) {
      res.status(404).json({ error: 'Subcategory not found.' });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error('Error updating subcategory:', err);
    res.status(500).json({ error: 'Failed to update subcategory.' });
  }
});

router.delete('/subcategories/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const success = await dbService.deleteSubCategory(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Subcategory not found or already deleted.' });
      return;
    }
    res.json({ success: true, message: 'Subcategory removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subcategory.' });
  }
});

router.post('/subcategory-images', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { filename, data } = req.body as { filename?: string; data?: string };
    if (!data || typeof data !== 'string') {
      res.status(400).json({ error: 'Image data is required.' });
      return;
    }

    const match = data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Invalid image data. Use a JPG, PNG, WEBP, or GIF file.' });
      return;
    }

    const mime = match[1].toLowerCase();
    const extFromMime =
      mime === 'image/jpeg' ? '.jpg' :
      mime === 'image/png' ? '.png' :
      mime === 'image/webp' ? '.webp' :
      mime === 'image/gif' ? '.gif' :
      '';
    const extFromName = path.extname(filename || '').toLowerCase();
    const ext = ALLOWED_IMAGE_EXT.has(extFromName) ? (extFromName === '.jpeg' ? '.jpg' : extFromName) : extFromMime;

    if (!ext || !ALLOWED_IMAGE_EXT.has(ext)) {
      res.status(400).json({ error: 'Only JPG, PNG, WEBP, and GIF images are allowed.' });
      return;
    }

    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 5 * 1024 * 1024) {
      res.status(400).json({ error: 'Image must be 5MB or smaller.' });
      return;
    }

    const safeName = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const url = await saveUploadedImage({
      folder: 'subcategories',
      filename: safeName,
      buffer,
      contentType: mime,
    });
    res.status(201).json({ url });
  } catch (err) {
    console.error('Error uploading subcategory image:', err);
    const message = err instanceof Error ? err.message : 'Failed to upload subcategory image.';
    res.status(500).json({ error: message });
  }
});

// ==========================================
// HERO BANNERS
// ==========================================

router.get('/banners', async (req: Request, res: Response) => {
  try {
    const includeInactive = req.query.status === 'all';
    if (includeInactive && !isAdminRequest(req)) {
      res.status(401).json({ error: 'Access denied. Unauthorized credentials.' });
      return;
    }
    const banners = await dbService.getBanners(includeInactive);
    res.json(banners);
  } catch (err) {
    console.error('Error listing banners:', err);
    res.status(500).json({ error: 'Failed to retrieve hero banners.' });
  }
});

router.post('/banners', authMiddleware, async (req: Request, res: Response) => {
  const { title, alt, image, link, displayOrder, status } = req.body;
  if (!title || !String(title).trim()) {
    res.status(400).json({ error: 'Banner title is required.' });
    return;
  }
  if (!image || !String(image).trim()) {
    res.status(400).json({ error: 'Banner image is required.' });
    return;
  }

  try {
    const banner = await dbService.createBanner({
      title: String(title).trim(),
      alt: alt ? String(alt).trim() : String(title).trim(),
      image: String(image).trim(),
      link: link ? String(link).trim() : '/shop',
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
      status: status === 'inactive' ? 'inactive' : 'active',
    });
    res.status(201).json(banner);
  } catch (err) {
    console.error('Error creating banner:', err);
    res.status(500).json({ error: 'Failed to create hero banner.' });
  }
});

router.put('/banners/:id', authMiddleware, async (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, alt, image, link, displayOrder, status } = req.body;

  try {
    const current = await dbService.getBannerById(id);
    if (!current) {
      res.status(404).json({ error: 'Banner not found.' });
      return;
    }

    const updated = await dbService.updateBanner(id, {
      title: title !== undefined ? String(title).trim() : current.title,
      alt: alt !== undefined ? String(alt).trim() : current.alt,
      image: image !== undefined ? String(image).trim() : current.image,
      link: link !== undefined ? String(link).trim() : current.link,
      displayOrder: displayOrder !== undefined ? Number(displayOrder) : current.displayOrder,
      status: status === 'inactive' ? 'inactive' : status === 'active' ? 'active' : current.status,
    });

    if (!updated) {
      res.status(404).json({ error: 'Banner not found.' });
      return;
    }
    res.json(updated);
  } catch (err) {
    console.error('Error updating banner:', err);
    res.status(500).json({ error: 'Failed to update hero banner.' });
  }
});

router.delete('/banners/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const success = await dbService.deleteBanner(req.params.id);
    if (!success) {
      res.status(404).json({ error: 'Banner not found or already deleted.' });
      return;
    }
    res.json({ success: true, message: 'Banner removed successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete hero banner.' });
  }
});

router.post('/banner-images', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { filename, data } = req.body as { filename?: string; data?: string };
    if (!data || typeof data !== 'string') {
      res.status(400).json({ error: 'Image data is required.' });
      return;
    }

    const match = data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Invalid image data. Use a JPG, PNG, WEBP, or GIF file.' });
      return;
    }

    const mime = match[1].toLowerCase();
    const extFromMime =
      mime === 'image/jpeg' ? '.jpg' :
      mime === 'image/png' ? '.png' :
      mime === 'image/webp' ? '.webp' :
      mime === 'image/gif' ? '.gif' :
      '';
    const extFromName = path.extname(filename || '').toLowerCase();
    const ext = ALLOWED_IMAGE_EXT.has(extFromName) ? (extFromName === '.jpeg' ? '.jpg' : extFromName) : extFromMime;

    if (!ext || !ALLOWED_IMAGE_EXT.has(ext)) {
      res.status(400).json({ error: 'Only JPG, PNG, WEBP, and GIF images are allowed.' });
      return;
    }

    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > HERO_BANNER_MAX_BYTES) {
      res.status(400).json({ error: 'Image must be 8MB or smaller.' });
      return;
    }

    const size = readImageSize(buffer);
    if (!size) {
      res.status(400).json({ error: 'Could not read the image size. Use a JPG, PNG, WEBP, or GIF file.' });
      return;
    }

    const sizeError = bannerSizeError(size.width, size.height);
    if (sizeError) {
      res.status(400).json({ error: sizeError, width: size.width, height: size.height });
      return;
    }

    const safeName = `banner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const url = await saveUploadedImage({
      folder: 'banner',
      filename: safeName,
      buffer,
      contentType: mime,
    });
    res.status(201).json({ url, width: size.width, height: size.height });
  } catch (err) {
    console.error('Error uploading banner image:', err);
    const message = err instanceof Error ? err.message : 'Failed to upload banner image.';
    res.status(500).json({ error: message });
  }
});

// ==========================================
// PRODUCT IMAGE UPLOADS
// ==========================================

router.get('/product-images', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const images = await listProductLibraryImages(ALLOWED_IMAGE_EXT);
    res.json({ images });
  } catch (err) {
    console.error('Error listing product images:', err);
    res.status(500).json({ error: 'Failed to list product images.' });
  }
});

router.get('/product-media', authMiddleware, async (_req: Request, res: Response) => {
  try {
    const [images, videos] = await Promise.all([
      listProductLibraryImages(ALLOWED_IMAGE_EXT),
      listProductLibraryImages(ALLOWED_VIDEO_EXT),
    ]);
    res.json({ images, videos });
  } catch (err) {
    console.error('Error listing product media:', err);
    res.status(500).json({ error: 'Failed to list product media.' });
  }
});

router.post('/product-images', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { filename, data } = req.body as { filename?: string; data?: string };
    if (!data || typeof data !== 'string') {
      res.status(400).json({ error: 'Image data is required.' });
      return;
    }

    const match = data.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Invalid image data. Use a JPG, PNG, WEBP, or GIF file.' });
      return;
    }

    const mime = match[1].toLowerCase();
    const extFromMime =
      mime === 'image/jpeg' ? '.jpg' :
      mime === 'image/png' ? '.png' :
      mime === 'image/webp' ? '.webp' :
      mime === 'image/gif' ? '.gif' :
      '';
    const extFromName = path.extname(filename || '').toLowerCase();
    const ext = ALLOWED_IMAGE_EXT.has(extFromName) ? (extFromName === '.jpeg' ? '.jpg' : extFromName) : extFromMime;

    if (!ext || !ALLOWED_IMAGE_EXT.has(ext)) {
      res.status(400).json({ error: 'Only JPG, PNG, WEBP, and GIF images are allowed.' });
      return;
    }

    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 8 * 1024 * 1024) {
      res.status(400).json({ error: 'Image must be 8MB or smaller.' });
      return;
    }

    const safeName = `product-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const url = await saveUploadedImage({
      folder: 'products',
      filename: safeName,
      buffer,
      contentType: mime,
    });
    res.status(201).json({ url });
  } catch (err) {
    console.error('Error uploading product image:', err);
    const message = err instanceof Error ? err.message : 'Failed to upload product image.';
    res.status(500).json({ error: message });
  }
});

router.post('/product-videos', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { filename, data } = req.body as { filename?: string; data?: string };
    if (!data || typeof data !== 'string') {
      res.status(400).json({ error: 'Video data is required.' });
      return;
    }

    const match = data.match(/^data:(video\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!match) {
      res.status(400).json({ error: 'Invalid video data. Use an MP4, WEBM, or MOV file.' });
      return;
    }

    const mime = match[1].toLowerCase();
    const extFromMime =
      mime === 'video/mp4' ? '.mp4' :
      mime === 'video/webm' ? '.webm' :
      mime === 'video/quicktime' ? '.mov' :
      '';
    const extFromName = path.extname(filename || '').toLowerCase();
    const ext = ALLOWED_VIDEO_EXT.has(extFromName) ? extFromName : extFromMime;

    if (!ext || !ALLOWED_VIDEO_EXT.has(ext)) {
      res.status(400).json({ error: 'Only MP4, WEBM, and MOV videos are allowed.' });
      return;
    }

    const buffer = Buffer.from(match[2], 'base64');
    if (buffer.length > 8 * 1024 * 1024) {
      res.status(400).json({ error: 'Video must be 8MB or smaller.' });
      return;
    }

    const safeName = `product-video-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    const url = await saveUploadedImage({
      folder: 'products',
      filename: safeName,
      buffer,
      contentType: mime,
    });
    res.status(201).json({ url });
  } catch (err) {
    console.error('Error uploading product video:', err);
    const message = err instanceof Error ? err.message : 'Failed to upload product video.';
    res.status(500).json({ error: message });
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
    videos,
    mainImage,
    seoTitle,
    seoDescription,
    diamondDetails,
    gemstoneDetails,
    metalDetails
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

    const productImages = cleanMediaUrls(images);
    const storedImages = productImages.length > 0 ? productImages : [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=600&q=80'
    ];

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
      images: storedImages,
      videos: cleanMediaUrls(videos),
      mainImage: pickMainImage(storedImages, mainImage),
      seoTitle: seoTitle || `${name} in Premium ${material} | Lukee Jewels`,
      seoDescription: seoDescription || shortDescription || `${name} luxury fine jewelry accessory.`,
      diamondDetails,
      gemstoneDetails,
      metalDetails: metalDetails || { name: material, purity, weight: `${Number(weight)}g` },
    });

    res.status(201).json(newProd);
  } catch (err) {
    console.error('Error creating product:', err);
    const message = err instanceof Error ? err.message : 'Failed to create product.';
    res.status(500).json({ error: message });
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
    videos,
    mainImage,
    seoTitle,
    seoDescription,
    diamondDetails,
    gemstoneDetails,
    metalDetails
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
      images: Array.isArray(images) ? cleanMediaUrls(images) : images,
      videos: Array.isArray(videos) ? cleanMediaUrls(videos) : undefined,
      mainImage: Array.isArray(images)
        ? pickMainImage(cleanMediaUrls(images), mainImage)
        : (typeof mainImage === 'string' ? mainImage.trim() : undefined),
      seoTitle,
      seoDescription,
      diamondDetails,
      gemstoneDetails,
      metalDetails: metalDetails || (material || purity || weight !== undefined
        ? { name: material, purity, weight: weight !== undefined ? `${Number(weight)}g` : undefined }
        : undefined),
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
