/** import controllers */
import * as authController from '../controllers/authController.js';

import { Router } from 'express';
const router = Router();

// admin login routes
router.route('/admin/login').post(authController.loginUser);

router.route('/admin/signup').post(authController.signupUser);

// Google login route
router.route('/google').post(authController.googleLogin);

export default router;
