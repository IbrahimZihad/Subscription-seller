export interface Product {
  id: number;

  categoryId: number;

  name: string;
  slug: string;

  shortDescription?: string;
  description: string;

  image: string;
  badge?: string;

  basePrice: number;
  originalPrice?: number;

  deliveryTime: string;

  features: string[];

  avgRating: string | number;
  reviewCount: number;
  salesCount?: number;

  isFeatured?: boolean;
  inStock: boolean;
  isActive?: boolean;

  metaTitle?: string;
  metaDescription?: string;

  sortOrder?: number;

  createdAt?: string;
  updatedAt?: string;

  category: {
    id: number;
    name: string;
    slug: string;
    icon?: string;
  };

  plans?: ProductPlan[];
}

export interface ProductPlan {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
}

export interface CartItem {
  product: Product;
  plan?: ProductPlan;
  quantity: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  category: string;
  author: string;
  authorImage: string;
  date: string;
  readTime: string;
  tags: string[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}
