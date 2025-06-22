export interface OrderDetails {
  id: number;
  serialNumber: string;
  date: string;
  orderClientDetails: OrderClientDetails;
  orderAddress: OrderAddress;
  orderPayment: OrderPayment;
  deliveryNotes: string;
  orderStatus: number;
  reason: any;
  statusHistory: StatusHistory;
  gainedPoints: any;
  productDetails: ProductDetail[];
  targetedStatuses: number[];
  isCanceled: boolean;
  canReturn: boolean;
  hasPreviousReturn: boolean;
  returnPeriodInDays: number;
  deliveryDate: string;
  orderReturns: any[];
  minShippingAmount: number;
  maxShippingAmount: number;
}

interface OrderClientDetails {
  clientId: number;
  clientName: string;
  clientEmail: string;
  clientPhoneNumber: string;
  isClientPhoneVerified: boolean;
  isClientEmailVerified: boolean;
}

interface OrderAddress {
  city: City;
  district: District;
  address: string;
  longitute: string;
  latitute: string;
}

interface City {
  en: string;
  ar: string;
}

interface District {
  en: string;
  ar: string;
}

interface OrderPayment {
  paymentMethod: number;
  promoCodeDeduction: number;
  shippingFees: number;
  subTotal: number;
  total: number;
  totalDiscount: number;
  currency: Currency;
  sla: number;
  walletAmount: number;
  redeemedPointsAmount: number;
  numberOfPoints: number;
}

interface Currency {
  name: Name;
  id: number;
}

interface Name {
  en: string;
  ar: string;
}

interface StatusHistory {
  orderStatus: number;
  date: string;
  reason: string;
}

interface ProductDetail {
  orderProductId: number;
  productVariantId: number;
  productVariantName: ProductVariantName;
  productName: ProductName;
  count: number;
  price: number;
  imageUrl: string;
  currency: Currency2;
  returnedQuantity: number;
  isNotReturnable: boolean;
  priceBeforeDiscount: number;
  discountAmount: number;
}

interface ProductVariantName {
  en: string;
  ar: string;
}

interface ProductName {
  en: string;
  ar: string;
}

interface Currency2 {
  name: Name2;
  id: number;
}

interface Name2 {
  en: string;
  ar: string;
}

// --------------- Client Orders --------------

export interface ClientOrders {
  id: number;
  orderNumber: string;
  status: number;
  productNumber: number;
  totalPayment: number;
  paymentMethod: number;
  currency: Currency;
  creationDate: string;
  lastStatusHistory: LastStatusHistory;
  isCanceled: boolean;
  productNames: ProductName[];
}

interface Currency {
  name: Name;
  id: number;
}

interface Name {
  en: string;
  ar: string;
}

interface LastStatusHistory {
  orderStatus: number;
  date: string;
  reason: string;
}

interface ProductName {
  en: string;
  ar: string;
}

export interface OrderSummary {
  subTotal: number;
  proomoCodeAmount: number;
  totalDiscount: number;
  shippingFees: number;
  total: number;
  currency: Currency;
  points: Points;
  sla: number;
  earnedPoints: number;
  availableWalletAmount: number;
}

export interface Points {
  totalActivePoints: number;
  cost: number;
}
