export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  contactNumber: string | null;
}

export type OtpPurpose = "register" | "login";
