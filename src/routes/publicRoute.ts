import { Router } from 'express';
import { UserController } from '../controllers/userControllers';
import upload from '../middlewares/uploadMiddleware';
import { SellerController } from '../controllers/sellerController';

const publicRoute: Router = Router();

// USERS
publicRoute.post(
  '/api/v1/user/register',
  upload.single('image'),
  UserController.register
);
publicRoute.post('/api/v1/user/login', UserController.login);

// SELLERS
publicRoute.post(
  '/api/v1/seller/register',
  upload.single('image'),
  SellerController.register
);
publicRoute.post('/api/v1/seller/login', SellerController.login);

export default publicRoute;
