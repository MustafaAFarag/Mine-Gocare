export interface Product {
  productId: number;
  variantId: number;
  mainImageUrl: string;
  name: Name;
  brand: Brand;
  priceBeforeDiscount: number;
  priceAfterDiscount: number;
  discountAmount: number;
  discountPercentage: number;
  currency: Currency;
  stockCount: number;
  variantProductNumber: number;
  lowQuantity: boolean;
  variantQuantityInCart: any;
  variantInCartId: any;
  isInWishlist: boolean;
  promoCodeDetail?: any;
  productVariants: ProductVariant[];
  rating: number;
}

interface Name {
  en: string;
  ar: string;
}

interface Brand {
  en: string;
  ar: string;
}

interface Currency {
  name: Name2;
  id: number;
}

interface Name2 {
  en: string;
  ar: string;
}

interface ProductVariant {
  variantName: VariantName;
  variantType: any;
  isSelected: boolean;
  variantTypeSettings: any;
  id: number;
}

interface VariantName {
  en: string;
  ar: string;
}

export interface ProductApiResponse {
  result: {
    items: Product[];
    totalCount: number;
  };
}
