import express from 'express';
import cors from 'cors';
import publicRoute from '../routes/publicRoute';
import privateRoute from '../routes/privateRoute';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import connectDB from './database';
import path from 'path';

// Inisialisasi express
const app = express();

app.use(express.json());
connectDB();
app.use(cors());

app.use(publicRoute);
app.use(privateRoute);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(errorMiddleware);

export default app;
