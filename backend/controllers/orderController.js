import crypto from 'crypto';
import OrderSchema from '../schemas/OrderSchema.js';
import { calculateCheckoutTotals } from '../utils/checkout.js';
import { capitalizeFirstLetter } from '../utils/utils.js';
import {
  deductStock,
  restoreStock,
  validateOrderStock,
} from '../utils/stockService.js';

const normalizeAmount = (value) => Number(Number(value || 0).toFixed(2));

const otpStore = new Map();
const OTP_TTL_MS = 2 * 60 * 1000; // 2 minutes

const normalizePhone = (phone) =>
  String(phone || '')
    .replace(/\D/g, '')
    .slice(-10);

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const toE164 = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `+91${digits}`;
  return digits ? `+${digits}` : '';
};

const buildOrderId = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  return `OD-${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
};

const sendOtpViaWhatsapp = async (phone, otp) => {
  const whatsappToken = process.env.WHATSAPP_TOKEN;

  if (!whatsappToken) {
    console.log(
      '360 Messenger credentials not configured. OTP generated locally:',
    );
    return { success: false, mocked: true };
  }

  const payload = {
    phonenumber: toE164(phone),
    text: `Sri Naveena Sweets - Your OTP for verifying the COD order is ${otp}.
    
Please enter this code to confirm your purchase. Do not share this code with anyone.`,
  };

  const response = await fetch(`https://api.360messenger.com/v2/sendMessage`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${whatsappToken}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(payload).toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to send OTP via Whatsapp.');
  }

  return { success: true, mocked: true, message: 'OTP sent successfully' };
};

const verifyOtpViaWhatsapp = async (phone, otp) => {
  const normalizedPhone = normalizePhone(phone);
  const otpCode = String(otp || '').trim();

  if (!normalizedPhone || normalizedPhone.length !== 10) {
    return { success: false, message: 'Invalid phone number.' };
  }

  if (!/^\d{6}$/.test(otpCode)) {
    return { success: false, message: 'Invalid OTP format.' };
  }

  const storedOtpEntry = otpStore.get(normalizedPhone);
  if (!storedOtpEntry) {
    return { success: false, message: 'OTP expired or not found.' };
  }

  if (Date.now() - storedOtpEntry.createdAt > OTP_TTL_MS) {
    otpStore.delete(normalizedPhone);
    return { success: false, message: 'OTP expired.' };
  }

  if (storedOtpEntry.otp !== otpCode) {
    return { success: false, message: 'Invalid OTP.' };
  }

  otpStore.delete(normalizedPhone);
  return { success: true, message: 'OTP verified successfully.' };
};

const sendOrderNotification = async (order) => {
  const adminPhone = process.env.ADMIN_PHONE;
  const whatsappToken = process.env.WHATSAPP_TOKEN;

  if (!adminPhone || !whatsappToken) {
    console.warn(
      'Admin phone or WhatsApp token not configured. Skipping order notification.',
    );
    return;
  }

  const mapsUrl =
    order.latitude && order.longitude
      ? `https://www.google.com/maps?q=${order.latitude},${order.longitude}`
      : 'Not provided';

  const itemsList = (order.items || [])
    .map(
      (item) =>
        `- ${item.name || 'Unknown'}${item.weight !== 'unit' ? ` ${item.weight} gms` : ''} x ${item.quantity} = ₹${item.price}`,
    )
    .join('\n');

  const feeLines = [];

  if (order.deliveryFee > 0) {
    feeLines.push(`Delivery Fee: ₹${order.deliveryFee}`);
  }
  if (order.packagingFee > 0) {
    feeLines.push(`Packaging Fee: ₹${order.packagingFee}`);
  }
  if (order.platformFee > 0) {
    feeLines.push(`Platform Fee: ₹${order.platformFee}`);
  }
  if (order.gstAmount > 0) {
    feeLines.push(`GST (${order.gstRate}%): ₹${order.gstAmount}`);
  }

  const feesText = feeLines.join('\n');

  const message = `*New Order Received!*

Order ID: ${order._id}

Customer: ${order.customerName}
Phone: ${order.customerPhone}
Email: ${order.customerEmail}

Address:
${order.shippingAddress}, ${order.city}, ${order.state} - ${order.pincode}

Payment Method: ${order.paymentMethod === 'razorpay' ? 'Prepaid' : 'Cash on Delivery'}
Payment Status: ${capitalizeFirstLetter(order.paymentStatus)}
Order Status: ${capitalizeFirstLetter(order.orderStatus)}

Items:
${itemsList || 'No items'}

Subtotal: ₹${order.subtotal}
${feesText}
Grand Total: ₹${order.grandTotal}

Notes: ${order.notes || 'None'}

Location Map: ${mapsUrl}`;

  try {
    const payload = {
      phonenumber: toE164(adminPhone),
      text: message,
    };

    const response = await fetch(
      `https://api.360messenger.com/v2/sendMessage`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${whatsappToken}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(payload).toString(),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to send order notification:', errorText);
    }
  } catch (error) {
    console.error('Error sending order notification:', error);
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      customerId = '',
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      city,
      state,
      pincode,
      items = [],
      paymentMethod = 'cod',
      subtotal,
      deliveryFee = 0,
      packagingFee = 0,
      platformFee = 0,
      gstRate = 0,
      notes = '',
      longitude,
      latitude,
      otpVerified = false,
      otpCode = '',
    } = req.body || {};

    if (!customerName?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: 'Customer name is required' });
    }
    if (!customerEmail?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: 'Customer email is required' });
    }
    if (!customerPhone?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: 'Customer phone is required' });
    }
    if (
      !shippingAddress?.trim() ||
      !city?.trim() ||
      !state?.trim() ||
      !pincode?.trim()
    ) {
      return res
        .status(400)
        .json({ success: false, error: 'Shipping details are incomplete' });
    }
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, error: 'Cart items are required' });
    }

    const stockValidation = await validateOrderStock(items);

    if (!stockValidation.valid) {
      return res.status(400).json({
        success: false,
        error: 'Some items are out of stock',
        unavailable: stockValidation.unavailable,
      });
    }

    if (paymentMethod === 'cod' && !otpVerified) {
      return res.status(400).json({
        success: false,
        error: 'OTP verification is required for cash on delivery orders',
      });
    }

    const totals = calculateCheckoutTotals({
      subtotal,
      deliveryFee,
      packagingFee,
      platformFee,
      gstRate,
      paymentMethod,
    });

    const orderPayload = {
      _id: buildOrderId().toString(),
      customerId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      shippingAddress: shippingAddress.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      paymentMethod,
      paymentStatus: paymentMethod === 'razorpay' ? 'pending' : 'cod',
      longitude: longitude,
      latitude: latitude,
      orderStatus: 'pending',
      items: items.map((item) => ({
        productId: item.productId || item._id || '',
        name: item.name || item.product?.name || '',
        quantity: Number(item.quantity) || 1,
        weight: item.weight || '',
        price: normalizeAmount(item.price),
      })),
      subtotal: normalizeAmount(totals.subtotal),
      deliveryFee: normalizeAmount(totals.deliveryFee),
      packagingFee: normalizeAmount(totals.packagingFee),
      platformFee: normalizeAmount(totals.platformFee),
      gstRate: normalizeAmount(totals.gstRate),
      gstAmount: normalizeAmount(totals.gstAmount),
      grandTotal: normalizeAmount(totals.grandTotal),
      notes,
    };

    if (paymentMethod === 'razorpay') {
      return res.status(201).json({
        success: true,
        order: {
          _id: orderPayload._id,
          paymentStatus: 'pending',
          orderStatus: 'pending',
        },
        message:
          'Order details captured. Awaiting Razorpay payment verification.',
      });
    }

    const order = await OrderSchema.create(orderPayload);

    await sendOrderNotification(order);

    return res.status(201).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await OrderSchema.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await OrderSchema.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getCustomerOrders = async (req, res) => {
  try {
    const { customerId } = req.params;
    if (req.user?._id !== customerId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    const orders = await OrderSchema.find({ customerId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const buildRazorpayPayload = ({
  amount,
  receipt,
  customerName,
  customerEmail,
  customerPhone,
  orderId,
}) => ({
  amount: Math.round(Number(amount) * 100),
  currency: 'INR',
  receipt: receipt || `receipt_${Date.now()}`,
  notes: {
    customer_name: customerName || '',
    customer_email: customerEmail || '',
    customer_phone: customerPhone || '',
    order_id: orderId || '',
  },
});

const createRazorpayOrder = async ({
  amount,
  receipt,
  customerName,
  customerEmail,
  customerPhone,
  orderId,
}) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are not configured');
  }

  const numericAmount = Number(amount);
  if (!numericAmount || numericAmount <= 0) {
    throw new Error('Invalid amount');
  }

  const payload = buildRazorpayPayload({
    amount: numericAmount,
    receipt,
    customerName,
    customerEmail,
    customerPhone,
    orderId,
  });

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Razorpay order creation failed: ${response.status} ${errorText}`,
    );
  }

  const data = await response.json();
  return data;
};

const initiatePayment = async (req, res) => {
  try {
    const {
      amount,
      orderId,
      receipt = '',
      customerName = '',
      customerEmail = '',
      customerPhone = '',
    } = req.body || {};

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, error: 'Missing order reference' });
    }

    const razorpayOrder = await createRazorpayOrder({
      amount,
      receipt: receipt || orderId,
      customerName,
      customerEmail,
      customerPhone,
      orderId,
    });

    return res.status(200).json({
      success: true,
      razorpayOrder,
      keyId: process.env.RAZORPAY_KEY_ID || '',
      name: 'Sri Naveena Sweets',
      description: 'Order payment',
      prefill: {
        name: customerName,
        email: customerEmail,
        contact: customerPhone,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const sendOtp = async (req, res) => {
  try {
    const { phone = '' } = req.body || {};
    if (!phone?.trim()) {
      return res
        .status(400)
        .json({ success: false, error: 'Phone number is required' });
    }

    const otp = generateOtp();
    const result = await sendOtpViaWhatsapp(phone, otp);
    otpStore.set(phone, { otp, createdAt: Date.now() });
    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    const otp = String(req.body.otp || '').trim();

    if (!phone || phone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit phone number.',
      });
    }

    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit OTP.',
      });
    }

    const storedOtpEntry = otpStore.get(phone);
    if (!storedOtpEntry) {
      return res.status(400).json({
        success: false,
        message: 'OTP expired or not found. Please request a new one.',
      });
    }

    if (Date.now() - storedOtpEntry.createdAt > OTP_TTL_MS) {
      otpStore.delete(phone);
      return res.status(400).json({
        success: false,
        message: 'OTP expired. Please request a new one.',
      });
    }

    if (storedOtpEntry.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.',
      });
    }

    otpStore.delete(phone);

    return res.json({
      success: true,
      message: 'OTP verified successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      orderData,
    } = req.body || {};

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      amount == null
    ) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payment verification fields',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res
        .status(500)
        .json({ success: false, error: 'Razorpay secret is not configured' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, error: 'Invalid Razorpay signature' });
    }

    let order = await OrderSchema.findById(orderId);
    if (!order) {
      if (!orderData) {
        return res.status(400).json({
          success: false,
          error: 'Missing order details for Razorpay verification',
        });
      }

      const orderPayload = {
        _id: orderId,
        customerId: orderData.customerId || '',
        customerName: orderData.customerName?.trim() || '',
        customerEmail: orderData.customerEmail?.trim() || '',
        customerPhone: orderData.customerPhone?.trim() || '',
        shippingAddress: orderData.shippingAddress?.trim() || '',
        city: orderData.city?.trim() || '',
        state: orderData.state?.trim() || '',
        pincode: orderData.pincode?.trim() || '',
        paymentMethod: 'razorpay',
        paymentStatus: 'pending',
        orderStatus: 'pending',
        longitude: orderData.longitude,
        latitude: orderData.latitude,
        items: Array.isArray(orderData.items)
          ? orderData.items.map((item) => ({
              productId: item.productId || item._id || '',
              name: item.name || item.product?.name || '',
              quantity: Number(item.quantity) || 1,
              weight: item.weight || '',
              price: normalizeAmount(item.price),
            }))
          : [],
        subtotal: normalizeAmount(orderData.subtotal),
        deliveryFee: normalizeAmount(orderData.deliveryFee),
        packagingFee: normalizeAmount(orderData.packagingFee),
        platformFee: normalizeAmount(orderData.platformFee),
        gstRate: normalizeAmount(orderData.gstRate),
        gstAmount: normalizeAmount(orderData.gstAmount),
        grandTotal: normalizeAmount(orderData.grandTotal),
        notes: orderData.notes || '',
      };

      order = await OrderSchema.create(orderPayload);
    }
    const paidAmount = normalizeAmount(Number(amount));
    const grandTotal =
      orderData?.subtotal +
      orderData?.deliveryFee +
      orderData?.packagingFee +
      orderData?.platformFee +
      orderData?.gstAmount;

    const expectedAmount = normalizeAmount(grandTotal);
    if (paidAmount !== expectedAmount) {
      return res.status(400).json({
        success: false,
        error: 'Payment amount does not match order total',
      });
    }

    order.paymentStatus = 'paid';
    order.orderStatus = 'confirmed';
    order.razorpayOrderId = razorpay_order_id;
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    if (orderData) {
      order.notes = `${order.notes || ''} | payment verified`;
    }

    await order.save();

    await deductStock(order.items);

    await sendOrderNotification(order);

    return res.status(200).json({
      success: true,
      order,
      message: 'Payment verified and order created successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status) {
      return res
        .status(400)
        .json({ success: false, error: 'Status is required' });
    }

    const allowedStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Allowed: ${allowedStatuses.join(', ')}`,
      });
    }

    const order = await OrderSchema.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const previousStatus = String(order.orderStatus || '').toLowerCase();
    const newStatus = String(status).toLowerCase();
    const wasConfirmedOrDelivered =
      previousStatus === 'confirmed' || previousStatus === 'delivered';

    order.orderStatus = newStatus;
    await order.save();

    if (
      (newStatus === 'confirmed' || newStatus === 'delivered') &&
      !wasConfirmedOrDelivered
    ) {
      await deductStock(order.items);
    }

    if (newStatus === 'cancelled' && wasConfirmedOrDelivered) {
      await restoreStock(order.items);
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export {
  createOrder,
  getOrderById,
  getAllOrders,
  getCustomerOrders,
  initiatePayment,
  sendOtp,
  verifyOtp,
  verifyRazorpayPayment,
  updateOrderStatus,
};
