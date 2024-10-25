import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { UserController } from '../controllers/userControllers';

const privateRoute: Router = Router();

privateRoute.use(authMiddleware);
// USER
privateRoute.get('/api/v1/user/profile', UserController.get);

export default privateRoute;
