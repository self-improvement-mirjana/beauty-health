export type UserDto = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
};

export type AuthResponseDto = {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: UserDto;
};
