import { NextFunction, Request, Response } from 'express';
import { CreateUserRequest, LoginUserRequest } from '../types/userType';
import { UserService } from '../services/userService';
import { GetSellerResponse } from '../types/sellerType';
import { ProductResponse } from '../types/productType';

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const image = req.file;
      const request: CreateUserRequest = req.body;
      const result = await UserService.register(request, image);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginUserRequest = req.body;
      const result = await UserService.login(request);

      res.status(200).json({
        success: true,
        token: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await UserService.get(user);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const request = req.body;
      const image = req.file;

      const result = await UserService.update(user, request, image);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const request = req.body;

      const result = await UserService.changePassword(user, request);

      res.status(200).json({
        success: true,
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNearbySellers(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = (req as any).user;
      const result: GetSellerResponse[] = await UserService.getNearbySellers(
        user
      );

      res.status(200).json({
        status: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProductsBySeller(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { sellerId } = req.params;
      const result = await UserService.getProductsBySeller(sellerId);

      res.status(200).json({
        status: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const { keyword = '' } = req.query;

      const result: ProductResponse[] = await UserService.searchProducts(
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
}