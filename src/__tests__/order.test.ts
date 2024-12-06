import { MongoMemoryServer } from 'mongodb-memory-server';
import createServer from '../app/server';
import supertest from 'supertest';
import {
  setupMongoMemoryServer,
  teardownMongoMemoryServer,
} from '../test/mongoMemoryServer';
import { createProduct, createSeller, createUser } from '../test/testUtils';

describe('ORDER ENDPOINT', () => {
  let userToken: string;
  let sellerToken: string;
  let sellerId: string;
  let userId: string;
  let mongoServer: MongoMemoryServer;
  let productId: string;
  let orderId: string;
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

  describe('POST /api/order', () => {
    it('should create an order with payment method transfer', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          seller_id: sellerId,
          products: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
          payment_method: 'transfer',
        });

      console.log(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('order_id');
      expect(response.body.data).toHaveProperty('payment_method', 'transfer');

      orderId = response.body.data.order_id;
    });

    it('should create an order with payment method cash', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          seller_id: sellerId,
          products: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
          payment_method: 'cash',
        });

      console.log(response.body);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('order_id');
      expect(response.body.data).toHaveProperty('payment_method', 'cash');
    });

    it('should return validation error with wrong payload', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          seller_id: sellerId,
          products: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
          payment_method: 'wrong',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should return a validation error with wrong seller id', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          seller_id: 'wrong',
          products: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
          payment_method: 'transfer',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should return a validation error with wrong product id', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          seller_id: sellerId,
          products: [
            {
              product_id: 'wrong',
              quantity: 1,
            },
          ],
          payment_method: 'transfer',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBeDefined();
    });

    it('should return a validation error with stock not enough', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          seller_id: sellerId,
          products: [
            {
              product_id: productId,
              quantity: 100,
            },
          ],
          payment_method: 'transfer',
        });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .send({
          seller_id: sellerId,
          products: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
          payment_method: 'transfer',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await supertest(app)
        .post('/api/orders')
        .set('Authorization', `Bearer wrongtoken`)
        .send({
          seller_id: sellerId,
          products: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
          payment_method: 'transfer',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('GET /api/orders', () => {
    it('should get all orders successfully as user', async () => {
      const response = await supertest(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should get all orders successfully as sellers', async () => {
      const response = await supertest(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await supertest(app).get('/api/orders');

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await supertest(app)
        .get('/api/orders')
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('GET /api/orders/:orderId', () => {
    it('should get detail orders successfully as user', async () => {
      const response = await supertest(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should get all orders successfully as sellers', async () => {
      const response = await supertest(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${sellerToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await supertest(app).get('/api/orders');

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await supertest(app)
        .get('/api/orders')
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('PATCH /api/users/orders/:orderId', () => {
    it('should update status order successfully with status delivered as users', async () => {
      const response = await supertest(app)
        .patch(`/api/users/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'delivered',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('delivered');
    });

    it('should update status order successfully with status cancelled as users', async () => {
      const response = await supertest(app)
        .patch(`/api/users/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          status: 'cancelled',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.payment_status).toBe('failed');
    });

    it('should return a not found error with wrong id', async () => {
      const response = await supertest(app)
        .patch('/api/users/orders/wrong')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Order tidak ditemukan');
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await supertest(app).patch(
        `/api/users/orders/${orderId}`
      );

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await supertest(app)
        .patch(`/api/users/orders/${orderId}`)
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('PATCH /api/sellers/orders/:orderId', () => {
    it('should update status order successfully with status confirmed as seller', async () => {
      const response = await supertest(app)
        .patch(`/api/sellers/orders/${orderId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'confirmed',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.status).toBe('confirmed');
    });
    it('should update status order successfully with status shipped as seller', async () => {
      const response = await supertest(app)
        .patch(`/api/sellers/orders/${orderId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'shipped',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('shipped');
    });
    it('should update status order successfully with status cancelled as seller', async () => {
      const response = await supertest(app)
        .patch(`/api/sellers/orders/${orderId}`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'cancelled',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('cancelled');
      expect(response.body.data.payment_status).toBe('failed');
    });

    it('should return a not found error with wrong id', async () => {
      const response = await supertest(app)
        .patch('/api/sellers/orders/wrong')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'confirmed',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Order tidak ditemukan');
    });

    it('should return a not found error with wrong id', async () => {
      const response = await supertest(app)
        .patch('/api/sellers/orders/wrong')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'confirmed',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Order tidak ditemukan');
    });
  });

  describe('PATCH /api/orders/:orderId/payment-status', () => {
    it('should can update order status payment successfully with status success as seller', async () => {
      const response = await supertest(app)
        .patch(`/api/orders/${orderId}/payment-status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'success',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.payment_status).toBe('success');
    });
    it('should can update order status payment successfully with status failed as seller', async () => {
      const response = await supertest(app)
        .patch(`/api/orders/${orderId}/payment-status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'failed',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.payment_status).toBe('failed');
      expect(response.body.data.status).toBe('cancelled');
    });

    it('should return error validation  with status wrong as seller', async () => {
      const response = await supertest(app)
        .patch(`/api/orders/${orderId}/payment-status`)
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'wrong',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });

    it('should return a not found error with wrong id', async () => {
      const response = await supertest(app)
        .patch('/api/orders/wrong/payment-status')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'success',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Order tidak ditemukan');
    });

    it('should return a not found error with wrong id', async () => {
      const response = await supertest(app)
        .patch('/api/orders/wrong/payment-status')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          status: 'success',
        });

      expect(response.status).toBe(404);
      expect(response.body.errors).toBe('Order tidak ditemukan');
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await supertest(app)
        .patch(`/api/orders/${orderId}/payment-status`)
        .send({
          status: 'success',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await supertest(app)
        .patch(`/api/orders/${orderId}/payment-status`)
        .set('Authorization', `Bearer wrongtoken`)
        .send({
          status: 'success',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });
});
