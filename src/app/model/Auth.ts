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
