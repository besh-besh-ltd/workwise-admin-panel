export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user?: AdminProfile;
}

export interface AdminProfile {
  id: number;
  name: string;
  email: string;
  role?: string;
}
