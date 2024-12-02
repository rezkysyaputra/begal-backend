import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { SellerModel } from '../models/sellerModel';
import createServer from '../app/server';
import { hashPassword } from '../utils/testUtils';
import { ProductModel } from '../models/productModel';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn((options, callback) => {
        callback(null, {
          secure_url: 'http://res.cloudinary.com/upload/image/mock-image.jpg',
          public_id: 'mock-public-id',
        });
      }),
      destroy: jest.fn().mockResolvedValue({ result: 'ok' }),
    },
  },
}));

describe('PRODUCT ENDPOINT', () => {
  let token: string;
  const app = createServer();

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    const hashedPassword = await hashPassword('securepassword');
    await SellerModel.create({
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

    const response = await request(app)
      .post('/api/sellers/login')
      .send({ email: 'abcstore@gmail.com', password: 'securepassword' });

    token = response.body.token;
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoose.connection.close();
  });

  describe('POST /api/sellers/products', () => {
    it('should create a new product successfully with image', async () => {
      const response = await request(app)
        .post('/api/sellers/products')
        .field('name', 'ABC Store 2')
        .field('description', 'Toko ABC Store 2')
        .field('price', 10000)
        .field('stock', 10)
        .attach('image', Buffer.from('mock file content'), 'mock-image.jpg')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('ABC Store 2');
      expect(response.body.data.image_url).toBeDefined();
    });

    it('should return validation error with empty payload', async () => {
      const response = await request(app)
        .post('/api/sellers/products')
        .send({})
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return validation error with invalid payload', async () => {
      const response = await request(app)
        .post('/api/sellers/products')
        .send({ name: 'ABC Store 2' })
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return unauthorized error with undefined token', async () => {
      const response = await request(app).post('/api/sellers/products').send({
        name: 'ABC Store 2',
        description: 'Toko ABC Store 2',
        price: 10000,
        stock: 10,
      });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return unauthorized error with wrong token', async () => {
      const response = await request(app)
        .post('/api/sellers/products')
        .send({
          name: 'ABC Store 2',
          description: 'Toko ABC Store 2',
          price: 10000,
          stock: 10,
        })
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('GET /api/sellers/products', () => {
    it('should get all products successfully', async () => {
      const response = await request(app)
        .get('/api/sellers/products')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return unauthorized error with undefined token', async () => {
      const response = await request(app).get('/api/sellers/products');

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return unauthorized error with wrong token', async () => {
      const response = await request(app)
        .get('/api/sellers/products')
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('GET /api/products', () => {
    it('should get all products successfully', async () => {
      const response = await request(app).get('/api/products');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a product successfully', async () => {
      const productId = await ProductModel.findOne({
        name: 'ABC Store 2',
      }).select('_id');

      const response = await request(app)
        .get(`/api/products/${productId!._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return not found error with invalid id', async () => {
      const response = await request(app)
        .get('/api/products/invalidid')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Produk tidak ditemukan');
    });
  });

  describe('GET /api/search/products', () => {
    it('should search products successfully', async () => {
      const response = await request(app)
        .get('/api/search/products')
        .query({ keyword: 'ABC' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return not found error with invalid keyword', async () => {
      const response = await request(app)
        .get('/api/search/products')
        .query({ keyword: 'invalidkeyword' });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Produk tidak ditemukan');
    });
  });

  // get products by seller
  describe('GET /api/sellers/:sellerId/products', () => {
    it('should get products by seller successfully', async () => {
      const seller = await SellerModel.findOne({ name: 'ABC Store' }).select(
        '_id'
      );
      const response = await request(app).get(
        `/api/sellers/${seller!._id}/products`
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.products.length).toBe(1);
    });

    it('should return not found error with invalid seller id', async () => {
      const response = await request(app).get(
        '/api/sellers/invalidid/products'
      );

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Seller tidak ditemukan');
    });
  });

  describe('PATCH /api/sellers/products/:id', () => {
    it('should update a product successfully without image ', async () => {
      const productId = await ProductModel.findOne({
        name: 'ABC Store 2',
      }).select('_id');

      const response = await request(app)
        .patch(`/api/sellers/products/${productId!._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'ABC Store 3',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('ABC Store 3');
      expect(response.body.data.image_url).toBeDefined();
    });

    it('should update a product successfully with image ', async () => {
      const productId = await ProductModel.findOne({
        name: 'ABC Store 3',
      }).select('_id');

      const response = await request(app)
        .patch(`/api/sellers/products/${productId!._id}`)
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'ABC Store 3')
        .attach('image', Buffer.from('mock file content'), 'mock-image.jpg');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('ABC Store 3');
      expect(response.body.data.image_url).toBeDefined();
    });

    it('should return not found error with invalid id', async () => {
      const response = await request(app)
        .patch('/api/sellers/products/invalidid')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'ABC Store 3',
          description: 'Toko ABC Store 3',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Produk tidak ditemukan');
    });

    it('should return unauthorized error with undefined token', async () => {
      const productId = await ProductModel.findOne({
        name: 'ABC Store 3',
      }).select('_id');

      const response = await request(app)
        .patch(`/api/sellers/products/${productId!._id}`)
        .send({
          name: 'ABC Store 3',
          description: 'Toko ABC Store 3',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return unauthorized error with wrong token', async () => {
      const productId = await ProductModel.findOne({
        name: 'ABC Store 3',
      }).select('_id');

      const response = await request(app)
        .patch(`/api/sellers/products/${productId!._id}`)
        .set('Authorization', `Bearer wrongtoken`)
        .send({
          name: 'ABC Store 3',
          description: 'Toko ABC Store 3',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/sellers/products/:id', () => {
    it('should delete a product successfully', async () => {
      const productId = await ProductModel.findOne({
        name: 'ABC Store 3',
      }).select('_id');

      const response = await request(app)
        .delete(`/api/sellers/products/${productId!._id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Produk berhasil dihapus');
    });

    it('should return not found error with invalid id', async () => {
      const response = await request(app)
        .delete('/api/sellers/products/invalidid')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Produk tidak ditemukan');
    });

    it('should return unauthorized error with undefined token', async () => {
      const response = await request(app).delete(
        `/api/sellers/products/dummyid`
      );

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return unauthorized error with wrong token', async () => {
      const response = await request(app)
        .delete(`/api/sellers/products/dummyid`)
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });
});
