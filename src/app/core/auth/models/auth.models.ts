export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface AuthUser {
  id?: string | number;
  email: string;
  fullName?: string;
  roles?: string[];
}

export interface AuthResponse {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  user?: AuthUser;
}
