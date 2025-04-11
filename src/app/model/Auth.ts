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
    refreshToken: string;
    userId: number;
    fullName: string;
    profileImageUrl: string;
  };
  success: boolean;
}
