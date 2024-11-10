import { Router } from 'express';
import { UserController } from '../controllers/userController';
import upload from '../middlewares/uploadMiddleware';
import { SellerController } from '../controllers/sellerController';
import { MidtransCallbackController } from '../controllers/midtransCallbackController';

const publicRoute: Router = Router();

// ROUTES SAYHELLO
publicRoute.get('/', (req, res) => {
  res.send('BELI GALON API');
});
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
publicRoute.get(
  '/midtrans/callback',
  MidtransCallbackController.handleCallback
);

export default publicRoute;
