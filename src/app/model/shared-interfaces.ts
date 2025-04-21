// Define shared interfaces to be used across components

export interface Category {
  name: string; // For display
  nameEn: string; // English name for URL params
  nameAr: string; // Arabic name
  selected: boolean;
  subcategories?: Category[];
  isParent?: boolean;
  id?: number;
  level?: number;
}

export interface Brand {
  name: string; // For display
  id?: number;
  selected?: boolean;
  en?: string;
  ar?: string;
}

export interface RatingOption {
  value: number;
  selected: boolean;
}

export interface PriceRange {
  min: number;
  max: number | null; // null represents "and above"
  selected: boolean;
}
