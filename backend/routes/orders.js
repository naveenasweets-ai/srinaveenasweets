import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  initiatePayment,
  verifyRazorpayPayment,
} from '../controllers/orderController.js';

const router = Router();

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.post('/payment', initiatePayment);
router.post('/payment/verify', verifyRazorpayPayment);

export default router;
