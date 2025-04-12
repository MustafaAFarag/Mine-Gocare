export interface User {
  accessToken: string;
  encryptedAccessToken: string;
  expireInSeconds: number;
  userId: number;
  fullName: string;
  thumbImageUrl: string;
  profileImageUrl: string;
  refreshToken: string;
  refreshTokenExpiration: string;
  gender: number;
}
