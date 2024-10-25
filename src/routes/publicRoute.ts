import { Router } from 'express';
import { UserController } from '../controllers/userControllers';
import upload from '../middlewares/uploadMiddleware';

const publicRoute: Router = Router();

// USERS

publicRoute.post(
  '/api/v1/register',
  upload.single('image'),
  UserController.register
);

publicRoute.post('/api/v1/login', UserController.login);

export default publicRoute;
