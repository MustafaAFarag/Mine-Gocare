export interface Category {
  id: number;
  name: Name;
  parentId: any;
  imageUrl: string;
  hasSubCategories: boolean;
  productCount: number;
  level: number;
  subCategories: SubCategory[];
}

interface Name {
  en: string;
  ar: string;
}

interface SubCategory {
  id: number;
  name: Name2;
  parentId: number;
  imageUrl: any;
  hasSubCategories: boolean;
  productCount: number;
  level: number;
  subCategories: SubCategory2[];
}

interface Name2 {
  en: string;
  ar: string;
}

interface SubCategory2 {
  id: number;
  name: Name3;
  parentId: number;
  imageUrl: any;
  hasSubCategories: boolean;
  productCount: number;
  level: number;
  subCategories: any;
}

interface Name3 {
  en: string;
  ar: string;
}
