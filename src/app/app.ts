import express from 'express';
import cors from 'cors';
import publicRoute from '../routes/publicRoute';
import privateRoute from '../routes/privateRoute';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import connectDB from './database';
import path from 'path';
import { errorLogger, requestLogger } from '../middlewares/loggerMiddleware';
// import swaggerUi from 'swagger-ui-express';
// import swaggerJsDoc from 'swagger-jsdoc';
// import swaggerOptions from '../swagger';

// Inisialisasi express
const app: express.Application = express();

app.use(express.json());
app.use(requestLogger);
// connect to database
connectDB();

app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Swagger docs
// const swaggerSpec = swaggerJsDoc(swaggerOptions);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));j

// Routes
app.use('/api', publicRoute);
app.use('/api', privateRoute);

// error Middleware
app.use(errorLogger);
app.use(errorMiddleware);

export default app;
