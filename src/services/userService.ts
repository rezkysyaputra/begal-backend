import { UserValidation } from '../validations/userValidation';
import { Validation } from '../validations/validation';
import ResponseError from '../helpers/responseError';
import bcrypt from 'bcrypt';
import {
  CreateUserRequest,
  CreateUserResponse,
  LoginUserRequest,
  LoginUserResponse,
} from '../types/userType';
import { UserModel } from '../models/userModel';
import { CreateJwtToken } from '../helpers/createToken';

export class UserService {
  static async register(
    request: CreateUserRequest
  ): Promise<CreateUserResponse> {
    // validasi data baru
    const registerData = Validation.validate(UserValidation.REGISTER, request);

    // cek nama dan email jika sudah terdaftar
    const name = await UserModel.findOne({ name: registerData.name });

    if (name) {
      throw new ResponseError(400, 'Nama sudah terdaftar');
    }

    const email = await UserModel.findOne({ email: registerData.email });

    if (email) {
      throw new ResponseError(400, 'Email sudah terdaftar');
    }

    // enkripsi password
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
    // validasi data login
    const loginData = Validation.validate(UserValidation.LOGIN, request);

    // cek email
    const email = await UserModel.findOne({ email: loginData.email });

    if (!email) {
      throw new ResponseError(400, 'Email atau password salah');
    }

    // cek password
    const isPasswordMatch = await bcrypt.compare(
      loginData.password,
      email.password
    );

    if (!isPasswordMatch) {
      throw new ResponseError(400, 'Email atau password salah');
    }

    // create token
    const token = CreateJwtToken(loginData);

    return {
      token,
    };
  }
}
