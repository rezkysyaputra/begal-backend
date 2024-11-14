// src/swagger.ts
import { Options } from 'swagger-jsdoc';
import { UserModel } from '../models/userModel';
import { SellerModel } from '../models/sellerModel';
import { ProductModel } from '../models/productModel';
import { OrderModel } from '../models/orderModel';
import { ReviewModel } from '../models/reviewModel';
import { NotificationModel } from '../models/notificationModel';

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Beli Galon API Documentation',
      version: '1.0.0',
      description: 'API Documentation for the Beli Galon Application',
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === 'production'
            ? 'https://beligalon.vercel.app'
            : 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemes: {
        User: UserModel,
        Seller: SellerModel,
        Product: ProductModel,
        Order: OrderModel,
        Review: ReviewModel,
        Notification: NotificationModel,
      },
    },
  },
  apis: ['src/routes/*.ts', 'src/controllers/*.ts'],
};

export default swaggerOptions;
