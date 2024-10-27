import { ProductService } from './../services/productService';
import { NextFunction, Request, Response } from 'express';
import {
  CreateProductRequest,
  ProductResponse,
  UpdateProductRequest,
} from '../types/productType';

export class ProductController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const request: CreateProductRequest = req.body;
      const image = req.file;

      const result: ProductResponse = await ProductService.create(
        user,
        request,
        image
      );

      res.status(201).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result: ProductResponse[] = await ProductService.list(user);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const request: UpdateProductRequest = req.body;
      request.id = req.params.productId;
      const image = req.file;

      const result: ProductResponse = await ProductService.update(
        user,
        request,
        image
      );

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
