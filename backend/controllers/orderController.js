import crypto from 'crypto';
import OrderSchema from '../schemas/OrderSchema.js';
import { calculateCheckoutTotals } from '../utils/checkout.js';

const normalizeAmount = (value) => Number(Number(value || 0).toFixed(2));

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

    const totals = calculateCheckoutTotals({
      subtotal,
      deliveryFee,
      packagingFee,
      platformFee,
      gstRate,
      paymentMethod,
    });

    const orderPayload = {
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

    const order = await OrderSchema.create(orderPayload);

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

  console.log('Creating Razorpay order with amount:', keyId, keySecret);
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

const triggerShiprocketOrderCreation = async (order) => {
  const apiUrl = process.env.SHIPROCKET_API_URL;
  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!apiUrl || !email || !password) {
    console.warn(
      'Shiprocket is not configured. Skipping Shiprocket order creation.',
    );
    return null;
  }

  const authResponse = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!authResponse.ok) {
    const errorText = await authResponse.text();
    throw new Error(
      `Shiprocket auth failed: ${authResponse.status} ${errorText}`,
    );
  }

  const authData = await authResponse.json();
  const token = authData.token;
  if (!token) {
    throw new Error('Shiprocket auth token is missing');
  }

  const shiprocketPayload = {
    order_id: order._id.toString(),
    order_date: new Date().toISOString(),
    pickup_location: 'default',
    billing_customer_name: order.customerName,
    billing_last_name: '',
    billing_address: order.shippingAddress,
    billing_city: order.city,
    billing_state: order.state,
    billing_country: 'India',
    billing_email: order.customerEmail,
    billing_phone: order.customerPhone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.productId,
      units: item.quantity,
      selling_price: item.price,
    })),
    payment_method: 'Prepaid',
    sub_total: order.subtotal,
    total_discount: 0,
    total_tax: order.gstAmount,
    shipping_charges: order.deliveryFee,
    length: 0,
    breadth: 0,
    height: 0,
    weight: 1,
  };

  const createResponse = await fetch(`${apiUrl}/orders/create/adhoc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(shiprocketPayload),
  });

  if (!createResponse.ok) {
    const errorText = await createResponse.text();
    throw new Error(
      `Shiprocket order creation failed: ${createResponse.status} ${errorText}`,
    );
  }

  return await createResponse.json();
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

    const order = await OrderSchema.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const paidAmount = normalizeAmount(Number(amount));
    const expectedAmount = normalizeAmount(order.grandTotal);
    console.log('Verifying payment amounts:', paidAmount, expectedAmount);
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

    try {
      await triggerShiprocketOrderCreation(order);
    } catch (shipError) {
      console.error('Shiprocket order creation failed:', shipError.message);
    }

    return res.status(200).json({
      success: true,
      order,
      message: 'Payment verified and order created successfully',
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export { createOrder, getOrderById, initiatePayment, verifyRazorpayPayment };
