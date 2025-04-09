export interface ProductDetails {
  id: number;
  mainImageUrl: string;
  productName: ProductName;
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

interface ProductName {
  en: string;
  ar: string;
}

interface Description {
  en: string;
  ar: string;
}

interface BrandName {
  en: string;
  ar: string;
}

interface Category {
  id: number;
  name: Name;
}

interface Name {
  en: string;
  ar: string;
}

interface SubCategory {
  id: number;
  name: Name2;
}

interface Name2 {
  en: string;
  ar: string;
}

interface SubSubCategory {
  id: number;
  name: Name3;
}

interface Name3 {
  en: string;
  ar: string;
}

interface GallaryImageUrl {
  id: number;
  imageUrl: string;
}

interface ProductVariant {
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

interface VariantName {
  en: string;
  ar: string;
}

interface VariantType {
  id: number;
  name: Name4;
}

interface Name4 {
  en: string;
  ar: string;
}

interface Currency {
  name: Name5;
  id: number;
}

interface Name5 {
  en: string;
  ar: string;
}

interface GallaryImageUrl2 {
  id: number;
  imageUrl: string;
}
