import { ProductService } from './../services/productService';
import { NextFunction, Request, Response } from 'express';
import {
  CreateProductRequest,
  ProductResponse,
  UpdateProductRequest,
} from '../types/productType';

/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management
 */
export class ProductController {
  /**
   * @swagger
   * /api/sellers/products:
   *   post:
   *     summary: Create a new product only by seller
   *     tags: [Product]
   *     security:
   *       - sellerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - description
   *               - price
   *               - stock
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Product 1"
   *               description:
   *                 type: string
   *                 example: "This is a product"
   *               price:
   *                 type: number
   *                 example: 10000
   *               stock:
   *                 type: number
   *                 example: 10
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Product created successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const image = req.file;
      const data = req.body;
      const product: CreateProductRequest = {
        ...data,
        price: Number(data.price),
        stock: Number(data.stock),
      };

      const result: ProductResponse = await ProductService.create(
        user,
        product,
        image
      );

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/sellers/products:
   *   get:
   *     summary: Get list products only by seller
   *     tags: [Product]
   *     security:
   *       - sellerAuth: []
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   */
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result: ProductResponse[] = await ProductService.list(user);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/products/{productId}:
   *   get:
   *     summary: Get a product by ID for user and seller
   *     tags: [Product]
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Product retrieved successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: Product not found
   */
  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const productId = req.params.productId;
      const result: ProductResponse = await ProductService.get(productId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/products:
   *   get:
   *     summary: Get all products for users
   *     tags: [Product]
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   *       400:
   *         description: Bad request
   */
  static async getAllProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const result: ProductResponse[] = await ProductService.getAllProducts();

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/sellers/{sellerId}/products:
   *   get:
   *     summary: Get products by seller for users
   *     tags: [Product]
   *     parameters:
   *       - in: path
   *         name: sellerId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   *       400:
   *         description: Bad request
   *       404:
   *         description: Seller not found
   */
  static async getProductsBySeller(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sellerId } = req.params;
      const result = await ProductService.getProductsBySeller(sellerId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/search/products:
   *   get:
   *     summary: Search products by keyword for users
   *     tags: [Product]
   *     parameters:
   *       - in: query
   *         name: keyword
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   *       400:
   *         description: Bad request
   */
  static async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyword = '' } = req.query;

      const result: ProductResponse[] = await ProductService.searchProducts(
        keyword as string
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/sellers/products/{productId}:
   *   patch:
   *     summary: Update a product by ID only by seller
   *     tags: [Product]
   *     security:
   *       - sellerAuth: []
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: false
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: Product 1
   *               description:
   *                 type: string
   *                 example: This is a product
   *               price:
   *                 type: number
   *                 example: 10000
   *               stock:
   *                 type: number
   *                 example: 10
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Product updated successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found
   */
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const image = req.file;
      const data = req.body;

      if (data.price) data.price = Number(data.price);
      if (data.stock) data.stock = Number(data.stock);

      const product: UpdateProductRequest = {
        ...data,
        id: req.params.productId,
      };

      const result: ProductResponse = await ProductService.update(
        user,
        product,
        image
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/sellers/products/{productId}:
   *   delete:
   *     summary: Delete a product by ID  only by seller
   *     tags: [Product]
   *     security:
   *       - sellerAuth: []
   *     parameters:
   *       - in: path
   *         name: productId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Product deleted successfully
   *       400:
   *         description: Bad request
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Product not found or seller not found
   */
  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const productId = req.params.productId;
      const result: string = await ProductService.delete(user, productId);

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
