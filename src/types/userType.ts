import { UserModel } from '../models/userModel';

export type UserRequest = {
  user?: typeof UserModel;
};

type Address = {
  province: string;
  regency: string;
  district: string;
  village: string;
  street: string;
  detail: string;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'seller' | 'admin';
  address: Address;
};

export type CreateUserResponse = {
  name: string;
  role: 'user' | 'seller' | 'admin';
  created_at: Date;
};

export type LoginUserRequest = {
  headers: any;
  get(arg0: string): unknown;
  user: any;
  email: string;
  password: string;
};

export type LoginUserResponse = {
  token: string;
};
