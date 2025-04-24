export interface Address {
  id: number;
  country: Country;
  district: District;
  city: City;
  latitude: string;
  longitude: string;
  address: string;
  mapAddress: string;
  phoneNumber: string;
  type: number;
  isDefault: boolean;
  fullName: string;
  isPhoneVerified: boolean;
}

interface Country {
  id: number;
  name: Name;
}

interface Name {
  en: string;
  ar: string;
}

interface District {
  id: number;
  name: Name2;
}

interface Name2 {
  en: string;
  ar: string;
}

interface City {
  id: number;
  name: Name3;
}

interface Name3 {
  en: string;
  ar: string;
}

export interface CreateAddress {
  countryId: number;
  districtId: number;
  cityId: number;
  latitude: string;
  longitude: string;
  address: string;
  mapAddress: string;
  phoneNumber: string;
  isDefault: boolean;
  type: number;
  fullName: string;
  isPhoneVerified: boolean;
}

export interface UpdateAddress {
  id: number;
  countryId: number;
  districtId: number;
  cityId: number;
  latitude: string;
  longitude: string;
  address: string;
  mapAddress: string;
  phoneNumber: string;
  isDefault: boolean;
  type: number;
  fullName: string;
  isPhoneVerified: boolean;
}
