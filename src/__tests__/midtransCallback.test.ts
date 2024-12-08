import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  setupMongoMemoryServer,
  teardownMongoMemoryServer,
} from '../test/mongoMemoryServer';
import createServer from '../app/server';
import { createOrder, createProduct, createSeller } from '../test/testUtils';
import supertest from 'supertest';
import { OrderModel } from '../models/orderModel';
import { ProductModel } from '../models/productModel';

describe('Midtrans Callback Endpoint', () => {
  let mongoServer: MongoMemoryServer;
  const app = createServer();
  let order: any;
  let product: any;
  let sellerId: string;

  beforeAll(async () => {
    mongoServer = await setupMongoMemoryServer();

    const seller = await createSeller();
    sellerId = seller._id as string;
    product = await createProduct(sellerId);
    order = await createOrder(product);
  });

  afterAll(async () => {
    await teardownMongoMemoryServer(mongoServer);
  });

  it('should handle successful payment status', async () => {
    const response = await supertest(app).post('/api/midtrans/callback').send({
      order_id: order._id,
      transaction_status: 'capture',
      transaction_id: 'trx123',
      expiry_time: '2024-12-31T23:59:59Z',
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Payment status updated successfully');

    const updatedOrder = await OrderModel.findById(order._id);
    expect(updatedOrder?.payment_status).toBe('success');
    expect(updatedOrder?.transaction_id).toBe('trx123');
    expect(updatedOrder?.payment_expiry).toBeInstanceOf(Date);
  });

  it('should handle pending payment status', async () => {
    const response = await supertest(app).post('/api/midtrans/callback').send({
      order_id: order._id,
      transaction_status: 'pending',
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Payment status updated successfully');

    const updatedOrder = await OrderModel.findById(order._id);
    expect(updatedOrder?.payment_status).toBe('pending');
  });

  it('should handle failed payment status and return product stock', async () => {
    const response = await supertest(app).post('/api/midtrans/callback').send({
      order_id: order._id,
      transaction_status: 'deny',
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Payment status updated successfully');

    const updatedOrder = await OrderModel.findById(order._id);
    expect(updatedOrder?.payment_status).toBe('failed');
    expect(updatedOrder?.status).toBe('cancelled');

    const updatedProduct = await ProductModel.findById(product._id);
    expect(updatedProduct?.stock).toBe(20);
  });
});
