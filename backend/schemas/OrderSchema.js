import mongoose from 'mongoose';

const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    _id: { type: String, required: true, unique: true },
    customerId: { type: String, required: false, default: '' },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, required: true },
    shippingAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    paymentMethod: { type: String, required: true, enum: ['cod', 'razorpay'] },
    paymentStatus: { type: String, required: true, default: 'pending' },
    orderStatus: { type: String, required: true, default: 'pending' },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        weight: { type: String, default: '' },
        price: { type: Number, required: true },
      },
    ],
    subtotal: { type: Number, required: true, default: 0 },
    deliveryFee: { type: Number, required: true, default: 0 },
    packagingFee: { type: Number, required: true, default: 0 },
    platformFee: { type: Number, required: true, default: 0 },
    gstRate: { type: Number, required: true, default: 0 },
    gstAmount: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    notes: { type: String, default: '' },
  },
  { timestamps: true },
);

export default mongoose.model('Order', OrderSchema);
