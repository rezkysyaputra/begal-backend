import { Document } from 'mongoose';

type Address = {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  latitude: number;
  longitude: number;
};

export type userRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  profile_picture?: string;
  address: Address;
};

export type userResponse = {
  name: string;
  role: 'user' | 'seller' | 'admin';
  created_at: Date;
};
