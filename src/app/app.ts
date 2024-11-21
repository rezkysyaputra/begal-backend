import express from 'express';
import cors from 'cors';
import publicRoute from '../routes/publicRoute';
import privateRoute from '../routes/privateRoute';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import connectDB from './database';
import { errorLogger, requestLogger } from '../middlewares/loggerMiddleware';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerOptions from '../config/swagger';
import path from 'path';

const app: express.Application = express();

app.use(express.json());
app.use(requestLogger);

app.use(cors());
// connect to database
connectDB();

// Swagger Docs
const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve);
app.get(
  '/api-docs',
  swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Beli Galon API Docs',
  })
);

if (process.env.NODE_ENV === 'production') {
  app.use(
    '/swagger-ui',
    express.static(path.join(__dirname, '../node_modules/swagger-ui-dist'))
  );
}

// Routes
app.use('/api', publicRoute);
app.get('/', (_req, res) => {
  res.send('BELI GALON API');
});
app.use('/api', privateRoute);

// error Middleware
app.use(errorLogger);
app.use(errorMiddleware);

export default app;
