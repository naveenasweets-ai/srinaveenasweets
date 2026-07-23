import { Router } from 'express';
import * as customerController from '../controllers/customerController.js';
import { requireCustomerAuth } from '../middleware/requireAuth.js';

const router = Router();

router
  .route('/getUser')
  .get(requireCustomerAuth, customerController.getCustomerById);

router
  .route('/updateCart')
  .post(requireCustomerAuth, customerController.updateCart);

router
  .route('/updateWishlist')
  .post(requireCustomerAuth, customerController.updateWishlist);

router
  .route('/addresses')
  .get(requireCustomerAuth, customerController.getAddresses)
  .post(requireCustomerAuth, customerController.addAddress);

router
  .route('/addresses/:addressId')
  .delete(requireCustomerAuth, customerController.deleteAddress)
  .put(requireCustomerAuth, customerController.updateAddress);

export default router;
