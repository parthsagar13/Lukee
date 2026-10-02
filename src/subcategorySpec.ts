import type { SubCategoryGroup } from './types.js';

export const SUBCATEGORY_GROUP_LABELS: Record<SubCategoryGroup, string> = {
  style: 'Shop by Style',
  material: 'Shop by Material',
  price: 'Shop for',
  audience: 'Shop for',
  occasion: 'Shop by Occasion',
  collection: 'Featured Collection',
  accessories: 'Accessories',
  chains: 'Chains',
};

export const SUBCATEGORY_GROUP_OPTIONS: Array<{ value: SubCategoryGroup; label: string }> = [
  { value: 'style', label: 'Shop by Style' },
  { value: 'material', label: 'Shop by Material' },
  { value: 'price', label: 'Shop for (price)' },
  { value: 'audience', label: 'Shop for (audience)' },
  { value: 'occasion', label: 'Shop by Occasion' },
  { value: 'collection', label: 'Featured Collection' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'chains', label: 'Chains' },
];

/** Mega-menu column order when rendering a category dropdown. */
export const MEGA_MENU_GROUP_ORDER: SubCategoryGroup[] = [
  'style',
  'collection',
  'material',
  'price',
  'audience',
  'occasion',
  'accessories',
  'chains',
];
