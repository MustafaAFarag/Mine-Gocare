export interface Category {
  id: number;
  name: Name;
  slug: string;
  description: any;
  type: any;
  parent_id: any;
  category_image: CategoryImage;
  category_image_id: any;
  category_icon: string;
  category_icon_id: any;
  commission_rate: any;
  products_count: string;
  category_meta_image_id: any;
  category_meta_image: any;
  meta_title: string;
  meta_description: any;
  status: any;
  imageUrl: string;
  subCategories: SubCategory[];
}

export interface Name {
  en: string;
  ar: string;
}

export interface CategoryImage {
  id: number;
  collection_name: any;
  name: string;
  file_name: string;
  mime_type: any;
  disk: any;
  conversions_disk: any;
  size: any;
  created_by_id: number;
}

export interface SubCategory {
  id: number;
  name: Name2;
  slug: string;
  description: any;
  type: any;
  parent_id: string;
  category_image: CategoryImage2;
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
  subCategories: SubCategory2[];
}

export interface Name2 {
  en: string;
  ar: string;
}

export interface CategoryImage2 {
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

export interface SubCategory2 {
  id: number;
  name: Name3;
  slug: string;
  description: any;
  type: any;
  parent_id: string;
  category_image: CategoryImage3;
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

export interface Name3 {
  en: string;
  ar: string;
}

export interface CategoryImage3 {
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
