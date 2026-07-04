import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import { dbService } from './dbService.js';
import { Category } from '../types.js';
import { UniqueImageAssigner } from './productImages.js';
import process from 'process';

dotenv.config();

const MATERIALS = [
  { name: '18k Yellow Gold', purity: '18K (750)' },
  { name: '14k White Gold', purity: '14K (585)' },
  { name: '950 Platinum', purity: '950 (95%)' },
  { name: '18k Rose Gold', purity: '18K (750)' },
  { name: '925 Sterling Silver', purity: '925 (92.5%)' }
];

const CATEGORY_NAMES = [
  'Rings', 'Diamond Rings', 'Gold Rings', 'Engagement Rings', 'Wedding Rings',
  'Necklaces', 'Pendants', 'Bracelets', 'Bangles', 'Chains',
  'Earrings', 'Stud Earrings', 'Hoops', 'Diamond Collection', 'Gold Collection',
  'Silver Collection', 'Kids Collection', 'Bridal Collection', 'Men Collection'
];

const ADJECTIVES = ['Elysian', 'Aura', 'Celeste', 'Prism', 'Solas', 'Imperial', 'Aether', 'Luminary', 'Royal', 'Ethereal', 'Sovereign', 'Valkyrie', 'Gilded', 'Lustrous', 'Starlight', 'Seraphina'];
const NOUNS = ['Solitaire', 'Halo', 'Marquise', 'Trilogy', 'Chevron', 'Eternity', 'Cascade', 'Infinity', 'Symphony', 'Cluster', 'Zenith', 'Ascent', 'Riviera', 'Signature', 'Vanguard', 'Aurora'];

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function runSeed() {
  console.log('--- SEEDING DATABASE ---');
  await dbService.connect();

  const status = dbService.getDbStatus();
  console.log(`Database engine active: ${status.engine.toUpperCase()}`);

  // 1. Wipe database (if MongoDB, mongoose handles; if local JSON, dbService wipes)
  if (status.engine === 'mongodb') {
    const { MongooseAdmin, MongooseCategory, MongooseProduct } = await import('./mongooseModels.js');
    await MongooseAdmin.deleteMany({});
    await MongooseCategory.deleteMany({});
    await MongooseProduct.deleteMany({});
    console.log('MongoDB collections cleared.');
  } else {
    // Access and clear JSON database manually
    const fs = await import('fs');
    const path = await import('path');
    const dbFile = path.join(process.cwd(), 'data', 'db.json');
    fs.writeFileSync(dbFile, JSON.stringify({ admins: [], categories: [], products: [] }, null, 2), 'utf8');
    console.log('Local JSON file database reset.');
  }

  // 2. Seed Default Admin
  const hashedPassword = bcryptjs.hashSync('Admin@123', 10);
  await dbService.createAdmin({
    email: 'admin@lukeejewels.com',
    password: hashedPassword,
    name: 'Lukee Admin'
  });
  console.log('Seeded default Admin: admin@lukeejewels.com / Admin@123');

  // 3. Seed Categories
  const categoriesMap: Record<string, Category> = {};
  for (let i = 0; i < CATEGORY_NAMES.length; i++) {
    const name = CATEGORY_NAMES[i];
    const slug = slugify(name);
    const cat = await dbService.createCategory({
      name,
      slug,
      description: `Premium hand-selected pieces from our signature ${name} range.`,
      status: 'active',
      displayOrder: i + 1,
      seoTitle: `Buy Luxury ${name} Online | Lukee Jewels`,
      seoDescription: `Explore our gorgeous and exclusive collection of masterfully crafted ${name}. Certified gems, premium metals, lifetime warranty.`
    });
    categoriesMap[slug] = cat;
    console.log(`Seeded category: ${name} (ID: ${cat._id})`);
  }

  const imageAssigner = new UniqueImageAssigner();

  // 4. Seed 80 Products
  console.log('Generating 80 luxury jewelry products...');
  
  // Categorized product count to balance across our 19 categories
  const categoriesList = Object.values(categoriesMap);
  
  for (let i = 1; i <= 80; i++) {
    // Select category round-robin style
    const category = categoriesList[i % categoriesList.length];
    const material = MATERIALS[i % MATERIALS.length];

    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    
    // Suffix depending on category type
    let suffix = 'Ring';
    if (category.slug.includes('neck') || category.slug.includes('pend') || category.slug.includes('chain')) {
      suffix = 'Necklace';
    } else if (category.slug.includes('ear') || category.slug.includes('stud') || category.slug.includes('hoop')) {
      suffix = 'Earrings';
    } else if (category.slug.includes('brace') || category.slug.includes('bang')) {
      suffix = 'Bracelet';
    } else if (category.slug.includes('men')) {
      suffix = 'Band';
    } else if (category.slug.includes('kid')) {
      suffix = 'Charm';
    }

    const name = `${adj} ${noun} ${suffix}`;
    const slug = `${slugify(name)}-${1000 + i}`;
    const sku = `LK-${category.slug.substring(0, 3).toUpperCase()}-${10000 + i}`;
    
    // Luxury pricing
    const price = Math.floor(1200 + (Math.sin(i) * 500) + (i * 45));
    const salePrice = i % 4 === 0 ? Math.floor(price * 0.85) : undefined; // 25% of products are on sale
    const weight = parseFloat((2.5 + (Math.cos(i) * 1.5) + (i * 0.08)).toFixed(2));
    const stock = Math.floor(2 + (i % 15)); // Stock count between 2 and 16

    const description = `This spectacular ${name} is an embodiment of exquisite artistry and timeless elegance. Hand-forged in premium ${material.name} and boasting a purity of ${material.purity}, this exquisite piece is designed to reflect light from every facet. Our master goldsmiths spend over 40 hours perfecting the micro-pave detailing and polished shank to ensure maximum radiance and a comfortable, ergonomic fit. Every Lukee Jewels purchase comes accompanied by a certified gemstone grading report and a bespoke velvet presentation jewelry box.`;
    
    const shortDescription = `Exquisitely crafted ${name} in brilliant ${material.name} (${material.purity}). A stunning masterpiece showcasing modern luxury design.`;

    const productImages = imageAssigner.assignForProduct(category.slug, i);

    await dbService.createProduct({
      name,
      slug,
      description,
      shortDescription,
      category: category._id,
      sku,
      price,
      salePrice,
      material: material.name,
      purity: material.purity,
      weight,
      stock,
      featured: i % 7 === 0,    // Balanced feature flags
      bestSeller: i % 9 === 0,
      newArrival: i % 5 === 0,
      status: 'active',
      images: productImages,
      seoTitle: `${name} in ${material.name} | Lukee Jewels`,
      seoDescription: `${shortDescription} Shop premium engagement, wedding, and diamond collection items with free worldwide courier shipping.`
    });
  }

  console.log('Seeded 80 luxury jewelry products successfully!');
  console.log('Database seeding completely finished!');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('Seeding encountered fatal error:', err);
  process.exit(1);
});
