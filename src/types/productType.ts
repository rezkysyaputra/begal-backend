export type CreateProductRequest = {
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url?: string;
};

export type ProductResponse = {
  id: string;
  seller_id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  created_at: Date;
  updated_at: Date;
};

export type UpdateProductRequest = {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  image_url?: string;
};

export const toProductResponse = (product: any): ProductResponse => {
  return {
    id: product._id,
    seller_id: product.seller_id,
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    image_url: product.image_url,
    created_at: product.createdAt,
    updated_at: product.updatedAt,
  };
};
