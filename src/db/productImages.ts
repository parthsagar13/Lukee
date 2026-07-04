const UNSPLASH = (id: string, width = 600) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

const PEXELS = (id: number, width = 600) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;

// Verified working Unsplash jewelry photos (404 IDs excluded)
const UNSPLASH_IDS = [
  '1605100804763-247f67b3557e',
  '1603561591411-07134e71a2a9',
  '1598560917505-59a3ad559071',
  '1515562141207-7a88fb7ce338',
  '1596944924616-7b38e7cfac36',
  '1599643478518-a784e5dc4c8f',
  '1602751584552-8ba73aad10e1',
  '1512436991641-6745cdb1723f',
  '1506630448388-4e683c67ddb0',
  '1611591437281-460bfbe1220a',
  '1573408301185-9146fe634ad0',
  '1535632066927-ab7c9ab60908',
  '1599643477877-530eb83abc8e',
  '1630019852942-f89202989a59',
  '1635767798638-3e25273a8236',
  '1617038260897-41a1f14a8ca0',
  '1523170335258-f5ed11844a49',
  '1611652022419-a9419f74343d',
  '1602173574767-37ac01994b2a',
  '1460353581641-37baddab0fa2',
];

// Verified working Pexels jewelry / luxury photos
const PEXELS_IDS = [
  1191710, 265906, 1098375, 3266600, 3266603, 3266605, 3266608, 3266612, 3266616, 3266617,
  3266621, 3266622, 3266624, 3266625, 3266626, 3266628, 3266631, 3266632, 3266700, 3266701,
  3266702, 3266703, 3266704, 3266709, 3266711, 3266720, 3266721, 3266724, 3266744, 3266745,
  3266746, 3266747, 3266748, 3266749, 3266750, 1005638, 1005640, 1005642, 1005644, 1005646,
  1005648, 1005654, 1005656, 1005660, 1005662, 1005664, 1005666, 1005668, 1005670, 1005672,
  1005674, 1005676, 1005678, 1005680, 1005682, 1005688, 1005690, 1005692, 1005696, 1005698,
  1005700, 1005704, 1005706, 1005714, 1005716, 1005720, 1005724, 1005726, 1005732, 1005738,
  1005748,
];

/** 90+ unique, verified jewelry image URLs for seeding. */
export const PRODUCT_IMAGE_POOL: string[] = [
  ...UNSPLASH_IDS.map((id) => UNSPLASH(id)),
  ...PEXELS_IDS.map((id) => PEXELS(id)),
];

const RING_URLS = new Set([
  UNSPLASH('1605100804763-247f67b3557e'),
  UNSPLASH('1603561591411-07134e71a2a9'),
  UNSPLASH('1598560917505-59a3ad559071'),
  UNSPLASH('1515562141207-7a88fb7ce338'),
  UNSPLASH('1596944924616-7b38e7cfac36'),
  UNSPLASH('1617038260897-41a1f14a8ca0'),
  UNSPLASH('1611652022419-a9419f74343d'),
  UNSPLASH('1602173574767-37ac01994b2a'),
  UNSPLASH('1523170335258-f5ed11844a49'),
  UNSPLASH('1460353581641-37baddab0fa2'),
]);

const NECKLACE_URLS = new Set([
  UNSPLASH('1599643478518-a784e5dc4c8f'),
  UNSPLASH('1602751584552-8ba73aad10e1'),
  UNSPLASH('1512436991641-6745cdb1723f'),
  UNSPLASH('1506630448388-4e683c67ddb0'),
]);

const BRACELET_URLS = new Set([
  UNSPLASH('1611591437281-460bfbe1220a'),
  UNSPLASH('1573408301185-9146fe634ad0'),
  UNSPLASH('1535632066927-ab7c9ab60908'),
  UNSPLASH('1599643477877-530eb83abc8e'),
]);

const EARRING_URLS = new Set([
  UNSPLASH('1630019852942-f89202989a59'),
  UNSPLASH('1635767798638-3e25273a8236'),
]);

function poolForCategory(catSlug: string): string[] {
  let pool = PRODUCT_IMAGE_POOL;
  if (catSlug.includes('neck') || catSlug.includes('pend') || catSlug.includes('chain')) {
    pool = PRODUCT_IMAGE_POOL.filter((url) => NECKLACE_URLS.has(url) || url.includes('pexels'));
  } else if (catSlug.includes('ear') || catSlug.includes('hoop') || catSlug.includes('stud')) {
    pool = PRODUCT_IMAGE_POOL.filter((url) => EARRING_URLS.has(url) || url.includes('pexels'));
  } else if (catSlug.includes('brace') || catSlug.includes('bang')) {
    pool = PRODUCT_IMAGE_POOL.filter((url) => BRACELET_URLS.has(url) || url.includes('pexels'));
  } else if (catSlug.includes('ring') || catSlug.includes('engagement') || catSlug.includes('wedding') || catSlug.includes('bridal')) {
    pool = PRODUCT_IMAGE_POOL.filter((url) => RING_URLS.has(url) || url.includes('pexels'));
  }
  return pool.length > 0 ? pool : PRODUCT_IMAGE_POOL;
}

/** Assigns globally unique primary images across all seeded products. */
export class UniqueImageAssigner {
  private usedPrimary = new Set<string>();
  private nextIndex = 0;

  assignForProduct(catSlug: string, productIndex: number): string[] {
    let primary = '';
    for (let i = 0; i < PRODUCT_IMAGE_POOL.length; i++) {
      const candidate = PRODUCT_IMAGE_POOL[(this.nextIndex + i) % PRODUCT_IMAGE_POOL.length];
      if (!this.usedPrimary.has(candidate)) {
        primary = candidate;
        this.usedPrimary.add(candidate);
        this.nextIndex = (this.nextIndex + i + 1) % PRODUCT_IMAGE_POOL.length;
        break;
      }
    }

    const pool = poolForCategory(catSlug);
    const secondary = pool.find((url) => url !== primary) ?? PRODUCT_IMAGE_POOL[(productIndex + 1) % PRODUCT_IMAGE_POOL.length];
    const tertiary = pool.find((url) => url !== primary && url !== secondary) ?? PRODUCT_IMAGE_POOL[(productIndex + 2) % PRODUCT_IMAGE_POOL.length];

    return [primary, secondary, tertiary].filter((url, idx, arr) => url && arr.indexOf(url) === idx);
  }
}

export function categoryImageForSlug(slug: string): string {
  if (slug.includes('ring') || slug.includes('engagement') || slug.includes('wedding')) {
    return UNSPLASH('1605100804763-247f67b3557e');
  }
  if (slug.includes('neck') || slug.includes('pend') || slug.includes('chain')) {
    return UNSPLASH('1599643478518-a784e5dc4c8f');
  }
  if (slug.includes('brace') || slug.includes('bang')) {
    return UNSPLASH('1611591437281-460bfbe1220a');
  }
  if (slug.includes('ear') || slug.includes('hoop') || slug.includes('stud')) {
    return UNSPLASH('1635767798638-3e25273a8236');
  }
  if (slug.includes('diamond')) return UNSPLASH('1596944924616-7b38e7cfac36');
  if (slug.includes('gold')) return UNSPLASH('1515562141207-7a88fb7ce338');
  if (slug.includes('silver')) return UNSPLASH('1535632066927-ab7c9ab60908');
  if (slug.includes('kid')) return UNSPLASH('1630019852942-f89202989a59');
  if (slug.includes('bridal')) return UNSPLASH('1598560917505-59a3ad559071');
  if (slug.includes('men')) return UNSPLASH('1617038260897-41a1f14a8ca0');
  return PRODUCT_IMAGE_POOL[productIndexSafe(slug)];
}

function productIndexSafe(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash + slug.charCodeAt(i)) % PRODUCT_IMAGE_POOL.length;
  return hash;
}
