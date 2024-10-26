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

export class SellerService {
  static async register(
    request: CreateSellerRequest,
    image: any
  ): Promise<CreateSellerResponse> {
    const validatedData = Validation.validate(
      SellerValidation.REGISTER,
      request
    );

    const name = await SellerModel.findOne({ name: validatedData.name });

    if (name) {
      throw new ResponseError(400, 'Nama sudah terdaftar');
    }

    const email = await SellerModel.findOne({ email: validatedData.email });

    if (email) {
      throw new ResponseError(400, 'Email sudah terdaftar');
    }

    validatedData.password = await bcrypt.hash(validatedData.password, 10);

    let profilePictureUrl: string | null = null;
    if (image) {
      const uploadResult = cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) throw new ResponseError(409, 'Upload failed');

          profilePictureUrl = result!.secure_url;
        }
      );
      image.stream.pipe(uploadResult);
    }

    const newUser = await SellerModel.create({
      ...validatedData,
      profile_picture_url: profilePictureUrl,
    });

    return {
      name: newUser.name,
      role: newUser.role,
    };
  }

  static async login(
    request: LoginSellerRequest
  ): Promise<LoginSellerResponse> {
    const loginData = Validation.validate(SellerValidation.LOGIN, request);

    const user = await SellerModel.findOne({ email: loginData.email });

    if (!user) {
      throw new ResponseError(400, 'Email atau password salah');
    }

    const isPasswordMatch = await bcrypt.compare(
      loginData.password,
      user.password
    );

    if (!isPasswordMatch) {
      throw new ResponseError(400, 'Email atau password salah');
    }

    const token = CreateJwtToken(loginData);

    return token;
  }

  static async get(user: any): Promise<GetSellerResponse> {
    const getUser = await SellerModel.findOne({ email: user.email });

    if (!getUser) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    return toSellerResponse(getUser);
  }

  static async update(
    user: any,
    request: UpdateSellerRequest
  ): Promise<GetSellerResponse> {
    // Validasi data baru
    const newData = Validation.validate(SellerValidation.UPDATE, request);

    // Ambil data pengguna yang sudah ada
    const existingData = await SellerModel.findOne({ email: user.email });
    if (!existingData) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    // Gabungkan data lama dengan data baru
    const mergedData = {
      ...existingData.toObject(),
      ...newData,
      operational_hours: {
        ...existingData.operational_hours,
        ...newData.operational_hours,
      },
      address: {
        ...existingData.address,
        ...newData.address,
      },
    };

    // Lakukan update dengan $set
    const updatedUser = await SellerModel.findOneAndUpdate(
      { email: user.email },
      { $set: mergedData },
      { new: true }
    );

    if (!updatedUser) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    return toSellerResponse(updatedUser);
  }

  static async changePassword(
    user: any,
    request: ChangePasswordRequest
  ): Promise<string> {
    const data = Validation.validate(SellerValidation.CHANGE_PASSWORD, request);

    // Check old password
    const getUser = await SellerModel.findOne({ email: user.email });

    if (!getUser) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    const isPasswordMatch = await bcrypt.compare(
      data.old_password,
      getUser.password
    );

    if (!isPasswordMatch) {
      throw new ResponseError(400, 'Password lama salah');
    }

    const newPassword = await bcrypt.hash(data.new_password, 10);

    await SellerModel.findOneAndUpdate(
      { email: user.email },
      { password: newPassword }
    );

    return 'Password berhasil diubah';
  }
}
