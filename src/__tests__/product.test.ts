import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { SellerModel } from '../models/sellerModel';
import logger from '../utils/logger';
import createServer from '../app/server';

describe('PRODUCT ENDPOINT', () => {
  let token: string;
  const app = createServer();

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    await SellerModel.create({
      name: 'ABC Store',
      owner_name: 'Alice Doe',
      email: 'abcstore@gmail.com',
      password: 'securepassword',
      phone: '081234567890',
      role: 'seller',
      address: {
        province: 'DI YOGYAKARTA',
        regency: 'KOTA YOGYAKARTA',
        district: 'UMBULHARJO',
        village: 'MUJA-MUJU',
        street: 'Jalan Malioboro',
        detail: 'Toko No. 1',
      },
      operational_hours: {
        open: '08:00',
        close: '20:00',
      },
    });

    const response = await request(app)
      .post('/api/sellers/login')
      .send({ email: 'abcstore@gmail.com', password: 'securepassword' });

    token = response.body.token;
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe('POST /api/sellers/products', () => {
    it('should create a new product successfully', async () => {
      const response = await request(app)
        .post('/api/sellers/products')
        .send({ name: 'ABC Store 2' })
        .set('Authorization', `Bearer ${token}`);

      logger.info(response.body.data);
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('ABC Store 2');
    });
  });
});
