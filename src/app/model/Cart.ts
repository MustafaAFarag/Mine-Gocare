export interface CartItem {
  productId: number;
  variantId?: number;
  name: any; // Changed from string to any to support localized name object
  image: string;
  afterPrice: number;
  beforePrice: number;
  quantity: number;
  currency?: any;
}

export interface Cart {
  items: CartItem[];
  total: number;
  userId?: string; // Optional since guest users won't have a userId
}

export const CART_STORAGE_KEY = 'cart';
