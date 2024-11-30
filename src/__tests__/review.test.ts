import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import createServer from '../app/server';
import { UserModel } from '../models/userModel';
import { hashPassword } from '../utils/testUtils';
import request from 'supertest';
import { SellerModel } from '../models/sellerModel';

describe('REVIEW ENDPOINT', () => {
  let userToken: string;
  let sellerToken: string;
  let sellerId: string;
  let userId: string;
  let reviewId: string;
  const app = createServer();

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const hashedPassword = await hashPassword('securepassword');
    const user = await UserModel.create({
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

    const seller = await SellerModel.create({
      name: 'ABC Store',
      owner_name: 'Alice Doe',
      email: 'abcstore@gmail.com',
      password: hashedPassword,
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

    userId = user._id as string;
    sellerId = seller._id as string;

    const userLogin = await request(app)
      .post('/api/users/login')
      .send({ email: 'janedoe@gmail.com', password: 'securepassword' });

    const sellerLogin = await request(app)
      .post('/api/sellers/login')
      .send({ email: 'abcstore@gmail.com', password: 'securepassword' });

    userToken = userLogin.body.token;
    sellerToken = sellerLogin.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe('POST /api/users/reviews', () => {
    it('should user can create a new review', async () => {
      const response = await request(app)
        .post('/api/users/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          seller_id: sellerId,
          rating: 4,
          comment: 'Great product!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      reviewId = response.body.data.id;
    });

    it('should seller can not create a new review ', async () => {
      const response = await request(app)
        .post('/api/users/reviews')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          seller_id: sellerId,
          rating: 4,
          comment: 'Great product!',
        });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe('Akses ditolak');
    });

    it('should return a bad request error with empty payload', async () => {
      const response = await request(app)
        .post('/api/users/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await request(app)
        .post('/api/users/reviews')
        .set('Authorization', `Bearer wrongtoken`)
        .send({
          seller_id: sellerId,
          rating: 4,
          comment: 'Great product!',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a bad request error with existing review', async () => {
      const response = await request(app)
        .post('/api/users/reviews')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          seller_id: sellerId,
          rating: 5,
          comment: 'Great product!',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBe('Review sudah ada');
    });
  });

  describe('GET /api/sellers/reviews', () => {
    it('should get all reviews successfully', async () => {
      const response = await request(app)
        .get('/api/sellers/reviews')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await request(app)
        .get('/api/sellers/reviews')
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await request(app).get('/api/sellers/reviews');

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('GET /api/users/reviews/:id', () => {
    it('should get a review successfully', async () => {
      const response = await request(app).get(`/api/users/reviews/${sellerId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return a not found error with invalid id', async () => {
      const response = await request(app).get('/api/users/reviews/invalidid');

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Seller tidak ditemukan');
    });
  });

  describe('PATCH /api/users/reviews/:id', () => {
    it('should update a review successfully', async () => {
      const response = await request(app)
        .patch(`/api/users/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5, comment: 'Great product!' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await request(app)
        .patch(`/api/users/reviews/${reviewId}`)
        .set('Authorization', `Bearer wrongtoken`)
        .send({ rating: 5, comment: 'Great product!' });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a not found error with invalid id', async () => {
      const response = await request(app)
        .patch('/api/users/reviews/invalidid')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ rating: 5, comment: 'Great product!' });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Review tidak ditemukan');
    });
  });

  describe('DELETE /api/users/reviews/:id', () => {
    it('should delete a review successfully', async () => {
      const response = await request(app)
        .delete(`/api/users/reviews/${reviewId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await request(app)
        .delete(`/api/users/reviews/${reviewId}`)
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a not found error with invalid id', async () => {
      const response = await request(app)
        .delete('/api/users/reviews/invalidid')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Review tidak ditemukan');
    });
  });
});
