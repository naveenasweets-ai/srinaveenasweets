import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  initiatePayment,
  sendOtp,
  verifyOtp,
  verifyRazorpayPayment,
} from '../controllers/orderController.js';

const router = Router();

router.post('/', createOrder);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.get('/:id', getOrderById);
router.post('/payment', initiatePayment);
router.post('/payment/verify', verifyRazorpayPayment);

export default router;
