export interface CartItem {
  productId: number;
  variantId?: number;
  name: any; // Changed from string to any to support localized name object
  image: string;
  afterPrice: number;
  beforePrice: number;
  quantity: number;
  currency?: any;
  promoCodeDetail?: {
    hasLabel: boolean;
    name: Name;
    code: string;
    maxUsagePerClient: number;
    promoCodeType: number;
    amount: number;
    maxDiscountValue: any;
    minCheckOutAmount: number;
  } | null;
  stockCount?: number;
}

interface Name {
  en: string;
  ar: string;
}

export interface Cart {
  items: CartItem[];
  total: number;
  userId?: string; // Optional since guest users won't have a userId
}

export const CART_STORAGE_KEY = 'cart';
