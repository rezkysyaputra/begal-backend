import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { UserController } from '../controllers/userControllers';
import { SellerController } from '../controllers/sellerController';
import { ProductController } from '../controllers/productController';
import upload from '../middlewares/uploadMiddleware';

const privateRoute: Router = Router();

privateRoute.use(authMiddleware);
// USER
privateRoute.get('/api/v1/user/profile', UserController.get);
privateRoute.patch(
  '/api/v1/user/profile',
  upload.single('image'),
  UserController.update
);
privateRoute.patch(
  '/api/v1/user/change-password',
  UserController.changePassword
);

// SELLER
privateRoute.get('/api/v1/seller/profile', SellerController.get);
privateRoute.patch(
  '/api/v1/seller/profile',
  upload.single('image'),
  SellerController.update
);
privateRoute.patch(
  '/api/v1/seller/change-password',
  SellerController.changePassword
);

// PRODUCT
privateRoute.post(
  '/api/v1/seller/product',
  upload.single('image'),
  ProductController.create
);
privateRoute.get('/api/v1/seller/product', ProductController.list);

export default privateRoute;
