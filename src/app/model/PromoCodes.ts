export interface PromoCode {
  id: number;
  offerName: OfferName;
  offerImageEn: string;
  offerImageAr: string;
  code: string;
  startDate: string;
  endDate: string;
  type: number;
  offerAmount: number;
  minimumCheckoutAmount: any;
  uptoAmount: number;
  buyCount: any;
  getCount: any;
  isActive: boolean;
  isLabeled: boolean;
  currency: Currency;
  clientUsageCount: number;
  maxUsageCount: number;
  usageCount: number;
}

interface OfferName {
  en: string;
  ar: string;
}

interface Currency {
  name: Name;
  id: number;
}

interface Name {
  en: string;
  ar: string;
}
