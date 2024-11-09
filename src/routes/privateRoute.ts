import { Router } from 'express';
import {
  authMiddleware,
  roleAuthorization,
} from '../middlewares/authMiddleware';
import { UserController } from '../controllers/userController';
import { SellerController } from '../controllers/sellerController';
import { ProductController } from '../controllers/productController';
import upload from '../middlewares/uploadMiddleware';
import { OrderController } from '../controllers/orderController';

const privateRoute: Router = Router();
privateRoute.use(authMiddleware);

// USER
privateRoute.get(
  '/users/profile',
  roleAuthorization(['user']),
  UserController.get
);
privateRoute.patch(
  '/users/profile',
  roleAuthorization(['user']),
  upload.single('image'),
  UserController.update
);
privateRoute.patch(
  '/users/change-password',
  roleAuthorization(['user']),
  UserController.changePassword
);
privateRoute.get(
  '/sellers/nearby',
  roleAuthorization(['user']),
  UserController.getNearbySellers
);
privateRoute.get(
  '/products/seller/:sellerId',
  roleAuthorization(['user']),
  UserController.getProductsBySeller
);
privateRoute.get(
  '/products/search/',
  roleAuthorization(['user']),
  UserController.searchProducts
);

// SELLER
privateRoute.get(
  '/sellers/profile',
  roleAuthorization(['seller']),
  SellerController.get
);
privateRoute.patch(
  '/sellers/profile',
  roleAuthorization(['seller']),
  upload.single('image'),
  SellerController.update
);
privateRoute.patch(
  '/sellers/change-password',
  roleAuthorization(['seller']),
  SellerController.changePassword
);

// PRODUCT
privateRoute.post(
  '/sellers/products',
  roleAuthorization(['seller']),
  upload.single('image'),
  ProductController.create
);
privateRoute.get(
  '/sellers/products',
  roleAuthorization(['seller']),
  ProductController.list
);
privateRoute.get(
  '/products/:productId',
  roleAuthorization(['seller', 'user']),
  ProductController.get
);
privateRoute.patch(
  '/sellers/products/:productId',
  roleAuthorization(['seller']),
  upload.single('image'),
  ProductController.update
);
privateRoute.delete(
  '/sellers/products/:productId',
  roleAuthorization(['seller']),
  ProductController.delete
);

// ORDER
privateRoute.post(
  '/orders',
  roleAuthorization(['user']),
  OrderController.createOrder
);
privateRoute.get(
  '/orders',
  roleAuthorization(['user', 'seller']),
  OrderController.list
);
privateRoute.get(
  '/orders/:orderId',
  roleAuthorization(['user', 'seller']),
  OrderController.get
);
privateRoute.patch(
  '/orders/:orderId',
  roleAuthorization(['seller']),
  OrderController.update
);

// NOT FOUND
privateRoute.all('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
  });
});

export default privateRoute;
