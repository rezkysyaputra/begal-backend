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

export class ProductService {
  static async create(
    user: any,
    request: CreateProductRequest,
    image: any
  ): Promise<ProductResponse> {
    const validatedData = Validation.validate(
      ProductValidation.CREATE,
      request
    );

    const name = await ProductModel.findOne({ name: validatedData.name });

    if (name) {
      throw new ResponseError(400, 'Nama sudah terdaftar');
    }

    let imageUrl: string | null = null;

    if (image) {
      const uploadResult = cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) throw new ResponseError(409, 'Upload failed');

          imageUrl = result!.secure_url;
        }
      );
      image.stream.pipe(uploadResult);
    }

    const data = {
      ...validatedData,
      seller_id: user.id,
      image_url: imageUrl,
    };

    const product = await ProductModel.create(data);

    return toProductResponse(product);
  }

  static async list(user: any): Promise<ProductResponse[]> {
    const products = await ProductModel.find({ seller_id: user.id });

    if (!products) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    return products.map((product) => toProductResponse(product));
  }

  static async update(
    user: any,
    request: UpdateProductRequest,
    image: any
  ): Promise<ProductResponse> {
    const validatedData = Validation.validate(
      ProductValidation.UPDATE,
      request
    );

    if (!mongoose.Types.ObjectId.isValid(request.id)) {
      throw new ResponseError(400, 'Produk tidak ditemukan');
    }

    let imageUrl: string | null = null;

    if (image) {
      const uploadResult = cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) throw new ResponseError(409, 'Upload failed');

          imageUrl = result!.secure_url;
        }
      );
      image.stream.pipe(uploadResult);
    }

    const data = {
      ...validatedData,
      image_url: imageUrl,
    };

    const product = await ProductModel.findOneAndUpdate(
      { _id: validatedData.id, seller_id: user.id },
      data,
      { new: true }
    );

    if (!product) {
      throw new ResponseError(404, 'Produk tidak ditemukan');
    }

    return toProductResponse(product);
  }
}
