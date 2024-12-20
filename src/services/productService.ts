import mongoose from 'mongoose';
import ResponseError from '../helpers/responseError';
import { ProductModel } from '../models/productModel';
import {
  CreateProductRequest,
  ProductResponse,
  toProductResponse,
  UpdateProductRequest,
} from '../types/productType';
import cloudinary from '../utils/cloudinary';
import { ProductValidation } from '../validations/productValidation';
import { Validation } from '../validations/validation';
import { extractPublicId } from '../helpers/extractPublicId';
import { SellerModel } from '../models/sellerModel';

export class ProductService {
  static async create(
    user: { id: string },
    request: CreateProductRequest,
    image?: Express.Multer.File
  ): Promise<ProductResponse> {
    const validatedData = Validation.validate(
      ProductValidation.CREATE,
      request
    );

    const nameExists = await ProductModel.exists({ name: validatedData.name });
    if (nameExists) {
      throw new ResponseError(400, 'Nama sudah terdaftar');
    }

    let imageUrl: string | null = null;

    if (image) {
      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'uploads' }, (error, result) => {
            if (error) reject(new ResponseError(409, 'Upload failed'));
            else resolve(result?.secure_url || null);
          })
          .end(image.buffer);
      });
    }

    const data = {
      ...validatedData,
      seller_id: user.id,
      image_url: imageUrl,
    };

    const product = await ProductModel.create(data);
    return toProductResponse(product);
  }

  static async list(user: { id: string }): Promise<ProductResponse[]> {
    const products = await ProductModel.find({ seller_id: user.id }).sort({
      createdAt: -1,
    });
    return products.map((product) => toProductResponse(product));
  }

  static async get(id: string): Promise<ProductResponse> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    const product = await ProductModel.findById(id);
    if (!product) throw new ResponseError(404, 'Produk tidak ditemukan');

    const sellerName = await SellerModel.findById(product.seller_id).select(
      'name'
    );

    if (!sellerName) throw new ResponseError(404, 'Seller tidak ditemukan');

    const mergeProduct = {
      ...product.toObject(),
      seller_name: sellerName.name,
    };

    return toProductResponse(mergeProduct);
  }

  static async getAllProducts(): Promise<ProductResponse[]> {
    const products = await ProductModel.find({}).sort({ createdAt: -1 });
    return products.map((product) => toProductResponse(product));
  }

  static async getProductsBySeller(sellerId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(sellerId)) {
      throw new ResponseError(404, 'Seller tidak ditemukan');
    }
    const seller = await SellerModel.findById(sellerId);
    if (!seller) throw new ResponseError(404, 'Seller tidak ditemukan');

    const products = await ProductModel.find({ seller_id: sellerId });
    if (!products) throw new ResponseError(404, 'Produk tidak ditemukan');

    return {
      id: seller._id,
      name: seller.name,
      owner_name: seller.owner_name,
      role: seller.role,
      profile_picture_url: seller.profile_picture_url,
      phone: seller.phone,
      email: seller.email,
      operational_hours: seller.operational_hours,
      address: seller.address,
      rating: seller.rating,
      reviews_count: seller.reviews_count,
      created_at: seller.createdAt,
      updated_at: seller.updatedAt,
      products: products.map((product) => toProductResponse(product)),
    };
  }

  static async searchProducts(keyword: string): Promise<ProductResponse[]> {
    const products = await ProductModel.find({
      name: { $regex: keyword, $options: 'i' },
    });

    if (!products.length)
      throw new ResponseError(404, 'Produk tidak ditemukan');

    return products.map((product) => toProductResponse(product));
  }

  static async update(
    user: { id: string },
    request: UpdateProductRequest,
    image?: Express.Multer.File
  ): Promise<ProductResponse> {
    const validatedData = Validation.validate(
      ProductValidation.UPDATE,
      request
    );

    if (!mongoose.Types.ObjectId.isValid(request.id)) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    const existingProduct = await ProductModel.findById({
      _id: request.id,
      seller_id: user.id,
    });
    if (!existingProduct) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    let imageUrl: string | null = null;

    if (image) {
      if (existingProduct.image_url) {
        const publicId: string = extractPublicId(existingProduct.image_url);
        await cloudinary.uploader.destroy(publicId);
      }

      imageUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'uploads' }, (error, result) => {
            if (error) reject(new ResponseError(409, 'Upload failed'));
            else resolve(result?.secure_url || null);
          })
          .end(image.buffer);
      });
    }

    const data = {
      ...validatedData,
      image_url: imageUrl ?? existingProduct.image_url,
    };

    const product = await ProductModel.findByIdAndUpdate(
      validatedData.id,
      data,
      { new: true }
    );

    if (!product) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    return toProductResponse(product);
  }

  static async delete(user: { id: string }, id: string): Promise<string> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    const product = await ProductModel.findByIdAndDelete({
      _id: id,
      seller_id: user.id,
    });

    if (!product) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    if (product.image_url) {
      const publicId: string = extractPublicId(product.image_url);
      await cloudinary.uploader.destroy(publicId);
    }

    return 'Produk berhasil dihapus';
  }
}
