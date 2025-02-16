  // src/types/auth.types.ts
  export interface User {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  }
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials extends LoginCredentials {
    username: string;
  }
  
  export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
  }