import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export const setupMongoMemoryServer = async () => {
  const mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
  return mongoServer;
};

export const teardownMongoMemoryServer = async (
  mongoServer: MongoMemoryServer
) => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
  await mongoServer.stop();
};
