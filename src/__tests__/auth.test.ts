import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  setupMongoMemoryServer,
  teardownMongoMemoryServer,
} from '../test/mongoMemoryServer';
import createServer from '../app/server';
import { createUser } from '../test/testUtils';
import supertest from 'supertest';
import { UserModel } from '../models/userModel';

describe('AUTH FORGOT PASSWORD ENDPOINT', () => {
  let user: any;
  let mongoServer: MongoMemoryServer;
  const app = createServer();

  beforeAll(async () => {
    mongoServer = await setupMongoMemoryServer();
    user = await createUser();
  });

  afterAll(async () => {
    await teardownMongoMemoryServer(mongoServer);
  });

  it('should send email to reset password', async () => {
    const response = await supertest(app)
      .post('/api/auth/request-reset-password')
      .send({
        email: user.email,
        role: 'user',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      'Kode verifikasi telah dikirim ke email Anda.'
    );

    const updatedUser = await UserModel.findOne({ email: user.email });
    expect(updatedUser?.reset_code).toBeDefined();
    expect(updatedUser?.reset_code_expiry).toBeDefined();
  });

  it('should verify the reset code successfully', async () => {
    const resetCode = '123456';
    await UserModel.updateOne(
      { email: user.email },
      {
        reset_code: resetCode,
        reset_code_expiry: new Date(Date.now() + 10 * 60 * 1000),
      }
    );

    const response = await supertest(app)
      .post('/api/auth/verify-reset-code')
      .send({
        email: user.email,
        code: resetCode,
        role: 'user',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Kode verifikasi valid');
  });

  it('should fail verification with invalid or expired code', async () => {
    const response = await supertest(app)
      .post('/api/auth/verify-reset-code')
      .send({
        email: user.email,
        code: 'invalidCode',
        role: 'user',
      });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBe(
      'Kode verifikasi tidak valid atau telah kadaluarsa'
    );
  });

  it('should reset password successfully', async () => {
    const newPassword = 'newPassword123';

    // Set valid reset code
    const resetCode = '123456';
    await UserModel.updateOne(
      { email: user.email },
      {
        reset_code: resetCode,
        reset_code_expiry: new Date(Date.now() + 10 * 60 * 1000),
      }
    );

    const response = await supertest(app)
      .post('/api/auth/reset-password')
      .send({
        email: user.email,
        newPassword,
        role: 'user',
      });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Password berhasil direset');

    const updatedUser = await UserModel.findOne({ email: user.email });
    expect(updatedUser?.password).not.toBe(user.password);
    expect(updatedUser?.reset_code).toBeUndefined();
    expect(updatedUser?.reset_code_expiry).toBeUndefined();
  });

  it('should return 404 for unknown email on reset-password', async () => {
    const response = await supertest(app)
      .post('/api/auth/reset-password')
      .send({
        email: 'unknown@example.com',
        newPassword: 'newPassword123',
        role: 'user',
      });

    expect(response.status).toBe(404);
    expect(response.body.errors).toBe('User tidak ditemukan');
  });
});
