import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';

const privateRoute: Router = Router();

privateRoute.use(authMiddleware);

export default privateRoute;
