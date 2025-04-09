export interface Product {
  id: number;
  mainImageUrl: string;
  name: ProductName;
  description: Description;
  targetAudience: any;
  brandId: number;
  brandName: BrandName;
  category: Category;
  subCategory: SubCategory;
  subSubCategory: SubSubCategory;
  hasVariant: boolean;
  productNotes: string;
  countryId: number;
  isNotReturnable: boolean;
  gallaryImageUrls: GallaryImageUrl[];
  productVariants: ProductVariant[];
}

export interface ProductName {
  en: string;
  ar: string;
}

export interface Description {
  en: string;
  ar: string;
}

export interface BrandName {
  en: string;
  ar: string;
}

export interface Category {
  id: number;
  name: Name;
}

export interface Name {
  en: string;
  ar: string;
}

export interface SubCategory {
  id: number;
  name: Name2;
}

export interface Name2 {
  en: string;
  ar: string;
}

export interface SubSubCategory {
  id: number;
  name: Name3;
}

export interface Name3 {
  en: string;
  ar: string;
}

export interface GallaryImageUrl {
  id: number;
  imageUrl: string;
}

export interface ProductVariant {
  variantName: VariantName;
  isInWishlist: boolean;
  promoCodeDetail: any;
  variantType: VariantType;
  variantTypeSettings: any;
  priceBeforeDiscount: number;
  priceAfterDiscount: number;
  stockCount: number;
  isDiscountFixed: boolean;
  discountAmount: number;
  discountPercentage: number;
  skuNumber: string;
  mainImageUrl: string;
  creationDate: string;
  variantInCartId: number;
  variantQuantityInCart: number;
  isSelected: boolean;
  hasLowQuantity: boolean;
  currency: Currency;
  gallaryImageUrls: GallaryImageUrl2[];
  rating: number;
  id: number;
}

export interface VariantName {
  en: string;
  ar: string;
}

export interface VariantType {
  id: number;
  name: Name4;
}

export interface Name4 {
  en: string;
  ar: string;
}

export interface Currency {
  name: Name5;
  id: number;
}

export interface Name5 {
  en: string;
  ar: string;
}

export interface GallaryImageUrl2 {
  id: number;
  imageUrl: string;
}

export interface ProductApiResponse {
  result: {
    items: Product[];
    totalCount: number;
  };
}
