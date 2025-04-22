export interface Address {
  id: number;
  type: 'new-home' | 'old-home' | 'office';
  label: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  isSelected?: boolean;
}

export interface PromoCode {
  code: string;
  description: string;
}
