import 'dotenv/config';
import { dbService } from './dbService.js';
import type { Category, SubCategoryGroup } from '../types.js';
import { IMAGES } from '../data/luxuryContent.js';

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

type SeedItem = {
  name: string;
  group: SubCategoryGroup;
  image?: string;
  link?: string;
};

type SeedCategory = {
  name: string;
  order: number;
  promoImage: string;
  promoCaption: string;
  promoLinkLabel: string;
  items: SeedItem[];
};

const MATERIAL: SeedItem[] = [
  { name: 'Diamond', group: 'material', image: IMAGES.diamond },
  { name: 'Platinum', group: 'material', image: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=200&q=80' },
  { name: 'Gemstone', group: 'material', image: IMAGES.festive },
  { name: 'Gold', group: 'material', image: IMAGES.gold },
];

const OCCASION: SeedItem[] = [
  { name: 'Daily Wear', group: 'occasion', image: IMAGES.daily },
  { name: 'Casual Outings', group: 'occasion', image: IMAGES.personalized },
  { name: 'Festive', group: 'occasion', image: IMAGES.festive },
  { name: 'Anniversary', group: 'occasion', image: IMAGES.bridal },
  { name: 'Wedding', group: 'occasion', image: IMAGES.bridal },
];

const AUDIENCE: SeedItem[] = [
  { name: 'Women', group: 'audience' },
  { name: 'Men', group: 'audience' },
  { name: 'Kids', group: 'audience' },
];

function prices(ranges: string[]): SeedItem[] {
  return ranges.map((name) => ({ name, group: 'price' as const }));
}

const SEED: SeedCategory[] = [
  {
    name: 'Rings',
    order: 10,
    promoImage: IMAGES.ring,
    promoCaption: 'Sharp and fashionable rings to elevate your style!',
    promoLinkLabel: 'View all designs',
    items: [
      { name: 'Engagement', group: 'style', image: IMAGES.ring },
      { name: 'Solitaire', group: 'style', image: IMAGES.diamond },
      { name: 'Casual', group: 'style', image: IMAGES.daily },
      { name: 'Classic', group: 'style', image: IMAGES.gold },
      { name: 'Navratna', group: 'style', image: IMAGES.festive },
      { name: 'Mangalsutra Ring', group: 'style', image: IMAGES.pendant },
      { name: 'Couple Bands', group: 'style', image: IMAGES.bridal },
      { name: 'Eternity', group: 'style', image: IMAGES.diamond },
      { name: 'Three Stone', group: 'style', image: IMAGES.ring },
      ...MATERIAL,
      ...prices(['Under ₹10K', '₹10K - ₹20K', '₹20K - ₹30K', '₹30K - ₹50K', '₹50K - ₹75K', 'Above ₹75K']),
      ...AUDIENCE,
      ...OCCASION,
    ],
  },
  {
    name: 'Earrings',
    order: 20,
    promoImage: IMAGES.earring,
    promoCaption: 'Subtle and glamorous earrings to complete your outfit!',
    promoLinkLabel: 'View all designs',
    items: [
      { name: 'Studs', group: 'style', image: IMAGES.earring },
      { name: 'Dangles', group: 'style', image: IMAGES.festive },
      { name: 'Sui Dhaga', group: 'style', image: IMAGES.gold },
      { name: 'Navratna', group: 'style', image: IMAGES.festive },
      { name: 'Jhumka', group: 'style', image: IMAGES.bridal },
      { name: 'Hoops', group: 'style', image: IMAGES.earring },
      { name: 'Solitaire', group: 'style', image: IMAGES.diamond },
      ...MATERIAL,
      ...prices(['Under ₹10K', '₹10K - ₹20K', '₹20K - ₹30K', '₹30K - ₹50K', '₹50K - ₹75K', 'Above ₹75K']),
      ...AUDIENCE,
      ...OCCASION,
    ],
  },
  {
    name: 'Necklaces',
    order: 30,
    promoImage: IMAGES.necklace,
    promoCaption: 'Regal and striking necklaces you can make a statement with.',
    promoLinkLabel: 'View all designs',
    items: [
      { name: 'Collar', group: 'style', image: IMAGES.necklace },
      { name: 'Layered', group: 'style', image: IMAGES.chain },
      { name: 'Pendant Necklace', group: 'style', image: IMAGES.pendant },
      { name: 'Charm', group: 'style', image: IMAGES.personalized },
      { name: 'Delicate', group: 'style', image: IMAGES.daily },
      { name: 'Lariat', group: 'style', image: IMAGES.necklace },
      ...MATERIAL,
      ...prices(['Under ₹20K', '₹20K - ₹30K', '₹30K - ₹50K', '₹50K - ₹75K', '₹75K - ₹100K', 'Above ₹100K']),
      ...OCCASION,
    ],
  },
  {
    name: 'Bangles & Bracelets',
    order: 40,
    promoImage: IMAGES.bracelet,
    promoCaption: 'Statement bangles and bracelets for every occasion.',
    promoLinkLabel: 'View all designs',
    items: [
      { name: 'Bangles', group: 'style', image: IMAGES.bracelet },
      { name: 'Bracelets', group: 'style', image: IMAGES.bracelet },
      { name: 'Cuffs', group: 'style', image: IMAGES.gold },
      { name: 'Tennis', group: 'style', image: IMAGES.diamond },
      { name: 'Charm Bracelets', group: 'style', image: IMAGES.personalized },
      ...MATERIAL,
      ...prices(['Under ₹20K', '₹20K - ₹30K', '₹30K - ₹50K', '₹50K - ₹75K', '₹75K - ₹100K', 'Above ₹100K']),
      ...OCCASION,
    ],
  },
  {
    name: 'Solitaires',
    order: 50,
    promoImage: IMAGES.diamond,
    promoCaption: 'Certified solitaires for brilliant moments.',
    promoLinkLabel: 'View all designs',
    items: [
      { name: 'Solitaire Rings', group: 'style', image: IMAGES.ring },
      { name: 'Solitaire Pendants', group: 'style', image: IMAGES.pendant },
      { name: 'Solitaire Earrings', group: 'style', image: IMAGES.earring },
      ...MATERIAL.filter((m) => m.name === 'Diamond' || m.name === 'Platinum' || m.name === 'Gold'),
      ...prices(['Under ₹50K', '₹50K - ₹75K', '₹75K - ₹100K', 'Above ₹100K']),
      ...OCCASION,
    ],
  },
  {
    name: 'Mangalsutras & Pendants',
    order: 60,
    promoImage: IMAGES.pendant,
    promoCaption: 'Versatile accessories for the modern woman!',
    promoLinkLabel: 'View all designs',
    items: [
      { name: 'Mangalsutra Ring', group: 'style', image: IMAGES.ring },
      { name: 'Mangalsutra with Chain', group: 'style', image: IMAGES.pendant },
      { name: 'Mangalsutra Bracelets', group: 'style', image: IMAGES.bracelet },
      { name: 'Mangalsutra Chains', group: 'style', image: IMAGES.chain },
      { name: 'Solitaire Mangalsutra', group: 'style', image: IMAGES.diamond },
      { name: 'Initial Pendants', group: 'style', image: IMAGES.personalized },
      { name: 'Solitaire Pendants', group: 'style', image: IMAGES.pendant },
      { name: 'Pendants with Chain', group: 'style', image: IMAGES.necklace },
      { name: 'Casual Pendants', group: 'style', image: IMAGES.daily },
      ...MATERIAL,
      ...prices(['Under ₹20K', '₹20K - ₹30K', '₹30K - ₹50K', '₹50K - ₹75K', '₹75K - ₹100K', 'Above ₹100K']),
      ...AUDIENCE,
      ...OCCASION,
    ],
  },
  {
    name: 'Other Jewellery',
    order: 70,
    promoImage: IMAGES.promo,
    promoCaption: 'Curated for the bold.',
    promoLinkLabel: 'View all designs',
    items: [
      { name: 'Peacock', group: 'collection', image: IMAGES.festive },
      { name: 'Chafa', group: 'collection', image: IMAGES.gold },
      { name: 'Butterfly', group: 'collection', image: IMAGES.personalized },
      { name: 'Evil Eye', group: 'collection', image: IMAGES.daily },
      { name: 'Miracle Plate', group: 'collection', image: IMAGES.diamond },
      { name: 'Kyra', group: 'collection', image: IMAGES.bridal },
      { name: 'Nose Pin', group: 'accessories', image: IMAGES.gold },
      { name: 'For Watch', group: 'accessories', image: IMAGES.bracelet },
      { name: 'Dailywear Chains', group: 'chains', image: IMAGES.chain },
      { name: 'Fancy Chains', group: 'chains', image: IMAGES.necklace },
      { name: 'Festive Chains', group: 'chains', image: IMAGES.festive },
      { name: 'Platinum Chains', group: 'chains', image: IMAGES.diamond },
    ],
  },
];

async function ensureCategory(seed: SeedCategory, existing: Category[]): Promise<Category> {
  const slug = slugify(seed.name);
  const found = existing.find((c) => c.slug === slug || c.name.toLowerCase() === seed.name.toLowerCase());
  const promo = {
    megaPromoImage: seed.promoImage,
    megaPromoCaption: seed.promoCaption,
    megaPromoLink: `/shop?category=${encodeURIComponent(slug)}`,
    megaPromoLinkLabel: seed.promoLinkLabel,
  };

  if (found) {
    const updated = await dbService.updateCategory(found._id, {
      ...promo,
      displayOrder: seed.order,
      status: 'active',
    });
    return updated || found;
  }

  return dbService.createCategory({
    name: seed.name,
    slug,
    description: `Explore Lukee ${seed.name} with curated styles, materials, and occasions.`,
    status: 'active',
    displayOrder: seed.order,
    seoTitle: `${seed.name} | Lukee Jewels`,
    seoDescription: `Shop ${seed.name} by style, material, and occasion at Lukee Jewels.`,
    ...promo,
  });
}

async function run() {
  console.log('--- SEEDING SUBCATEGORIES ---');
  await dbService.connect();
  console.log(`Database engine: ${dbService.getDbStatus().engine}`);

  let categories = await dbService.getCategories();
  const ensured: Category[] = [];

  for (const seed of SEED) {
    const cat = await ensureCategory(seed, categories);
    ensured.push(cat);
    categories = await dbService.getCategories();
    console.log(`Category ready: ${cat.name}`);
  }

  let created = 0;
  let skipped = 0;

  for (const seed of SEED) {
    const cat = ensured.find((c) => slugify(c.name) === slugify(seed.name))!;
    const existingSubs = await dbService.getSubCategories({
      categoryId: cat._id,
      includeInactive: true,
    });

    for (let i = 0; i < seed.items.length; i++) {
      const item = seed.items[i];
      const slug = slugify(item.name);
      const already = existingSubs.find(
        (s) => s.slug === slug || s.name.toLowerCase() === item.name.toLowerCase()
      );
      if (already) {
        skipped += 1;
        continue;
      }

      const link =
        item.link ||
        (item.group === 'material'
          ? `/shop?category=${encodeURIComponent(cat.slug)}&material=${encodeURIComponent(item.name)}`
          : item.group === 'price' || item.group === 'audience' || item.group === 'occasion'
            ? `/shop?category=${encodeURIComponent(cat.slug)}&search=${encodeURIComponent(item.name)}`
            : `/shop?category=${encodeURIComponent(cat.slug)}&search=${encodeURIComponent(item.name)}`);

      await dbService.createSubCategory({
        name: item.name,
        slug,
        categoryId: cat._id,
        group: item.group,
        image: item.image || '',
        link,
        displayOrder: i + 1,
        status: 'active',
      });
      created += 1;
    }
  }

  console.log(`Subcategories created: ${created}`);
  console.log(`Subcategories skipped (already present): ${skipped}`);
  console.log('--- SUBCATEGORY SEED COMPLETE ---');
  process.exit(0);
}

run().catch((err) => {
  console.error('Subcategory seed failed:', err);
  process.exit(1);
});
