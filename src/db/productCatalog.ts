/**
 * Product catalog mapped to images in public/products/.
 * Each entry fills every Product schema field for seedProducts.ts.
 */
export interface ProductSeedEntry {
  image: string;
  name: string;
  slug: string;
  categorySlug: string;
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
  shortDescription: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
}

export const PRODUCT_CATALOG: ProductSeedEntry[] = [
  {
    image: 'blacky_11.jpg',
    name: 'Celestial Layered Floral Pendant Set',
    slug: 'celestial-layered-floral-pendant-set',
    categorySlug: 'bridal-collection',
    sku: 'LK-BLK-011',
    price: 4899,
    salePrice: 4299,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 12.4,
    stock: 14,
    featured: true,
    bestSeller: true,
    newArrival: false,
    status: 'active',
    shortDescription:
      'Matching necklace and stud earrings with a layered floral pendant on a textured mesh chain.',
    description:
      'An ornate three-piece set featuring a multi-petal floral pendant with ribbed gold detailing and a polished dome centre. The flexible mesh chain and matching floral stud earrings create a cohesive bridal-ready look. Hand-finished for daily elegance with certified Lukee craftsmanship.',
    seoTitle: 'Celestial Layered Floral Pendant Set | Lukee Jewels',
    seoDescription:
      'Shop the Celestial Layered Floral Pendant Set — 18k yellow gold necklace and matching earrings with textured floral motifs.',
  },
  {
    image: 'blacky_12.png',
    name: 'Sacred Om Pendant Necklace',
    slug: 'sacred-om-pendant-necklace',
    categorySlug: 'pendants',
    sku: 'LK-BLK-012',
    price: 2199,
    material: 'Gold Plated Brass',
    purity: '22K Gold Tone',
    weight: 6.8,
    stock: 28,
    featured: false,
    bestSeller: true,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Textured Om symbol pendant on a flat woven gold-tone chain for everyday spiritual wear.',
    description:
      'A devotional daily-wear necklace showcasing a finely detailed Om pendant with a matte dotted texture. Suspended from a flat mesh-style chain, this piece balances spiritual symbolism with modern Lukee finishing.',
    seoTitle: 'Sacred Om Pendant Necklace | Lukee Jewels',
    seoDescription:
      'Gold-tone Om pendant necklace with textured finish and woven chain — ideal for daily spiritual styling.',
  },
  {
    image: 'blacky_13.jpg',
    name: 'Aether Floral Lattice Jewelry Set',
    slug: 'aether-floral-lattice-jewelry-set',
    categorySlug: 'necklaces',
    sku: 'LK-BLK-013',
    price: 5499,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 14.2,
    stock: 11,
    featured: true,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Open-work floral lattice pendant with matching drop earrings on a multi-strand flat chain.',
    description:
      'This refined set pairs a five-petal floral lattice pendant with coordinating drop earrings finished with polished gold bead droplets. The multi-strand flat link chain adds structure while keeping the silhouette light and festive.',
    seoTitle: 'Aether Floral Lattice Jewelry Set | Lukee Jewels',
    seoDescription:
      'Floral lattice necklace and earring set in 18k yellow gold — perfect for celebrations and gifting.',
  },
  {
    image: 'blacky_14.jpg',
    name: 'Prism Om Textured Pendant',
    slug: 'prism-om-textured-pendant',
    categorySlug: 'pendants',
    sku: 'LK-BLK-014',
    price: 1999,
    material: 'Gold Plated Brass',
    purity: '22K Gold Tone',
    weight: 5.9,
    stock: 32,
    featured: false,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Classic Om pendant with dotted texture on a polished box-link chain.',
    description:
      'A timeless Om pendant rendered in a brushed gold finish with uniform micro-dot detailing. Finished on a durable box-link chain suitable for everyday wear and thoughtful gifting.',
    seoTitle: 'Prism Om Textured Pendant | Lukee Jewels',
    seoDescription:
      'Textured Om pendant necklace with box chain — spiritual daily-wear jewelry from Lukee Jewels.',
  },
  {
    image: 'blacky_15.png',
    name: 'Imperial Heart Filigree Set',
    slug: 'imperial-heart-filigree-set',
    categorySlug: 'necklaces',
    sku: 'LK-BLK-015',
    price: 4799,
    salePrice: 4199,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 13.6,
    stock: 16,
    featured: true,
    bestSeller: true,
    newArrival: false,
    status: 'active',
    shortDescription:
      'Heart-frame pendant and stud earrings with filigree floral centres and mesh chain.',
    description:
      'Romantic heart silhouettes frame delicate filigree floral motifs on both the pendant and matching studs. A flat woven mesh chain and dangling gold bead accents complete this gift-ready ensemble.',
    seoTitle: 'Imperial Heart Filigree Set | Lukee Jewels',
    seoDescription:
      'Heart filigree necklace and earring set in 18k yellow gold with mesh chain and bead accents.',
  },
  {
    image: 'blacky_16.png',
    name: 'Sovereign Filigree Teardrop Set',
    slug: 'sovereign-filigree-teardrop-set',
    categorySlug: 'bridal-collection',
    sku: 'LK-BLK-016',
    price: 5299,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 15.1,
    stock: 10,
    featured: true,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Triangular teardrop filigree pendant with embossed florals and matching stud earrings.',
    description:
      'An elevated bridal set featuring open-work filigree in a teardrop silhouette with twin embossed floral motifs. Matching earrings echo the pendant design, each finished with a polished gold droplet.',
    seoTitle: 'Sovereign Filigree Teardrop Set | Lukee Jewels',
    seoDescription:
      'Filigree teardrop necklace and earring set — ornate 18k gold bridal jewelry by Lukee.',
  },
  {
    image: 'blacky_17.png',
    name: 'Luminary Long Ornate Link Chain',
    slug: 'luminary-long-ornate-link-chain',
    categorySlug: 'chains',
    sku: 'LK-BLK-017',
    price: 6899,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 28.5,
    stock: 8,
    featured: true,
    bestSeller: true,
    newArrival: false,
    status: 'active',
    shortDescription:
      'Opera-length chain with mixed caged and braided links and traditional S-hook clasp.',
    description:
      'A statement long chain alternating caged cylindrical links with dense braided sections, accented by textured gold spheres. Finished with a classic S-hook clasp for versatile layering or solo wear.',
    seoTitle: 'Luminary Long Ornate Link Chain | Lukee Jewels',
    seoDescription:
      'Long ornate gold link chain with S-hook clasp — premium 18k chain jewelry from Lukee Jewels.',
  },
  {
    image: 'blacky_18.png',
    name: 'Royal Interlock Link Necklace',
    slug: 'royal-interlock-link-necklace',
    categorySlug: 'necklaces',
    sku: 'LK-BLK-018',
    price: 4599,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 18.3,
    stock: 12,
    featured: false,
    bestSeller: true,
    newArrival: false,
    status: 'active',
    shortDescription:
      'Polished circular link chain with decorative square accent charms.',
    description:
      'Clean interlocking oval links create a luminous drape, punctuated by two square decorative charms for subtle contrast. A versatile mid-length necklace suited to both office and evening styling.',
    seoTitle: 'Royal Interlock Link Necklace | Lukee Jewels',
    seoDescription:
      '18k gold interlock link necklace with square accents — elegant everyday chain jewelry.',
  },
  {
    image: 'blacky_19.png',
    name: 'Valkyrie Chunky Braided Chain',
    slug: 'valkyrie-chunky-braided-chain',
    categorySlug: 'chains',
    sku: 'LK-BLK-019',
    price: 7499,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 32.8,
    stock: 7,
    featured: true,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Bold braided wheat-link chain with high-polish finish and box clasp.',
    description:
      'A heavyweight braided chain with dense interwoven links that catch light from every angle. The rectangular clasp adds a refined closure to this commanding statement piece.',
    seoTitle: 'Valkyrie Chunky Braided Chain | Lukee Jewels',
    seoDescription:
      'Chunky braided 18k gold chain necklace — bold statement chain from Lukee Jewels.',
  },
  {
    image: 'blacky_22.jpg',
    name: 'Seraphina Mesh Flat Chain',
    slug: 'seraphina-mesh-flat-chain',
    categorySlug: 'chains',
    sku: 'LK-BLK-022',
    price: 3299,
    material: 'Gold Plated Brass',
    purity: '22K Gold Tone',
    weight: 9.4,
    stock: 22,
    featured: false,
    bestSeller: true,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Shimmering flat mesh chain with secure lobster clasp for daily layering.',
    description:
      'A flexible flat mesh chain with a micro-woven texture that delivers continuous shine. Finished with a lobster clasp and teardrop connector for reliable everyday wear.',
    seoTitle: 'Seraphina Mesh Flat Chain | Lukee Jewels',
    seoDescription:
      'Flat mesh gold-tone chain necklace with lobster clasp — versatile daily chain from Lukee.',
  },
  {
    image: 'blacky_23.jpg',
    name: 'Ethereal Teardrop Filigree Suite',
    slug: 'ethereal-teardrop-filigree-suite',
    categorySlug: 'bridal-collection',
    sku: 'LK-BLK-023',
    price: 5699,
    salePrice: 4999,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 16.7,
    stock: 9,
    featured: true,
    bestSeller: true,
    newArrival: false,
    status: 'active',
    shortDescription:
      'Teardrop filigree pendant with black enamel accents, mesh chain, and matching earrings.',
    description:
      'Intricate teardrop filigree highlighted with black enamel contrast, paired with matching drop earrings and a thick textured mesh chain. Designed for festive and wedding wardrobes.',
    seoTitle: 'Ethereal Teardrop Filigree Suite | Lukee Jewels',
    seoDescription:
      'Teardrop filigree necklace set with black enamel accents — bridal gold jewelry by Lukee.',
  },
  {
    image: 'blacky_201.jpg',
    name: 'Aura Delicate Om Pendant',
    slug: 'aura-delicate-om-pendant',
    categorySlug: 'pendants',
    sku: 'LK-BLK-201',
    price: 1899,
    material: 'Gold Plated Brass',
    purity: '22K Gold Tone',
    weight: 4.2,
    stock: 35,
    featured: false,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Compact hammered Om pendant on a sleek high-shine snake chain.',
    description:
      'A minimalist Om pendant with a lightly hammered texture, suspended from a fine snake chain. Lightweight and luminous — ideal for stacking or solo spiritual styling.',
    seoTitle: 'Aura Delicate Om Pendant | Lukee Jewels',
    seoDescription:
      'Delicate Om pendant on snake chain — lightweight gold-tone spiritual necklace.',
  },
  {
    image: 'blacky_202.jpg',
    name: 'Gilded Dual Chain Collection',
    slug: 'gilded-dual-chain-collection',
    categorySlug: 'gold-collection',
    sku: 'LK-BLK-202',
    price: 7999,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 24.6,
    stock: 6,
    featured: true,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Pair of complementary chains — flat braided and fine rounded links with S-hook clasps.',
    description:
      'Two harmonised chains in one collection: a wide flat braided link style and a finer rounded wheat chain, both with traditional S-hook clasps. Perfect for layering or gifting as a set.',
    seoTitle: 'Gilded Dual Chain Collection | Lukee Jewels',
    seoDescription:
      '18k gold dual chain set with braided and rounded links — premium gold collection piece.',
  },
  {
    image: 'blacky_203.jpg',
    name: 'Starlight Fan Lattice Pendant',
    slug: 'starlight-fan-lattice-pendant',
    categorySlug: 'pendants',
    sku: 'LK-BLK-203',
    price: 3899,
    material: 'Gold Plated Brass',
    purity: '22K Gold Tone',
    weight: 8.1,
    stock: 18,
    featured: false,
    bestSeller: true,
    newArrival: false,
    status: 'active',
    shortDescription:
      'Fan-shaped lattice pendant with pavé crystal accents on a box chain.',
    description:
      'A flared fan silhouette with open lattice centre, pavé-set crystal rows on the bail and lower edge, and a smooth box chain. Contemporary elegance for evening and occasion wear.',
    seoTitle: 'Starlight Fan Lattice Pendant | Lukee Jewels',
    seoDescription:
      'Fan lattice pendant necklace with crystal accents and box chain — Lukee Jewels.',
  },
  {
    image: 'blacky_204.jpg',
    name: 'Lustrous Filigree Leaf Set',
    slug: 'lustrous-filigree-leaf-set',
    categorySlug: 'necklaces',
    sku: 'LK-BLK-204',
    price: 4199,
    material: 'Gold Plated Brass',
    purity: '22K Gold Tone',
    weight: 11.3,
    stock: 20,
    featured: false,
    bestSeller: true,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Oval filigree pendant with leaf motif, box chain, and matching stud earrings.',
    description:
      'Daily-wear set featuring an oval filigree frame with a vertical leaf motif, fine box chain, and coordinating stud earrings with bead droplets. Crafted for comfortable all-day elegance.',
    seoTitle: 'Lustrous Filigree Leaf Set | Lukee Jewels',
    seoDescription:
      'Filigree leaf necklace and earring set on box chain — daily-wear gold-tone jewelry.',
  },
  {
    image: 'blacky_205.png',
    name: 'Blacky Heart Two-Tone Set',
    slug: 'blacky-heart-two-tone-set',
    categorySlug: 'gold-collection',
    sku: 'LK-BLK-205',
    price: 4999,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 13.9,
    stock: 15,
    featured: true,
    bestSeller: true,
    newArrival: false,
    status: 'active',
    shortDescription:
      'Corrugated heart pendant and studs with gold and rhodium two-tone bands on mesh chain.',
    description:
      'Signature Blacky styling with ribbed heart forms alternating yellow gold and rhodium-toned bands. Includes matching heart studs and a flat mesh chain with dangling bead accents.',
    seoTitle: 'Blacky Heart Two-Tone Set | Lukee Jewels',
    seoDescription:
      'Two-tone heart necklace and earring set — signature Blacky collection at Lukee Jewels.',
  },
  {
    image: 'blacky_206.jpg',
    name: 'Symphony Filigree Teardrop Set',
    slug: 'symphony-filigree-teardrop-set',
    categorySlug: 'necklaces',
    sku: 'LK-BLK-206',
    price: 4499,
    material: 'Gold Plated Brass',
    purity: '22K Gold Tone',
    weight: 12.8,
    stock: 17,
    featured: false,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      '24-inch daily-wear teardrop filigree pendant set with snake chain and matching earrings.',
    description:
      'Teardrop filigree pendant with central floral embossing on a 24-inch flat snake chain, paired with matching teardrop studs. Designed for effortless daily styling with ornate detail.',
    seoTitle: 'Symphony Filigree Teardrop Set | Lukee Jewels',
    seoDescription:
      'Filigree teardrop pendant set with 24-inch snake chain — daily-wear necklace set.',
  },
  {
    image: 'blacky_207.png',
    name: 'Blacky Filigree Leaf Suite',
    slug: 'blacky-filigree-leaf-suite',
    categorySlug: 'gold-collection',
    sku: 'LK-BLK-207',
    price: 5199,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 14.5,
    stock: 13,
    featured: true,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Leaf-shaped filigree pendant with circular cutouts, woven chain, and drop earrings.',
    description:
      'Ornate leaf filigree with circular openwork, twin dangling beads, and a flat woven chain. Matching drop earrings complete this Blacky signature suite.',
    seoTitle: 'Blacky Filigree Leaf Suite | Lukee Jewels',
    seoDescription:
      'Blacky filigree leaf necklace and earring set — 18k gold signature styling.',
  },
  {
    image: 'blacky_208.jpg',
    name: 'Cascade Triple Chain Layering Set',
    slug: 'cascade-triple-chain-layering-set',
    categorySlug: 'chains',
    sku: 'LK-BLK-208',
    price: 6299,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 21.4,
    stock: 9,
    featured: false,
    bestSeller: true,
    newArrival: false,
    status: 'active',
    shortDescription:
      'Three complementary chains — flat curb, braided rope, and fine cable for layering.',
    description:
      'A curated trio of chains in flat curb, textured braided, and delicate cable styles. Designed to be worn together or separately for elevated layered looks.',
    seoTitle: 'Cascade Triple Chain Layering Set | Lukee Jewels',
    seoDescription:
      'Triple gold chain layering set — flat, braided, and fine link chains from Lukee Jewels.',
  },
  {
    image: 'blacky_209.jpg',
    name: 'Zenith Leaf Crystal Pendant',
    slug: 'zenith-leaf-crystal-pendant',
    categorySlug: 'pendants',
    sku: 'LK-BLK-209',
    price: 3599,
    material: 'Gold Plated Brass',
    purity: '22K Gold Tone',
    weight: 7.6,
    stock: 19,
    featured: false,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Leaf-shaped filigree pendant with crystal-accent band on a fine wheat chain.',
    description:
      'Modern leaf silhouette with diagonal slat cutouts and a central row of brilliant crystals. Suspended from a fine wheat-style chain for refined everyday glamour.',
    seoTitle: 'Zenith Leaf Crystal Pendant | Lukee Jewels',
    seoDescription:
      'Leaf filigree pendant with crystal accents — contemporary gold-tone necklace.',
  },
  {
    image: 'blacky_210.jpg',
    name: 'Riviera Textured Leaf Set',
    slug: 'riviera-textured-leaf-set',
    categorySlug: 'bridal-collection',
    sku: 'LK-BLK-210',
    price: 5899,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 17.2,
    stock: 8,
    featured: true,
    bestSeller: true,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Temple-inspired leaf pendant with mesh chain and matching drop earrings.',
    description:
      'A festive set with layered leaf and feather textures, a wide mesh chain, and coordinating drop earrings with bead droplets. Ideal for weddings, pujas, and celebration dressing.',
    seoTitle: 'Riviera Textured Leaf Set | Lukee Jewels',
    seoDescription:
      'Textured leaf bridal necklace set with mesh chain and earrings — Lukee Jewels.',
  },
  {
    image: 'blacky_211.jpg',
    name: 'Ascent Paisley Pendant Set',
    slug: 'ascent-paisley-pendant-set',
    categorySlug: 'bridal-collection',
    sku: 'LK-BLK-211',
    price: 4699,
    salePrice: 4099,
    material: 'Gold Plated Brass',
    purity: '22K Gold Tone',
    weight: 13.1,
    stock: 14,
    featured: false,
    bestSeller: true,
    newArrival: false,
    status: 'active',
    shortDescription:
      'Traditional paisley pendant with honeycomb lattice and matching stud earrings.',
    description:
      'Classic mango-paisley silhouette with honeycomb openwork, fine snake chain, and matching stud earrings with bead droplets. A timeless ethnic set for festive wardrobes.',
    seoTitle: 'Ascent Paisley Pendant Set | Lukee Jewels',
    seoDescription:
      'Paisley pendant necklace and earring set — traditional bridal gold-tone jewelry.',
  },
  {
    image: 'blacky_212.jpg',
    name: 'Infinity Lattice Crystal Pendant',
    slug: 'infinity-lattice-crystal-pendant',
    categorySlug: 'pendants',
    sku: 'LK-BLK-212',
    price: 4299,
    material: '18k Yellow Gold',
    purity: '18K (750)',
    weight: 10.8,
    stock: 16,
    featured: true,
    bestSeller: false,
    newArrival: true,
    status: 'active',
    shortDescription:
      'Oval lattice pendant with crystal wave band on a flat mesh chain.',
    description:
      'Contemporary oval pendant combining geometric lattice upperwork with a curved crystal-set wave band. Finished on a flat woven mesh chain for evening-ready radiance.',
    seoTitle: 'Infinity Lattice Crystal Pendant | Lukee Jewels',
    seoDescription:
      'Lattice oval pendant with crystal accents and mesh chain — Lukee Jewels.',
  },
];
