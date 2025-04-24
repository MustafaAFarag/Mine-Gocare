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
