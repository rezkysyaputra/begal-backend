import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from '../utils/logger';

dotenv.config();
const connectDB = async (): Promise<void> => {
  try {
    const env = process.env.NODE_ENV?.toLowerCase() || 'production';
    const uri =
      env === 'development' ? process.env.MONGO_URI_DEV : process.env.MONGO_URI;
    await mongoose.connect(uri as string);

    logger.info('MongoDB Connected Successfully');
  } catch (err) {
    logger.error('Error connecting to MongoDB', err);
    process.exit(1);
  }
};

export default connectDB;
