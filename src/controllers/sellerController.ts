import { NextFunction, Request, Response } from 'express';
import { SellerService } from '../services/sellerService';
import { CreateSellerRequest, LoginSellerRequest } from '../types/sellerType';

export class SellerController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const image = req.file;
      const request: CreateSellerRequest = req.body;
      const result = await SellerService.register(request, image);

      res.status(201).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const request: LoginSellerRequest = req.body;
      const result = await SellerService.login(request);

      res.status(200).json({
        token: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user;
      const result = await SellerService.get(user);

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
      const request = req.body;

      const result = await SellerService.update(user, request);

      res.status(200).json({
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

      const result = await SellerService.changePassword(user, request);

      res.status(200).json({
        message: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
