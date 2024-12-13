import { Options } from "swagger-jsdoc";
import { UserModel } from "../models/userModel";
import { SellerModel } from "../models/sellerModel";
import { ProductModel } from "../models/productModel";
import { OrderModel } from "../models/orderModel";
import { ReviewModel } from "../models/reviewModel";

const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Beli Galon API Documentation",
      version: "1.0.0",
      description: "API Documentation for the Beli Galon Application",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://api-beli-galon.vercel.app"
            : "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Token untuk autentikasi user dan seller, dapat digunakan pada endpoint yang membutuhkan autentikasi user atau seller",
        },
        userAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token untuk autentikasi user",
        },
        sellerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token untuk autentikasi seller",
        },
      },
      schemas: {
        User: UserModel,
        Seller: SellerModel,
        Product: ProductModel,
        Order: OrderModel,
        Review: ReviewModel,
      },
    },
  },
  apis: ["src/routes/*.ts", "src/controllers/*.ts", "src/models/*.ts"],
};

export default swaggerOptions;
