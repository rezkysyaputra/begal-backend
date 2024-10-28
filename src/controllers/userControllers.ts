import { NextFunction, Request, Response } from 'express';
import {
  CreateUserRequest,
  LoginUserRequest,
  NearbySellersResponse,
} from '../types/userType';
import { UserService } from '../services/userService';

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const image = req.file;
      const request: CreateUserRequest = req.body;
      const result = await UserService.register(request, image);

      res.status(201).json({
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

      const result = await UserService.update(user, request);

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

      const result = await UserService.changePassword(user, request);

      res.status(200).json({
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
      const result: NearbySellersResponse[] =
        await UserService.getNearbySellers(user);

      res.status(200).json({
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
