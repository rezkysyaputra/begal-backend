import { UserValidation } from '../validations/userValidation';
import { Validation } from '../validations/validation';
import ResponseError from '../helpers/responseError';
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
import { bcryptPassword, comparePassword } from '../helpers/bcryptPassword';

export class UserService {
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

    validatedData.password = await bcryptPassword(validatedData.password);

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

  static async login(request: LoginUserRequest): Promise<LoginUserResponse> {
    const loginData = Validation.validate(UserValidation.LOGIN, request);

    const user = await UserModel.findOne({ email: loginData.email });
    if (!user) throw new ResponseError(400, 'Email atau password salah');

    const isPasswordMatch = await comparePassword(
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

  static async get(user: { id: string }): Promise<GetUserResponse> {
    const getUser = await UserModel.findById(user.id);
    if (!getUser) throw new ResponseError(404, 'User tidak ditemukan');

    return toUserResponse(getUser);
  }

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

  static async changePassword(
    user: { id: string },
    request: ChangePasswordRequest
  ): Promise<string> {
    const data = Validation.validate(UserValidation.CHANGE_PASSWORD, request);

    const getUser = await UserModel.findById(user.id);
    if (!getUser) throw new ResponseError(404, 'User tidak ditemukan');

    const isPasswordMatch = await comparePassword(
      data.old_password,
      getUser.password
    );
    if (!isPasswordMatch) throw new ResponseError(400, 'Password lama salah');

    const newPassword = await bcryptPassword(data.new_password);
    await UserModel.findByIdAndUpdate(user.id, { password: newPassword });

    return 'Password berhasil diubah';
  }
}
