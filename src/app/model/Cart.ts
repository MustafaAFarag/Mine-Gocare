export interface CartItem {
  productId: number;
  name: string;
  image: string;
  afterPrice: number;
  beforePrice: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
  userId?: string; // Optional since guest users won't have a userId
}

export const CART_STORAGE_KEY = 'gocare_cart';
