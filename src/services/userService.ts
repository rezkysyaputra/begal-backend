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
} from '../types/userType';
import { UserModel } from '../models/userModel';
import { CreateJwtToken } from '../helpers/createToken';

export class UserService {
  static async register(
    request: CreateUserRequest
  ): Promise<CreateUserResponse> {
    const registerData = Validation.validate(UserValidation.REGISTER, request);

    const name = await UserModel.findOne({ name: registerData.name });

    if (name) {
      throw new ResponseError(400, 'Nama sudah terdaftar');
    }

    const email = await UserModel.findOne({ email: registerData.email });

    if (email) {
      throw new ResponseError(400, 'Email sudah terdaftar');
    }

    registerData.password = await bcrypt.hash(registerData.password, 10);

    const newUser = new UserModel(registerData);
    await newUser.save();

    return {
      name: newUser.name,
      role: newUser.role,
      created_at: newUser.created_at,
    };
  }

  static async login(request: LoginUserRequest): Promise<LoginUserResponse> {
    const loginData = Validation.validate(UserValidation.LOGIN, request);

    const email = await UserModel.findOne({ email: loginData.email });

    if (!email) {
      throw new ResponseError(400, 'Email atau password salah');
    }

    const isPasswordMatch = await bcrypt.compare(
      loginData.password,
      email.password
    );

    if (!isPasswordMatch) {
      throw new ResponseError(400, 'Email atau password salah');
    }

    const token = CreateJwtToken(loginData);

    return token;
  }

  static async get(user: any): Promise<GetUserResponse> {
    const getUser = await UserModel.findOne({ email: user.email });

    if (!getUser) {
      throw new ResponseError(404, 'User not found');
    }

    return toUserResponse(getUser);
  }

  static async update(
    user: any,
    request: UpdateUserRequest
  ): Promise<GetUserResponse> {
    const newData = Validation.validate(UserValidation.UPDATE, request);

    const updateUser = await UserModel.findOneAndUpdate(
      { email: user.email },
      newData,
      { new: true }
    );

    if (!updateUser) {
      throw new ResponseError(404, 'User not found');
    }

    return toUserResponse(updateUser);
  }
}
