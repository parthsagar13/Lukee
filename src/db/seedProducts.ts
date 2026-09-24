import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import process from 'process';
import { dbService } from './dbService.js';
import { PRODUCT_CATALOG, ProductSeedEntry } from './productCatalog.js';
import { metalNameFromMaterial, metalPurityLabel } from './productSpecs.js';
import { DiamondDetails, MetalDetails } from '../types.js';

function specsForProduct(entry: ProductSeedEntry, index: number): {
  diamondDetails: DiamondDetails;
  metalDetails: MetalDetails;
} {
  const sideCount = 8 + ((index * 3) % 8);
  const centerCount = 1;
  const sideWeight = (0.05 + (index % 5) * 0.01).toFixed(2);
  const centerWeight = (0.12 + (index % 4) * 0.02).toFixed(2);
  const totalWeight = (Number(sideWeight) + Number(centerWeight)).toFixed(2);
  const clarities = ['SI', 'VS', 'SI', 'VS'];
  const colors = ['IJ', 'GH', 'IJ', 'HI'];
  const shapes = ['Round', 'Round', 'Princess', 'Round'];

  return {
    diamondDetails: {
      totalCount: sideCount + centerCount,
      totalWeight: `${totalWeight}ct`,
      settingType: index % 3 === 0 ? 'Prong' : index % 3 === 1 ? 'Pavé' : '',
      groups: [
        {
          count: sideCount,
          clarity: clarities[index % clarities.length],
          color: colors[index % colors.length],
          shape: shapes[index % shapes.length],
          weightApprox: `${sideWeight}ct`,
        },
        {
          count: centerCount,
          clarity: clarities[(index + 1) % clarities.length],
          color: colors[(index + 1) % colors.length],
          shape: 'Round',
          weightApprox: `${centerWeight}ct`,
        },
      ],
    },
    metalDetails: {
      name: metalNameFromMaterial(entry.material),
      purity: metalPurityLabel(entry.purity),
      weight: `${entry.weight}g`,
    },
  };
}

/** Skip duplicate copies like "blacky_201 (1).jpg" and prefer .jpg over .png. */
function listProductImages(dir: string): Set<string> {
  if (!fs.existsSync(dir)) return new Set();

  const files = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .filter((f) => !/\(\d+\)/.test(f));

  const byStem = new Map<string, string>();
  for (const file of files) {
    const stem = path.parse(file).name.toLowerCase();
    const ext = path.parse(file).ext.toLowerCase();
    const existing = byStem.get(stem);
    if (!existing) {
      byStem.set(stem, file);
      continue;
    }
    const existingExt = path.parse(existing).ext.toLowerCase();
    if (existingExt !== '.jpg' && ext === '.jpg') {
      byStem.set(stem, file);
    }
  }

  return new Set(byStem.values());
}

async function clearProductsOnly() {
  const status = dbService.getDbStatus();
  if (status.engine === 'mongodb') {
    const { MongooseProduct } = await import('./mongooseModels.js');
    await MongooseProduct.deleteMany({});
    console.log('Cleared existing products from MongoDB.');
    return;
  }

  const dbFile = path.join(process.cwd(), 'data', 'db.json');
  if (fs.existsSync(dbFile)) {
    const raw = fs.readFileSync(dbFile, 'utf8');
    const parsed = JSON.parse(raw);
    parsed.products = [];
    fs.writeFileSync(dbFile, JSON.stringify(parsed, null, 2), 'utf8');
    console.log('Cleared existing products from local JSON database.');
  }
}

async function runProductSeed() {
  console.log('--- PRODUCT SEED (public/products images) ---');
  await dbService.connect();

  const productsDir = path.join(process.cwd(), 'public', 'products');
  const availableImages = listProductImages(productsDir);

  if (availableImages.size === 0) {
    console.error('No product images found in public/products/. Aborting.');
    process.exit(1);
  }

  const categories = await dbService.getCategories();
  if (categories.length === 0) {
    console.error('No categories found. Run the main seed or create categories first.');
    process.exit(1);
  }

  const categoryBySlug = Object.fromEntries(categories.map((c) => [c.slug, c]));
  const fallbackCategory =
    categoryBySlug['necklaces'] ??
    categoryBySlug['gold-collection'] ??
    categories[0];

  await clearProductsOnly();

  let created = 0;
  let skipped = 0;

  for (const entry of PRODUCT_CATALOG) {
    if (!availableImages.has(entry.image)) {
      console.warn(`  Skip (image missing): ${entry.image} — ${entry.name}`);
      skipped++;
      continue;
    }

    const category = categoryBySlug[entry.categorySlug] ?? fallbackCategory;
    const imagePath = `/products/${entry.image}`;
    const { diamondDetails, metalDetails } = specsForProduct(entry, created + skipped);

    await dbService.createProduct({
      name: entry.name,
      slug: entry.slug,
      description: entry.description,
      shortDescription: entry.shortDescription,
      category: category._id,
      sku: entry.sku,
      price: entry.price,
      salePrice: entry.salePrice,
      material: entry.material,
      purity: entry.purity,
      weight: entry.weight,
      stock: entry.stock,
      featured: entry.featured,
      bestSeller: entry.bestSeller,
      newArrival: entry.newArrival,
      status: entry.status,
      images: [imagePath],
      seoTitle: entry.seoTitle,
      seoDescription: entry.seoDescription,
      diamondDetails,
      metalDetails,
    });

    created++;
    console.log(`  + ${entry.name} [${category.name}] ← ${entry.image}`);
  }

  // Warn about images on disk without catalog entries
  const catalogImages = new Set(PRODUCT_CATALOG.map((e) => e.image));
  for (const file of availableImages) {
    if (!catalogImages.has(file)) {
      console.warn(`  Unmapped image (no catalog entry): ${file}`);
    }
  }

  console.log(`\nDone. Created ${created} products, skipped ${skipped}.`);
  console.log(`Categories used: ${categories.length} existing (not modified).`);
  process.exit(0);
}

runProductSeed().catch((err) => {
  console.error('Product seed failed:', err);
  process.exit(1);
});
