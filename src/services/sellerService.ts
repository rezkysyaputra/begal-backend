import { Validation } from '../validations/validation';
import ResponseError from '../helpers/responseError';
import bcrypt from 'bcrypt';
import { CreateJwtToken } from '../helpers/createToken';
import cloudinary from '../utils/cloudinary';
import {
  CreateSellerRequest,
  CreateSellerResponse,
  GetSellerResponse,
  LoginSellerRequest,
  LoginSellerResponse,
  toSellerResponse,
  UpdateSellerRequest,
} from '../types/sellerType';
import { ChangePasswordRequest } from '../types/userType';
import { SellerValidation } from '../validations/sellerValidation';
import { SellerModel } from '../models/sellerModel';
import { extractPublicId } from '../helpers/extractPublicId';

export class SellerService {
  static async register(
    request: CreateSellerRequest,
    image?: Express.Multer.File
  ): Promise<CreateSellerResponse> {
    const validatedData = Validation.validate(
      SellerValidation.REGISTER,
      request
    );

    const existingName = await SellerModel.exists({ name: validatedData.name });
    if (existingName) throw new ResponseError(400, 'Nama sudah terdaftar');

    const existingEmail = await SellerModel.exists({
      email: validatedData.email,
    });
    if (existingEmail) throw new ResponseError(400, 'Email sudah terdaftar');

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

    const newSeller = await SellerModel.create({
      ...validatedData,
      profile_picture_url: profilePictureUrl,
    });

    return {
      name: newSeller.name,
      role: newSeller.role,
    };
  }

  static async login(
    request: LoginSellerRequest
  ): Promise<LoginSellerResponse> {
    const loginData = Validation.validate(SellerValidation.LOGIN, request);

    const seller = await SellerModel.findOne({ email: loginData.email });
    if (!seller) throw new ResponseError(400, 'Email atau password salah');

    const isPasswordMatch = await bcrypt.compare(
      loginData.password,
      seller.password
    );
    if (!isPasswordMatch)
      throw new ResponseError(400, 'Email atau password salah');

    const payloadJwtToken = {
      id: seller._id as string,
      name: seller.name,
      role: seller.role,
    };

    const token = CreateJwtToken(payloadJwtToken);
    return token;
  }

  static async get(seller: { id: string }): Promise<GetSellerResponse> {
    const foundSeller = await SellerModel.findById(seller.id);
    if (!foundSeller) throw new ResponseError(404, 'Seller tidak ditemukan');

    return toSellerResponse(foundSeller);
  }

  static async update(
    seller: { id: string },
    request: UpdateSellerRequest,
    image?: Express.Multer.File
  ): Promise<GetSellerResponse> {
    const newData = Validation.validate(SellerValidation.UPDATE, request);

    const existingData = await SellerModel.findById(seller.id);
    if (!existingData) throw new ResponseError(404, 'Seller tidak ditemukan');

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
      operational_hours: {
        ...existingData.operational_hours,
        ...newData.operational_hours,
      },
      profile_picture_url:
        profilePictureUrl ?? existingData.profile_picture_url,
    };

    const updatedSeller = await SellerModel.findByIdAndUpdate(
      seller.id,
      { $set: mergedData },
      { new: true }
    );

    if (!updatedSeller) throw new ResponseError(404, 'Seller tidak ditemukan');

    return toSellerResponse(updatedSeller);
  }

  static async changePassword(
    seller: { id: string },
    request: ChangePasswordRequest
  ): Promise<string> {
    const data = Validation.validate(SellerValidation.CHANGE_PASSWORD, request);

    const foundSeller = await SellerModel.findById(seller.id);
    if (!foundSeller) throw new ResponseError(404, 'Seller tidak ditemukan');

    const isPasswordMatch = await bcrypt.compare(
      data.old_password,
      foundSeller.password
    );
    if (!isPasswordMatch) throw new ResponseError(400, 'Password lama salah');

    const newPassword = await bcrypt.hash(data.new_password, 10);
    await SellerModel.findByIdAndUpdate(seller.id, { password: newPassword });

    return 'Password berhasil diubah';
  }
}
