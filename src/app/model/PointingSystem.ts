export interface PointSettings {
  pointSettingList: PointSettingList[];
  pointCost: number;
  expiryDaysCount: number;
}

interface PointSettingList {
  id: number;
  pointingCheckpoint: number;
  name: Name;
  limitPerDay?: number;
  points: number;
  totalActivePoints: number;
  checkOutModule: number;
}

interface Name {
  en: string;
  ar: string;
}

export interface PointsClientPreview {
  totalActivePoints: number;
  totalCount: number;
  nearestExpiredPoints: number;
  nerestExpiryDate: any;
  exchangeRate: number;
  pointHistoryDetails: PointHistoryDetail[];
}

interface PointHistoryDetail {
  title: Title;
  points: number;
  isHolded: boolean;
  isExpired: boolean;
  pointingCheckpoint: number;
  isAddition: boolean;
  cost: number;
  expiryDate: string;
  creationDate: string;
}

interface Title {
  en: string;
  ar: string;
}
