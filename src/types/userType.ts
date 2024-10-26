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
  profile_picture_url?: string;
  address: Address;
};

export type CreateUserResponse = {
  name: string;
  role: 'user' | 'seller' | 'admin';
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
  profile_picture_url?: string;
  role: 'user' | 'seller' | 'admin';
  address: Address;
  created_at: Date;
  updated_at: Date;
};

export type UpdateUserRequest = {
  name?: string;
  email?: string;
  phone?: string;
  profile_picture_url?: string;
  address?: Address;
};

export type ChangePasswordRequest = {
  old_password: string;
  new_password: string;
};

export function toUserResponse(user: any): GetUserResponse {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profile_picture_url: user.profile_picture_url,
    address: {
      province: user.address.province,
      regency: user.address.regency,
      district: user.address.district,
      village: user.address.village,
      street: user.address.street,
      detail: user.address.detail,
    },
    created_at: user.createdAt,
    updated_at: user.updatedAt,
  };
}
