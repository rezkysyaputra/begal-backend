import { MongoMemoryServer } from 'mongodb-memory-server';
import createServer from '../app/server';
import request from 'supertest';
import { SellerModel } from '../models/sellerModel';
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

const userData = {
  name: 'Jane Doe',
  email: 'janedoe@gmail.com',
  password: 'securepassword',
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
};

let token: string;
let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await setupMongoMemoryServer();
});

afterAll(async () => {
  await teardownMongoMemoryServer(mongoServer);
});

describe('POST /api/users/register', () => {
  it('should create a new user with image successfully', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .field('name', 'Jane Doe 2')
      .field('email', 'janedoe2@gmail.com')
      .field('password', userData.password)
      .field('phone', userData.phone)
      .field('role', userData.role)
      .field('address[province]', userData.address.province)
      .field('address[regency]', userData.address.regency)
      .field('address[district]', userData.address.district)
      .field('address[village]', userData.address.village)
      .field('address[street]', userData.address.street)
      .field('address[detail]', userData.address.detail)
      .attach('image', Buffer.from('mock file content'), 'mock-image.jpg');

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('should create a new user without image successfully', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('should return a validation error with empty payload', async () => {
    const response = await request(app).post('/api/users/register').send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a user already exists error', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send(userData);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a email already exists error', async () => {
    const response = await request(app)
      .post('/api/users/register')
      .send({ ...userData, name: 'bejo' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });
});

describe('POST /api/users/login', () => {
  it('should login a user successfully', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({ email: userData.email, password: userData.password });

    token = response.body.token;
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();
  });

  it('should return a email invalid error', async () => {
    const response = await request(app).post('/api/users/login').send({
      email: 'wrongemail@gmail.com',
      password: userData.password,
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });
  it('should return a password invalid error', async () => {
    const response = await request(app).post('/api/users/login').send({
      email: userData.email,
      password: 'wrongpassword',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });
});

describe('GET /api/users/profile', () => {
  it('should get user profile', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('should return a unauthorized error with wrong token', async () => {
    const response = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer wrongtoken`);

    expect(response.status).toBe(401);
    expect(response.body.errors).toBe('Unauthorized');
  });

  it('should return a unauthorized error with undefined token', async () => {
    const response = await request(app).get('/api/users/profile');

    expect(response.status).toBe(401);
    expect(response.body.errors).toBe('Unauthorized');
  });
});

describe('PATCH /api/users/profile', () => {
  it('should update user profile with image successfully', async () => {
    const response = await request(app)
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'John Doe Updated')
      .field('address[detail]', 'Ruko No. 1')
      .attach('image', Buffer.from('mock file content'), 'mock-image.jpg');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('John Doe Updated');
    expect(response.body.data.profile_picture_url).toBeDefined();
    expect(response.body.data.address.detail).toBe('Ruko No. 1');
    expect(response.body.data.address.province).toBeDefined();
    expect(response.body.data.address.regency).toBeDefined();
    expect(response.body.data.address.district).toBeDefined();
    expect(response.body.data.address.village).toBeDefined();
    expect(response.body.data.address.street).toBeDefined();
    expect(response.body.data.address.detail).toBeDefined();
  });

  it('should update user profile without image successfully', async () => {
    const response = await request(app)
      .patch('/api/users/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'John Doe',
        address: {
          detail: 'Ruko No. 2',
        },
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.name).toBe('John Doe');
    expect(response.body.data.address.detail).toBe('Ruko No. 2');
    expect(response.body.data.address.province).toBeDefined();
    expect(response.body.data.address.regency).toBeDefined();
    expect(response.body.data.address.district).toBeDefined();
    expect(response.body.data.address.village).toBeDefined();
    expect(response.body.data.address.street).toBeDefined();
    expect(response.body.data.address.detail).toBeDefined();
  });

  it('should return a unauthorized error with wrong token', async () => {
    const response = await request(app)
      .patch('/api/users/profile')
      .set('Authorization', `Bearer wrongtoken`)
      .send({ name: 'John Doe' });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBe('Unauthorized');
  });

  it('should return a unauthorized error with undefined token', async () => {
    const response = await request(app)
      .patch('/api/users/profile')
      .send({ name: 'John Doe' });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBe('Unauthorized');
  });
});

describe('PATCH /api/users/change-password', () => {
  it('should change user password successfully', async () => {
    const response = await request(app)
      .patch('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ old_password: userData.password, new_password: 'newpassword' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBeDefined();
  });

  it('should return a validation error with wrong password', async () => {
    const response = await request(app)
      .patch('/api/users/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ old_password: 'wrongpassword', new_password: 'newpassword' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.errors).toBeDefined();
  });

  it('should return a unauthorized error with undefined token', async () => {
    const response = await request(app)
      .patch('/api/users/change-password')
      .send({ old_password: userData.password, new_password: 'newpassword' });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBe('Unauthorized');
  });

  it('should return a unauthorized error with wrong token', async () => {
    const response = await request(app)
      .patch('/api/users/change-password')
      .set('Authorization', `Bearer wrongtoken`)
      .send({ old_password: userData.password, new_password: 'newpassword' });

    expect(response.status).toBe(401);
    expect(response.body.errors).toBe('Unauthorized');
  });
});

describe('GET /api/sellers/nearby', () => {
  SellerModel.create({
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
      detail: 'Ruko No. 1',
    },
    operational_hours: {
      open: '08:00',
      close: '20:00',
    },
  });
  it('should get nearby seller successfully ', async () => {
    const response = await request(app)
      .get('/api/sellers/nearby')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
  });

  it('should return a unauthorized error with undefined token', async () => {
    const response = await request(app).get('/api/sellers/nearby');

    expect(response.status).toBe(401);
    expect(response.body.errors).toBe('Unauthorized');
  });

  it('should return a unauthorized error with wrong token', async () => {
    const response = await request(app)
      .get('/api/sellers/nearby')
      .set('Authorization', `Bearer wrongtoken`);

    expect(response.status).toBe(401);
    expect(response.body.errors).toBe('Unauthorized');
  });
});
