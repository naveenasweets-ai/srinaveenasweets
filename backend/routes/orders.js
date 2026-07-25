import { Router } from 'express';
import {
  createOrder,
  getOrderById,
  getAllOrders,
  getCustomerOrders,
  initiatePayment,
  sendOtp,
  verifyOtp,
  verifyRazorpayPayment,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';
import { requireCustomerAuth } from '../middleware/requireAuth.js';

const router = Router();

router.post('/', createOrder);
router.post('/otp/send', sendOtp);
router.post('/otp/verify', verifyOtp);
router.get('/:id', getOrderById);
router.get('/', requireAdminAuth, getAllOrders);
router.get('/customer/:customerId', requireCustomerAuth, getCustomerOrders);
router.post('/payment', initiatePayment);
router.post('/payment/verify', verifyRazorpayPayment);
router.put('/:id/status', requireAdminAuth, updateOrderStatus);

export default router;
