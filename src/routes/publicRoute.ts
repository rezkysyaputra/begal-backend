import { Router } from 'express';
import { UserController } from '../controllers/userControllers';
import upload from '../middlewares/uploadMiddleware';
import { SellerController } from '../controllers/sellerController';

const publicRoute: Router = Router();

// USERS
publicRoute.post(
  '/api/users/register',
  upload.single('image'),
  UserController.register
);
publicRoute.post('/api/users/login', UserController.login);

// SELLERS
publicRoute.post(
  '/api/sellers/register',
  upload.single('image'),
  SellerController.register
);
publicRoute.post('/api/sellers/login', SellerController.login);

export default publicRoute;
