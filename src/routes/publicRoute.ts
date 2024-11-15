import { Router } from 'express';
import { UserController } from '../controllers/userController';
import upload from '../middlewares/uploadMiddleware';
import { SellerController } from '../controllers/sellerController';
import { MidtransCallbackController } from '../controllers/midtransCallbackController';
import { AuthController } from '../controllers/authController';

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

// MIDTRANS
publicRoute.post(
  '/midtrans/callback',
  MidtransCallbackController.handleCallback
);

// AUTH
publicRoute.post(
  '/api/request-reset-password',
  AuthController.requestPasswordReset
);
publicRoute.post('/api/verify-reset-code', AuthController.verifyResetCode);
publicRoute.post('/api/reset-password', AuthController.resetPassword);

export default publicRoute;
