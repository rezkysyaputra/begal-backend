import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { UserController } from '../controllers/userControllers';

const privateRoute: Router = Router();

privateRoute.use(authMiddleware);
// USER
privateRoute.get('/api/v1/user/profile', UserController.get);
privateRoute.patch('/api/v1/user/profile', UserController.update);
privateRoute.patch(
  '/api/v1/user/change-password',
  UserController.changePassword
);

export default privateRoute;
