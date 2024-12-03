import express, { Application } from 'express';
import cors from 'cors';
import publicRoute from '../routes/publicRoute';
import privateRoute from '../routes/privateRoute';
import { errorMiddleware } from '../middlewares/errorMiddleware';
import { errorLogger, requestLogger } from '../middlewares/loggerMiddleware';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerOptions from '../config/swagger';
import bodyParser from 'body-parser';

const createServer = (): Application => {
  const app: Application = express();

  app.use(express.json());
  app.use(requestLogger);

  app.use(cors());
  // Swagger docs
  const swaggerSpec = swaggerJsDoc(swaggerOptions);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use('/api', publicRoute);
  app.get('/', (_req, res) => {
    res.send('BELI GALON API');
  });
  app.use('/api', privateRoute);

  // error Middleware
  app.use(errorLogger);
  app.use(errorMiddleware);

  return app;
};

export default createServer;
