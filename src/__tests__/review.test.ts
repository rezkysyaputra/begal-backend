import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import createServer from '../app/server';
import { UserModel } from '../models/userModel';
import { hashPassword } from '../utils/testUtils';
import request from 'supertest';

describe('REVIEW ENDPOINT', () => {
  let token: string;
  const app = createServer();

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const hashedPassword = await hashPassword('securepassword');
    await UserModel.create({
      name: 'Jane Doe',
      email: 'janedoe@gmail.com',
      password: hashedPassword,
      phone: '089876543210',
      role: 'user',
      address: {
        province: 'DI YOGYAKARTA',
        regency: 'KOTA YOGYAKARTA',
        district: 'UMBULHARJO',
        village: 'MUJA-MUJU',
        street: 'Jalan Malioboro',
        detail: 'Ruko No. 1',
      },
    });

    const response = await request(app)
      .post('/api/users/login')
      .send({ email: 'janedoe@gmail.com', password: 'securepassword' });

    token = response.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  it('should create a new review', async () => {
    const response = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        product_id: '64c7c5d2d5d5d5d5d5d5d5d5',
        rating: 4,
        review: 'Great product!',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });
});
