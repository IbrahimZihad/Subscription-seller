// types/product.ts
export interface Product {
  id: number;
  name: string;
  emoji: string;
  category: string;
  description: string;
  price: number;
  duration: string;
  stock: boolean;
  qty?: number; // for cart quantity
}