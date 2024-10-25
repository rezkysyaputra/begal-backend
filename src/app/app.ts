import express from 'express';
import cors from 'cors';
import publicRoute from '../routes/publicRoute';
import privateRoute from '../routes/privateRoute';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import connectDB from './database';
import path from 'path';
import morgan from 'morgan';

// Inisialisasi express
const app: express.Application = express();

app.use(express.json());
connectDB();
app.use(cors());
app.use(morgan('combined'));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(publicRoute);
app.use(privateRoute);

app.use(errorMiddleware);

export default app;
