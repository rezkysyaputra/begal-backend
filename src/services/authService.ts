import ResponseError from '../helpers/responseError';
import { SellerModel } from '../models/sellerModel';
import { UserModel } from '../models/userModel';
import { sendVerificationEmail } from '../utils/mailer';
import bcrypt from 'bcrypt';

const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

type ModelType = {
  findOne(filter: { email: string }): Promise<any>;
};

export class AuthService {
  static async requestPasswordReset(
    email: string,
    role: string
  ): Promise<string> {
    const Model: ModelType = role === 'user' ? UserModel : SellerModel;

    const user = await Model.findOne({ email });
    if (!user) throw new ResponseError(404, 'User tidak ditemukan');

    const code = generateVerificationCode();
    user.reset_code = code;
    user.reset_code_expiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendVerificationEmail(email, code);
    return 'Kode verifikasi telah dikirim ke email Anda.';
  }

  static async verifyResetCode(
    email: string,
    code: string,
    role: string
  ): Promise<string> {
    const Model: ModelType = role === 'user' ? UserModel : SellerModel;
    const user = await Model.findOne({ email });

    const verify =
      !user ||
      user.reset_code !== code ||
      !user.reset_code_expiry ||
      user.reset_code_expiry < new Date();

    if (verify) {
      throw new ResponseError(
        401,
        'Kode verifikasi tidak valid atau telah kadaluarsa'
      );
    }
    return 'Kode verifikasi valid';
  }

  static async resetPassword(email: string, newPassword: string, role: string) {
    const Model: ModelType = role === 'user' ? UserModel : SellerModel;
    const user = await Model.findOne({ email });
    if (!user) throw new ResponseError(404, 'User tidak ditemukan');

    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_code = undefined;
    user.reset_code_expiry = undefined;
    await user.save();

    return 'Password berhasil direset';
  }
}
