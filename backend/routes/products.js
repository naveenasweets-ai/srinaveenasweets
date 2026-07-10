/** import controllers */
import * as productController from '../controllers/productsController.js';

import { Router } from 'express';
const router = Router();

// fetch products
router.route('/').get(productController.fetchProducts);

export default router;
