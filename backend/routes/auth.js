/** import controllers */
import * as adminController from '../controllers/authController.js';

import { Router } from 'express';
const router = Router();

// admin login routes
router.route('/admin/login').post(adminController.loginUser);

router.route('/admin/signup').post(adminController.signupUser);

export default router;
