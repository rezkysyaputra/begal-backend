type Address = {
  street: string;
  city: string;
  province: string;
  postal_code: string;
  latitude: number;
  longitude: number;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  profile_picture?: string;
  address: Address;
};

export type CreateUserResponse = {
  name: string;
  role: 'user' | 'seller' | 'admin';
  created_at: Date;
};

export type LoginUserRequest = {
  email: string;
  password: string;
};

export type LoginUserResponse = {
  token: string;
};
