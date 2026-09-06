export interface User {
  id: string;
  name: string;
  first_name?: string;
  surname?: string;
  gender?: "Male" | "Female" | "Other";
  email?: string;
  phone?: string;
  role: "user" | "admin";
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  data: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}
