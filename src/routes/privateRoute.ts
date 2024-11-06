import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { UserController } from '../controllers/userControllers';
import { SellerController } from '../controllers/sellerController';
import { ProductController } from '../controllers/productController';
import upload from '../middlewares/uploadMiddleware';

const privateRoute: Router = Router();
privateRoute.use(authMiddleware);

// USER
privateRoute.get('/users/profile', UserController.get);
privateRoute.patch(
  '/users/profile',
  upload.single('image'),
  UserController.update
);
privateRoute.patch('/users/change-password', UserController.changePassword);
privateRoute.get('/sellers/nearby', UserController.getNearbySellers);
privateRoute.get(
  '/products/seller/:sellerId',
  UserController.getProductsBySeller
);

// SELLER
privateRoute.get('/sellers/profile', SellerController.get);
privateRoute.patch(
  '/sellers/profile',
  upload.single('image'),
  SellerController.update
);
privateRoute.patch('/sellers/change-password', SellerController.changePassword);

// PRODUCT
privateRoute.post(
  '/sellers/products',
  upload.single('image'),
  ProductController.create
);
privateRoute.get('/sellers/products', ProductController.list);
privateRoute.patch(
  '/sellers/products/:productId',
  upload.single('image'),
  ProductController.update
);
privateRoute.delete('/sellers/products/:productId', ProductController.delete);

export default privateRoute;
