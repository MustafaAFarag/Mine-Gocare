export interface Product {
  highlightedName: HighlightedName;
  mainImageUrl: string;
  categoriesIds: any;
  id: number;
  name: Name;
  slug: string;
  brandId: number;
  brand: Brand;
  selectedVariant: any;
  productType: string;
  shortDescription: ShortDescription;
  description: Description;
  type: any;
  productThumbnailId: any;
  productThumbnail: any;
  productGalleriesId: any;
  productGalleries: ProductGallery[];
  unit: any;
  weight: number;
  price: number;
  isWishlist: boolean;
  salePrice: number;
  discount: number;
  isSaleEnable: boolean;
  saleStartsAt: any;
  saleExpiredAt: any;
  sku: string;
  stockStatus: string;
  stock: any;
  visibleTime: any;
  quantity: number;
  previewType: string;
  previewAudioFile: any;
  previewAudioFileId: any;
  previewVideoFile: any;
  previewVideoFileId: any;
  storeId: any;
  sizeChartImageId: number;
  sizeChartImage: any;
  estimatedDeliveryText: any;
  returnPolicyText: any;
  safeCheckout: boolean;
  previewUrl: any;
  secureCheckout: boolean;
  socialShare: boolean;
  encourageOrder: boolean;
  encourageView: boolean;
  isFreeShipping: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isReturn: boolean;
  shippingDays: number;
  taxId: number;
  tax: any;
  status: boolean;
  metaTitle: string;
  metaDescription: string;
  productMetaImage: any;
  productMetaImageId: number;
  tags: any;
  tag: any;
  categories: any;
  category: Category;
  store: any;
  storeName: any;
  ordersCount: number;
  orderAmount: number;
  attributeValues: any;
  variations: any;
  wholesalePriceType: any;
  wholesales: any;
  variants: any;
  attributes: any[];
  attributesIds: any;
  isRandomRelatedProducts: boolean;
  isExternal: boolean;
  externalUrl: any;
  externalButtonText: any;
  relatedProducts: any;
  crossSellProducts: any;
  pivot: any;
  createdById: number;
  isApproved: boolean;
  totalInApprovedProducts: number;
  publishedAt: any;
  reviews: any[];
  reviewsCount: number;
  wishlistName: any;
  ratingCount: number;
  reviewRatings: any;
  userReview: any;
  canReview: boolean;
  createdAt: any;
  updatedAt: any;
  deletedAt: any;
}

interface HighlightedName {
  en: string;
  ar: string;
}

interface Name {
  en: string;
  ar: string;
}

interface Brand {
  id: number;
  name: Name2;
  slug: string;
  brandImageId: any;
  brandImage: BrandImage;
  brandBannerId: number;
  brandBanner: any;
  brandMetaImageId: number;
  brandMetaImage: BrandMetaImage;
  metaTitle: string;
  metaDescription: any;
  status: boolean;
}

interface Name2 {
  en: string;
  ar: string;
}

interface BrandImage {
  id: number;
  collection_name: any;
  name: any;
  file_name: string;
  mime_type: any;
  disk: any;
  conversions_disk: any;
  size: any;
  created_by_id: number;
}

interface BrandMetaImage {
  id: number;
  collection_name: any;
  name: any;
  file_name: string;
  mime_type: any;
  disk: any;
  conversions_disk: any;
  size: any;
  created_by_id: number;
}

interface ShortDescription {
  en: string;
  ar: string;
}

interface Description {
  en: string;
  ar: string;
}

interface ProductGallery {
  id: number;
  collection_name: any;
  name: any;
  file_name: string;
  mime_type: any;
  disk: any;
  conversions_disk: any;
  size: any;
  created_by_id: number;
}

interface Category {
  id: number;
  name: Name3;
  slug: string;
  description: any;
  type: any;
  parent_id: string;
  category_image: CategoryImage;
  category_image_id: any;
  category_icon: any;
  category_icon_id: any;
  commission_rate: any;
  products_count: string;
  category_meta_image_id: any;
  category_meta_image: any;
  meta_title: string;
  meta_description: any;
  status: any;
  imageUrl: any;
  subCategories: any;
}

interface Name3 {
  en: string;
  ar: string;
}

interface CategoryImage {
  id: number;
  collection_name: any;
  name: any;
  file_name: any;
  mime_type: any;
  disk: any;
  conversions_disk: any;
  size: any;
  created_by_id: number;
}

export interface ProductApiResponse {
  result: {
    items: Product[];
    totalCount: number;
  };
}
