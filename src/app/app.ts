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

// Swagger docs
const swaggerSpec = swaggerJsDoc(swaggerOptions);
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Pastikan file static Swagger UI dapat diakses
app.use(
  '/api-docs/swagger-ui.css',
  express.static(
    path.join(__dirname, 'node_modules/swagger-ui-dist/swagger-ui.css')
  )
);

app.use(
  '/api-docs/swagger-ui-bundle.js',
  express.static(
    path.join(__dirname, 'node_modules/swagger-ui-dist/swagger-ui-bundle.js')
  )
);

app.use(
  '/api-docs/swagger-ui-standalone-preset.js',
  express.static(
    path.join(
      __dirname,
      'node_modules/swagger-ui-dist/swagger-ui-standalone-preset.js'
    )
  )
);

// Setup Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCssUrl: '/api-docs/swagger-ui.css',
    customJs: '/api-docs/swagger-ui-bundle.js',
  })
);

// Middleware untuk security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  next();
});

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
