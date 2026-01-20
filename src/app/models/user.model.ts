export enum UserRole {
  SimpleUser = 0,
  Admin = 1
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  fullName: string;
  role: UserRole;
  isAdmin: boolean;
  createdAt: string;
}

export interface RegisterUser {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface LoginUser {
  phoneNumber: string;
  password: string;
}

