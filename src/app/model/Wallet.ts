export interface Wallet {
  walletAmount: number;
  expectedAmount: number;
  holdingPayouts: number;
  cashBackAmount: number;
  currency: Currency;
  payoutMethods: any;
}

interface Currency {
  name: Name;
  id: number;
}

interface Name {
  en: string;
  ar: string;
}

export interface WalletTransactionList {
  id: number;
  amount: number;
  currency: Currency;
  transactionType: number;
  operation: number;
  transactionDate: string;
  title: Title;
  description: Description;
  appointmentId: any;
  appointmentSerialNumber: any;
  isHolded: boolean;
  reason: any;
  showToClient: boolean;
  orderId: number;
  orderSerialNumber: string;
  orderReturnId: any;
  orderReturnSerialNumber: any;
}

interface Title {
  en: string;
  ar: string;
}

interface Description {
  en: string;
  ar: string;
}
