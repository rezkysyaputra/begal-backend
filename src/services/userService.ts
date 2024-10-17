import { UserValidation } from '../validations/userValidation';
import { Validation } from '../validations/validation';
import ResponseError from '../helpers/responseError';
import bcrypt from 'bcrypt';
import { userRequest, userResponse } from '../types/userType';
import { UserModel } from '../models/userModel';

export class UserService {
  static async register(request: userRequest): Promise<userResponse> {
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
}
