import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);

    logger.info('MongoDB Connected Successfully');
  } catch (err) {
    logger.error('Error connecting to MongoDB', err);
    process.exit(1);
  }
};

export default connectDB;
