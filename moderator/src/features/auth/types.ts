/** Mirrors backend `UserResponse` (B03). */
export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
};

export type AuthResponseDto = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: AuthUser;
};
