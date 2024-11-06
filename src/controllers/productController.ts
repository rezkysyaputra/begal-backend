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
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const productId = req.params.productId;
      const result: string = await ProductService.delete(user, productId);

      res.status(200).json({
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
