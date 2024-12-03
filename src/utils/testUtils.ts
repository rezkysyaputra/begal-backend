import bcrypt from 'bcrypt';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

let mongoServer: MongoMemoryServer | null;
export const ConnectMongoServer = async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
};

export const DropMongoServer = async () => {
  if (mongoServer) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();
  }
};

export const DropCollections = async () => {
  if (mongoServer) {
    const collections = await mongoose.connection.db?.collections();
    for (let collection of collections!) {
      await collection.remove();
    }
  }
};
