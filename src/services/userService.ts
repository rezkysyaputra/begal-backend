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
  NearbySellersResponse,
} from '../types/userType';
import { UserModel } from '../models/userModel';
import { CreateJwtToken } from '../helpers/createToken';
import cloudinary from '../utils/cloudinary';
import { SellerModel } from '../models/sellerModel';

export class UserService {
  static async register(
    request: CreateUserRequest,
    image: any
  ): Promise<CreateUserResponse> {
    const validatedData = Validation.validate(UserValidation.REGISTER, request);

    const name = await UserModel.findOne({ name: validatedData.name });

    if (name) {
      throw new ResponseError(400, 'Nama sudah terdaftar');
    }

    const email = await UserModel.findOne({ email: validatedData.email });

    if (email) {
      throw new ResponseError(400, 'Email sudah terdaftar');
    }

    validatedData.password = await bcrypt.hash(validatedData.password, 10);

    let profilePictureUrl: string | null = null;
    if (image) {
      const uploadResult = cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) throw new ResponseError(409, 'Upload gambar gagal');

          profilePictureUrl = result!.secure_url;
        }
      );
      image.stream.pipe(uploadResult);
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

  static async login(request: LoginUserRequest): Promise<LoginUserResponse> {
    const loginData = Validation.validate(UserValidation.LOGIN, request);

    const user = await UserModel.findOne({ email: loginData.email });

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

    const payloadJwtToken = {
      id: user._id as string,
      name: user.name,
      role: user.role,
    };

    const token = CreateJwtToken(payloadJwtToken);

    return token;
  }

  static async get(user: any): Promise<GetUserResponse> {
    const getUser = await UserModel.findById(user.id);

    if (!getUser) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    return toUserResponse(getUser);
  }

  static async update(
    user: any,
    request: UpdateUserRequest
  ): Promise<GetUserResponse> {
    const newData = Validation.validate(UserValidation.UPDATE, request);

    const existingData = await UserModel.findById(user.id);
    if (!existingData) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    // Gabungkan data lama dengan data baru
    const mergedData = {
      ...existingData.toObject(),
      ...newData,
      address: {
        ...existingData.address,
        ...newData.address,
      },
    };

    // Lakukan update dengan $set
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.id,
      { $set: mergedData },
      { new: true }
    );

    if (!updatedUser) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    return toUserResponse(updatedUser);
  }

  static async changePassword(
    user: any,
    request: ChangePasswordRequest
  ): Promise<string> {
    const data = Validation.validate(UserValidation.CHANGE_PASSWORD, request);

    // Check old password
    const getUser = await UserModel.findById(user.id);

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

    await UserModel.findByIdAndUpdate(user.id, { password: newPassword });

    return 'Password berhasil diubah';
  }

  static async getNearbySellers(user: any): Promise<NearbySellersResponse[]> {
    const userLocation = await UserModel.findOne({ _id: user.id });

    if (!userLocation) {
      throw new ResponseError(404, 'User tidak ditemukan');
    }

    const nearbySellers = await SellerModel.find({
      'address.district': new RegExp(`^${userLocation.address.district}$`, 'i'),
    }).select(
      '_id name address operational_hours rating reviews_count profile_picture_url phone email'
    );

    if (nearbySellers.length === 0) {
      throw new ResponseError(404, 'Toko terdekat tidak ditemukan');
    }

    return nearbySellers as NearbySellersResponse[];
  }
}
