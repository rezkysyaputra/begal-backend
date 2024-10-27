import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { UserController } from '../controllers/userControllers';
import { SellerController } from '../controllers/sellerController';
import { ProductController } from '../controllers/productController';
import upload from '../middlewares/uploadMiddleware';

const privateRoute: Router = Router();

privateRoute.use(authMiddleware);
// USER
privateRoute.get('/api/users/profile', UserController.get);
privateRoute.patch(
  '/api/users/profile',
  upload.single('image'),
  UserController.update
);
privateRoute.patch('/api/users/change-password', UserController.changePassword);

// SELLER
privateRoute.get('/api/sellers/profile', SellerController.get);
privateRoute.patch(
  '/api/sellers/profile',
  upload.single('image'),
  SellerController.update
);
privateRoute.patch(
  '/api/sellers/change-password',
  SellerController.changePassword
);

// PRODUCT
privateRoute.post(
  '/api/sellers/products',
  upload.single('image'),
  ProductController.create
);
privateRoute.get('/api/sellers/products', ProductController.list);
privateRoute.patch(
  '/api/sellers/products/:productId',
  upload.single('image'),
  ProductController.update
);

export default privateRoute;
