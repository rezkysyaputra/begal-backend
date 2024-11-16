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
   *       - bearerAuth: []
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
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               stock:
   *                 type: number
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Product created successfully
   *       400:
   *         description: Bad request
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
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Products retrieved successfully
   *       400:
   *         description: Bad request
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
   *     summary: Get a product by ID only by user or seller
   *     tags: [Product]
   *     security:
   *       - bearerAuth: []
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
   * /api/sellers/products/{productId}:
   *   patch:
   *     summary: Update a product by ID only by seller
   *     tags: [Product]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *               description:
   *                 type: string
   *               price:
   *                 type: number
   *               stock:
   *                 type: number
   *               image:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Product updated successfully
   *       400:
   *         description: Bad request
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
   *       - bearerAuth: []
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
