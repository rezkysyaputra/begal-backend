import { UserValidation } from '../validations/userValidation';
import { Validation } from '../validations/validation';
import ResponseError from '../helpers/responseError';
import bcrypt from 'bcrypt';
import {
  CreateUserRequest,
  CreateUserResponse,
  LoginUserRequest,
  LoginUserResponse,
  GetUserResponse,
  toUserResponse,
  UpdateUserRequest,
  ChangePasswordRequest,
} from '../types/userType';
import { UserModel } from '../models/userModel';
import { CreateJwtToken } from '../helpers/createToken';
import cloudinary from '../utils/cloudinary';
import { extractPublicId } from '../helpers/extractPublicId';
import { SellerModel } from '../models/sellerModel';
import { GetSellerResponse, toSellerResponse } from '../types/sellerType';
import { ProductModel } from '../models/productModel';
import { ProductResponse, toProductResponse } from '../types/productType';
import mongoose from 'mongoose';

export class UserService {
  // Register user with optional profile picture upload
  static async register(
    request: CreateUserRequest,
    image?: Express.Multer.File
  ): Promise<CreateUserResponse> {
    const validatedData = Validation.validate(UserValidation.REGISTER, request);

    if (await UserModel.exists({ name: validatedData.name })) {
      throw new ResponseError(400, 'Nama sudah terdaftar');
    }

    if (await UserModel.exists({ email: validatedData.email })) {
      throw new ResponseError(400, 'Email sudah terdaftar');
    }

    validatedData.password = await bcrypt.hash(validatedData.password, 10);

    let profilePictureUrl: string | null = null;
    if (image) {
      profilePictureUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'uploads' }, (error, result) => {
            if (error) reject(new ResponseError(409, 'Upload gambar gagal'));
            else resolve(result?.secure_url || null);
          })
          .end(image.buffer);
      });
    }

    const newUser = await UserModel.create({
      ...validatedData,
      profile_picture_url: profilePictureUrl,
    });

    return {
      name: newUser.name,
      role: newUser.role,
    };
  }

  // Login method with JWT token generation
  static async login(request: LoginUserRequest): Promise<LoginUserResponse> {
    const loginData = Validation.validate(UserValidation.LOGIN, request);

    const user = await UserModel.findOne({ email: loginData.email });
    if (!user) throw new ResponseError(400, 'Email atau password salah');

    const isPasswordMatch = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!isPasswordMatch)
      throw new ResponseError(400, 'Email atau password salah');

    const payloadJwtToken = {
      id: user._id as string,
      name: user.name,
      role: user.role,
    };

    const token = CreateJwtToken(payloadJwtToken);
    return token;
  }

  // Get user details
  static async get(user: { id: string }): Promise<GetUserResponse> {
    const getUser = await UserModel.findById(user.id);
    if (!getUser) throw new ResponseError(404, 'User tidak ditemukan');

    return toUserResponse(getUser);
  }

  // Update user details, including optional address and profile picture update
  static async update(
    user: { id: string },
    request: UpdateUserRequest,
    image?: Express.Multer.File
  ): Promise<GetUserResponse> {
    const newData = Validation.validate(UserValidation.UPDATE, request);

    const existingData = await UserModel.findById(user.id);
    if (!existingData) throw new ResponseError(404, 'User tidak ditemukan');

    let profilePictureUrl: string | null = null;

    if (image) {
      if (existingData.profile_picture_url) {
        const publicId = extractPublicId(existingData.profile_picture_url);
        await cloudinary.uploader.destroy(publicId);
      }

      profilePictureUrl = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: 'uploads' }, (error, result) => {
            if (error) reject(new ResponseError(409, 'Upload gambar gagal'));
            else resolve(result?.secure_url || null);
          })
          .end(image.buffer);
      });
    }

    const mergedData = {
      ...newData,
      address: {
        ...existingData.address,
        ...newData.address,
      },
      profile_picture_url: profilePictureUrl,
    };

    const updatedUser = await UserModel.findByIdAndUpdate(
      user.id,
      { $set: mergedData },
      { new: true }
    );

    if (!updatedUser) throw new ResponseError(404, 'User tidak ditemukan');

    return toUserResponse(updatedUser);
  }

  // Change user password
  static async changePassword(
    user: { id: string },
    request: ChangePasswordRequest
  ): Promise<string> {
    const data = Validation.validate(UserValidation.CHANGE_PASSWORD, request);

    const getUser = await UserModel.findById(user.id);
    if (!getUser) throw new ResponseError(404, 'User tidak ditemukan');

    const isPasswordMatch = await bcrypt.compare(
      data.old_password,
      getUser.password
    );
    if (!isPasswordMatch) throw new ResponseError(400, 'Password lama salah');

    const newPassword = await bcrypt.hash(data.new_password, 10);
    await UserModel.findByIdAndUpdate(user.id, { password: newPassword });

    return 'Password berhasil diubah';
  }

  // Get nearby sellers based on user's district
  static async getNearbySellers(user: {
    id: string;
  }): Promise<GetSellerResponse[]> {
    const userLocation = await UserModel.findById(user.id);
    if (!userLocation) throw new ResponseError(404, 'User tidak ditemukan');

    const nearbySellers = await SellerModel.find({
      'address.district': new RegExp(`^${userLocation.address.district}$`, 'i'),
    });
    if (!nearbySellers.length)
      throw new ResponseError(404, 'Toko terdekat tidak ditemukan');

    return nearbySellers.map((seller) => toSellerResponse(seller));
  }

  // Get products by seller
  static async getProductsBySeller(sellerId: string): Promise<any> {
    if (!mongoose.Types.ObjectId.isValid(sellerId))
      throw new ResponseError(400, 'Seller tidak ditemukan');

    const seller = await SellerModel.findById(sellerId);
    if (!seller) throw new ResponseError(404, 'Seller tidak ditemukan');

    const products = await ProductModel.find({ seller_id: sellerId });
    if (!products) throw new ResponseError(404, 'Produk tidak ditemukan');

    return {
      seller_id: seller._id,
      name: seller.name,
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
}
