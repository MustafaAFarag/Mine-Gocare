// Common types
export interface Name {
  en: string;
  ar: string;
}

export interface Position {
  latitude: number;
  longitude: number;
}

// Address-related models
export interface Address {
  id: number;
  country: CountrySummary;
  district: DistrictSummary;
  city: CitySummary;
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

interface CountrySummary {
  id: number;
  name: Name;
}

interface DistrictSummary {
  id: number;
  name: Name;
}

interface CitySummary {
  id: number;
  name: Name;
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

export interface UpdateAddress extends CreateAddress {
  id: number;
}

// City-related models
export interface City {
  id: number;
  name: Name;
  position: Position;
}

// Country full model
export interface Country {
  id: number;
  name: Name;
  isActive: boolean;
  phoneCode: string;
  position: Position;
  isActivePhoneCode: boolean;
  flagUrl: string;
  countryCode: string;
  capitalCity: CapitalCity;
}

export interface CapitalCity {
  id: number;
  name: Name;
  position: Position;
}

// District full model
export interface District {
  id: number;
  name: Name;
  position: Position;
}
