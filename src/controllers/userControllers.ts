import { NextFunction, Request, Response } from 'express';

import { CreateUserRequest, LoginUserRequest } from '../types/userType';
import { UserService } from '../services/userService';

export class UserController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      // Konversi latitude dan longitude dari string ke number
      req.body.address.latitude = parseFloat(req.body.address.latitude);
      req.body.address.longitude = parseFloat(req.body.address.longitude);

      // Set profile_picture
      req.body.profile_picture = req.file?.path;

      const request: CreateUserRequest = req.body;
      const result = await UserService.register(request);

      res.status(200).json({
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
        result,
      });
    } catch (error) {
      next(error);
    }
  }
}
