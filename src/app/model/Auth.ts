export interface LoginRequest {
  emailAddress: string | null;
  mobileNumber: string | null;
  password: string;
  deviceToken: string;
  rememberClient: boolean;
}

export interface LoginResponse {
  result: {
    accessToken: string;
    encryptedAccessToken: string;
    refreshToken: string;
    refreshTokenExpiration: string;
    expireInSeconds: number;
    userId: number;
    fullName: string;
    profileImageUrl: string;
  };
  success: boolean;
}

export interface UserProfile {
  userId: number;
  fullName: string;
  thumbImageUrl: string;
  profileImageUrl: string;
  gender: number;
  emailAddress: string;
  mobileNumber: string;
}
