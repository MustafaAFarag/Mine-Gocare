export interface Address {
  id: number;
  type: string | number; // Allow for both string and number types
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  isSelected?: boolean;
}

export interface PromoCode {
  code: string;
  description: string;
}
