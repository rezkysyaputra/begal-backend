import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import createServer from '../app/server';
import request from 'supertest';
import {
  setupMongoMemoryServer,
  teardownMongoMemoryServer,
} from '../test/mongoMemoryServer';

const app = createServer();

// Mock cloudinary upload
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

const sellerData = {
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
};

describe('SELLER ENDPOINT', () => {
  let token: string;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await setupMongoMemoryServer();
  });

  afterAll(async () => {
    await teardownMongoMemoryServer(mongoServer);
  });

  describe('POST /api/sellers/register', () => {
    it('should register a new seller with image successfully', async () => {
      const response = await request(app)
        .post('/api/sellers/register')
        .field('name', 'ABC store 2')
        .field('owner_name', sellerData.owner_name)
        .field('email', 'abcstore2@gmail.com')
        .field('password', sellerData.password)
        .field('phone', sellerData.phone)
        .field('role', sellerData.role)
        .field('address[province]', sellerData.address.province)
        .field('address[regency]', sellerData.address.regency)
        .field('address[district]', sellerData.address.district)
        .field('address[village]', sellerData.address.village)
        .field('address[street]', sellerData.address.street)
        .field('address[detail]', sellerData.address.detail)
        .field('operational_hours[open]', sellerData.operational_hours.open)
        .field('operational_hours[close]', sellerData.operational_hours.close)
        .attach('image', Buffer.from('mock file content'), 'mock-image.jpg');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should register a new seller without image successfully', async () => {
      const response = await request(app)
        .post('/api/sellers/register')
        .send(sellerData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return validation error with empty payload', async () => {
      const response = await request(app)
        .post('/api/sellers/register')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('POST /api/sellers/login', () => {
    it('should login a seller successfully', async () => {
      const response = await request(app)
        .post('/api/sellers/login')
        .send({ email: sellerData.email, password: sellerData.password });

      token = response.body.token;
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    it('should return email or password invalid error', async () => {
      const response = await request(app)
        .post('/api/sellers/login')
        .send({ email: 'wrongemail@gmail.com', password: 'wrongpassword' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/sellers/profile', () => {
    it('should retrieve seller profile successfully', async () => {
      const response = await request(app)
        .get('/api/sellers/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });

    it('should return unauthorized error with invalid token', async () => {
      const response = await request(app)
        .get('/api/sellers/profile')
        .set('Authorization', `Bearer wrongtoken`);

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return unauthorized error with undefined token', async () => {
      const response = await request(app).get('/api/sellers/profile');

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('PATCH /api/sellers/profile', () => {
    it('should update seller profile with image successfully', async () => {
      const response = await request(app)
        .patch('/api/sellers/profile')
        .set('Authorization', `Bearer ${token}`)
        .field('name', 'Updated ABC Store')
        .field('address[detail]', 'Updated Toko No. 1')
        .field('operational_hours[close]', '22:00')
        .attach('image', Buffer.from('mock file content'), 'mock-image.jpg');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated ABC Store');
      expect(response.body.data.address.detail).toBe('Updated Toko No. 1');
      expect(response.body.data.address.province).toBeDefined();
      expect(response.body.data.address.regency).toBeDefined();
      expect(response.body.data.address.district).toBeDefined();
      expect(response.body.data.address.village).toBeDefined();
      expect(response.body.data.address.street).toBeDefined();
      expect(response.body.data.address.detail).toBeDefined();
      expect(response.body.data.operational_hours.close).toBe('22:00');
      expect(response.body.data.operational_hours.open).toBeDefined();
      expect(response.body.data.profile_picture_url).toBeDefined();
    });

    it('should update seller profile without image successfully', async () => {
      const response = await request(app)
        .patch('/api/sellers/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated ABC Store',
          address: { detail: 'Updated Toko No. 1' },
          operational_hours: { close: '22:00' },
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated ABC Store');
      expect(response.body.data.address.detail).toBe('Updated Toko No. 1');
      expect(response.body.data.address.province).toBeDefined();
      expect(response.body.data.address.regency).toBeDefined();
      expect(response.body.data.address.district).toBeDefined();
      expect(response.body.data.address.village).toBeDefined();
      expect(response.body.data.address.street).toBeDefined();
      expect(response.body.data.address.detail).toBeDefined();
      expect(response.body.data.operational_hours.close).toBe('22:00');
      expect(response.body.data.operational_hours.open).toBeDefined();
    });

    it('should return unauthorized error with wrong token', async () => {
      const response = await request(app)
        .patch('/api/sellers/profile')
        .set('Authorization', `Bearer wrongtoken`)
        .send({ name: 'Updated ABC Store' });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return unauthorized error with undefined token', async () => {
      const response = await request(app).patch('/api/sellers/profile');

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('PATCH /api/sellers/change-password', () => {
    it('should change seller password successfully', async () => {
      const response = await request(app)
        .patch('/api/sellers/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          old_password: sellerData.password,
          new_password: 'newpassword',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();
    });

    it('should return a validation error with wrong password', async () => {
      const response = await request(app)
        .patch('/api/sellers/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({ old_password: 'wrongpassword', new_password: 'newpassword' });

      expect(response.status).toBe(400);
      expect(response.body.errors).toBeDefined();
    });

    it('should return a unauthorized error with undefined token', async () => {
      const response = await request(app)
        .patch('/api/sellers/change-password')
        .send({
          old_password: sellerData.password,
          new_password: 'newpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });

    it('should return a unauthorized error with wrong token', async () => {
      const response = await request(app)
        .patch('/api/sellers/change-password')
        .set('Authorization', `Bearer wrongtoken`)
        .send({
          old_password: sellerData.password,
          new_password: 'newpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.errors).toBe('Unauthorized');
    });
  });

  describe('GET /api/sellers', () => {
    it('should get all sellers successfully ', async () => {
      const response = await request(app).get('/api/sellers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
    });
  });
});
