export type WishListResponse = {
  id: string;
  user_id: string;
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
  };
  created_at: Date;
  updated_at: Date;
};
export type CreateWishListResponse = {
  id: string;
  user_id: string;
  product_id: string;
  created_at: Date;
  updated_at: Date;
};

export type WishListRequest = {
  user_id: string;
  product_id: string;
};

export const toWishListResponse = (wishList: any): WishListResponse => {
  return {
    id: wishList._id,
    user_id: wishList.user_id,
    product: {
      id: wishList.product_id._id,
      name: wishList.product_id.name,
      description: wishList.product_id.description,
      price: wishList.product_id.price,
      stock: wishList.product_id.stock,
      image_url: wishList.product_id.image_url,
    },
    created_at: wishList.createdAt,
    updated_at: wishList.updatedAt,
  };
};

export const createWishListResponse = (
  wishList: any
): CreateWishListResponse => {
  return {
    id: wishList._id,
    user_id: wishList.user_id,
    product_id: wishList.product_id,
    created_at: wishList.createdAt,
    updated_at: wishList.updatedAt,
  };
};
