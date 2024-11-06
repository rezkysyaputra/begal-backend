type Address = {
  province: string;
  regency: string;
  district: string;
  village: string;
  street: string;
  detail: string;
};

type OperationalHours = {
  open: string;
  close: string;
};

export type SellerResponse = {
  name: string;
  token?: string;
};

export type CreateSellerRequest = {
  name: string;
  owner_name: string;
  email: string;
  password: string;
  phone: string;
  role: 'user' | 'seller' | 'admin';
  profile_picture_url?: string;
  address: Address;
  operational_hours: OperationalHours;
};

export type CreateSellerResponse = {
  name: string;
  role: 'user' | 'seller' | 'admin';
};

export type LoginSellerRequest = {
  email: string;
  password: string;
};

export type LoginSellerResponse = string;

export type GetSellerResponse = {
  id: string;
  name: string;
  owner_name: string;
  email: string;
  phone: string;
  profile_picture_url?: string;
  role: 'user' | 'seller' | 'admin';
  address: Address;
  operational_hours: OperationalHours;
  rating: number;
  reviews_count: number;
  created_at: Date;
  updated_at: Date;
};

export type UpdateSellerRequest = {
  name?: string;
  email?: string;
  phone?: string;
  profile_picture_url?: string;
  address?: Address;
  operational_hours?: OperationalHours;
};

export type ChangePasswordRequest = {
  old_password: string;
  new_password: string;
};

export type SearchSellerRequest = {
  name?: string;
  
}

export function toSellerResponse(seller: any): GetSellerResponse {
  return {
    id: seller._id,
    name: seller.name,
    owner_name: seller.owner_name,
    email: seller.email,
    phone: seller.phone,
    role: seller.role,
    profile_picture_url: seller.profile_picture_url,
    address: {
      province: seller.address.province,
      regency: seller.address.regency,
      district: seller.address.district,
      village: seller.address.village,
      street: seller.address.street,
      detail: seller.address.detail,
    },
    operational_hours: {
      open: seller.operational_hours.open,
      close: seller.operational_hours.close,
    },
    rating: seller.rating,
    reviews_count: seller.reviews_count,
    created_at: seller.createdAt,
    updated_at: seller.updatedAt,
  };
}
