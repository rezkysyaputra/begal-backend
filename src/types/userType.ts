type Address = {
  province: string;
  regency: string;
  district: string;
  village: string;
  street: string;
  detail: string;
};

export type UserResponse = {
  name: string;
  token?: string;
};

export type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'seller' | 'admin';
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

export type LoginUserResponse = string;

export type GetUserResponse = {
  name: string;
  email: string;
  phone: string;
  profile_picture?: string;
  role: 'user' | 'seller' | 'admin';
  address: Address;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  phone?: string;
  profile_picture?: string;
  address?: Address;
};

export function toUserResponse(user: any): GetUserResponse {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profile_picture: user.profile_picture,
    address: {
      province: user.address.province,
      regency: user.address.regency,
      district: user.address.district,
      village: user.address.village,
      street: user.address.street,
      detail: user.address.detail,
    },
  };
}
