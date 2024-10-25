import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';

const privateRoute: Router = Router();

privateRoute.use(authMiddleware);
// USER
privateRoute.get('/api/v1/user/profile');

export default privateRoute;
