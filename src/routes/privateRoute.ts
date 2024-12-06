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
import { ReviewController } from '../controllers/reviewController';
import { WishListController } from '../controllers/wishListController';

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
  SellerController.getNearbySellers
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
  '/sellers/orders/:orderId',
  roleAuthorization(['seller']),
  OrderController.updateOrderStatusSeller
);
privateRoute.patch(
  '/users/orders/:orderId',
  roleAuthorization(['user']),
  OrderController.updateOrderStatusUser
);
privateRoute.patch(
  '/orders/:orderId/payment-status',
  roleAuthorization(['seller']),
  OrderController.updatePaymentStatus
);

// REVIEW
privateRoute.post(
  '/users/reviews',
  roleAuthorization(['user']),
  ReviewController.create
);
privateRoute.get(
  '/sellers/reviews',
  roleAuthorization(['seller']),
  ReviewController.getAllReviews
);
privateRoute.patch(
  '/users/reviews/:reviewId',
  roleAuthorization(['user']),
  ReviewController.update
);
privateRoute.delete(
  '/users/reviews/:reviewId',
  roleAuthorization(['user']),
  ReviewController.delete
);

// WISHLIST
privateRoute.post(
  '/users/wishlist',
  roleAuthorization(['user']),
  WishListController.create
);
privateRoute.get(
  '/users/wishlist',
  roleAuthorization(['user']),
  WishListController.getAll
);
privateRoute.delete(
  '/users/wishlist/:wishlistId',
  roleAuthorization(['user']),
  WishListController.delete
);

export default privateRoute;
