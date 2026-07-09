import { Router } from 'express';
import * as siteController from '../controllers/siteConfigController.js';
import * as productController from '../controllers/productsController.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';

const router = Router();

// === Admin Site Content Routes ====
router
  .route('/categories')
  .post(requireAdminAuth, siteController.createCategory);

router
  .route('/categories/:id')
  .put(requireAdminAuth, siteController.updateCategory)
  .delete(requireAdminAuth, siteController.deleteCategory);

router.route('/products').post(requireAdminAuth, productController.saveProduct);

router
  .route('/products/:id')
  .put(requireAdminAuth, productController.updateProduct);

export default router;
