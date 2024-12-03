import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

describe('ORDER ENDPOINT', () => {
  let token: string;

  beforeAll(async () => {
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    await mongoose.connection.close();
  });
});
