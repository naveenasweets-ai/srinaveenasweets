import mongoose from 'mongoose';
const { Schema } = mongoose;

const CustomerSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  phone: {
    type: String,
    unique: true,
    sparse: true,
  },
  cartItems: [
    {
      productId: {
        type: String,
      },
      quantity: {
        type: Number,
        default: 1,
      },
      weightOrUnits: {
        type: String,
      },
    },
  ],
  wishlist: [
    {
      type: String,
    },
  ],
  orders: [
    {
      type: String,
    },
  ],
  addresses: [
    {
      fullname: { type: String, required: true },
      mobile: { type: String, required: true },
      fullAddress: { type: String, required: true },
      landmark: { type: String },
      email: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
  ],
  loggedInAtIST: {
    type: String,
  },
});

export default mongoose.model('Customer', CustomerSchema);
