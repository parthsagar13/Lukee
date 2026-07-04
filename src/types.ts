export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  status: 'active' | 'inactive';
  displayOrder: number;
  seoTitle: string;
  seoDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: string; // Category ID
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
  images: string[];
  seoTitle: string;
  seoDescription: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Admin {
  _id: string;
  email: string;
  password?: string;
  name: string;
  createdAt?: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalCategories: number;
  lowStockCount: number;
  featuredCount: number;
  categoryStats: { name: string; count: number }[];
  materialStats: { name: string; count: number }[];
}
