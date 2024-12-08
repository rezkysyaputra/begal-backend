import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  setupMongoMemoryServer,
  teardownMongoMemoryServer,
} from '../test/mongoMemoryServer';
import supertest from 'supertest';
import { createProduct, createSeller, createUser } from '../test/testUtils';
import createServer from '../app/server';

describe('WISHLIST ENDPOINT', () => {
  let userToken: string;
  let sellerToken: string;
  let sellerId: string;
  let userId: string;
  let mongoServer: MongoMemoryServer;
  let productId: string;
  let wishListId: string;
  const app = createServer();

  beforeAll(async () => {
    mongoServer = await setupMongoMemoryServer();

    const user = await createUser();
    const seller = await createSeller();

    userId = user._id as string;
    sellerId = seller._id as string;

    const userLogin = await supertest(app)
      .post('/api/users/login')
      .send({ email: user.email, password: 'securepassword' });

    const sellerLogin = await supertest(app)
      .post('/api/sellers/login')
      .send({ email: seller.email, password: 'securepassword' });

    userToken = userLogin.body.token;
    sellerToken = sellerLogin.body.token;

    const product = await createProduct(sellerId);

    productId = product._id as string;
  });

  afterAll(async () => {
    await teardownMongoMemoryServer(mongoServer);
  });

  describe('POST /api/users/wishlist', () => {
    it('should user can add product to wishlist successfully', async () => {
      const response = await supertest(app)
        .post('/api/users/wishlist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ product_id: productId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      wishListId = response.body.data.id as string;
    });

    it('should return a not found error with wrong product id', async () => {
      const response = await supertest(app)
        .post('/api/users/wishlist')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ product_id: 'wrong' });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Produk tidak ditemukan');
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await supertest(app).post('/api/users/wishlist').send({
        product_id: productId,
      });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await supertest(app)
        .post('/api/users/wishlist')
        .set('Authorization', `Bearer wrongtoken`)
        .send({ product_id: productId });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('GET /api/users/wishlist', () => {
    it('should user can get all wishlist', async () => {
      const response = await supertest(app)
        .get('/api/users/wishlist')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await supertest(app).get('/api/users/wishlist');

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await supertest(app)
        .get('/api/users/wishlist')
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('DELETE /api/users/wishlist/:wishListId', () => {
    it('should user can delete wishlist', async () => {
      const response = await supertest(app)
        .delete(`/api/users/wishlist/${wishListId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    it('should return a not found error with wrong wishlist id', async () => {
      const response = await supertest(app)
        .delete('/api/users/wishlist/wrong')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Wishlist tidak ditemukan');
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await supertest(app).delete(
        `/api/users/wishlist/${wishListId}`
      );

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await supertest(app)
        .delete(`/api/users/wishlist/${wishListId}`)
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });
});
