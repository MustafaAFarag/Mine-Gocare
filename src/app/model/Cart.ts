export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  userId?: string; // Optional since guest users won't have a userId
}

export const CART_STORAGE_KEY = 'gocare_cart';
