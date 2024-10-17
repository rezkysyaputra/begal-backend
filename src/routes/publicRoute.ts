import { Router } from 'express';
import { UserController } from '../controllers/userControllers';
import upload from '../middlewares/uploadMiddleware';

const publicRoute: Router = Router();

// USERS
publicRoute.post(
  '/api/v1/register',
  upload.single('file'),
  UserController.register
);

export default publicRoute;
