import { Router } from 'express';
import { UserController } from '../controllers/userController';
import upload from '../middlewares/uploadMiddleware';
import { SellerController } from '../controllers/sellerController';
import { MidtransCallbackController } from '../controllers/midtransCallbackController';
import { AuthController } from '../controllers/authController';
import { ProductController } from '../controllers/productController';
import { ReviewController } from '../controllers/reviewController';

const publicRoute: Router = Router();

// USERS
publicRoute.post(
  '/users/register',
  upload.single('image'),
  UserController.register
);
publicRoute.post('/users/login', UserController.login);

// SELLERS
publicRoute.post(
  '/sellers/register',
  upload.single('image'),
  SellerController.register
);
publicRoute.post('/sellers/login', SellerController.login);
publicRoute.get('/sellers', SellerController.getAll);

// PRODUCTS
publicRoute.get('/products', ProductController.getAllProducts);
publicRoute.get(
  '/sellers/:sellerId/products',
  ProductController.getProductsBySeller
);
publicRoute.get('/search/products', ProductController.searchProducts);
publicRoute.get('/products/:productId', ProductController.get);

// REVIEW
publicRoute.get(
  '/users/reviews/:sellerId',
  ReviewController.getReviewsBySellerId
);

// MIDTRANS
publicRoute.post(
  '/midtrans/callback',
  MidtransCallbackController.handleCallback
);

// AUTH
publicRoute.post(
  '/auth/request-reset-password',
  AuthController.requestPasswordReset
);
publicRoute.post('/auth/verify-reset-code', AuthController.verifyResetCode);
publicRoute.post('/auth/reset-password', AuthController.resetPassword);

export default publicRoute;
