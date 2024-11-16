import express from 'express';
import cors from 'cors';
import publicRoute from '../routes/publicRoute';
import privateRoute from '../routes/privateRoute';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import connectDB from './database';
import { errorLogger, requestLogger } from '../middlewares/loggerMiddleware';
import swaggerUi from 'swagger-ui-express';
import swaggerOptions from '../config/swagger';
import swaggerJSDoc from 'swagger-jsdoc';

const app: express.Application = express();

app.use(express.json());
app.use(requestLogger);

app.use(cors());
// connect to database
connectDB();

// Swagger docs
const CSS_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.18.2/swagger-ui-bundle.js';

// Swagger setup
const swaggerSpec = swaggerJSDoc(swaggerOptions);

app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customCss:
      '.swagger-ui .opblock .opblock-summary-path-description-wrapper { align-items: center; display: flex; flex-wrap: wrap; gap: 0 10px; padding: 0 10px; width: 100%; }',
    customCssUrl: CSS_URL,
  })
);

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
