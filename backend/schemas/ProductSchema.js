import mongoose from 'mongoose';
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    subcategory: {
      type: String,
      required: false,
      default: '',
    },
    price: {
      type: Number,
      required: false,
    },
    originalPrice: {
      type: Number,
      required: false,
    },
    image: {
      type: String,
      required: true,
    },
    images: {
      type: [String],
      required: false,
      default: [],
    },
    badge: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: false,
    },
    inStock: {
      type: Boolean,
      required: true,
      default: true,
    },
    inventoryType: {
      type: String,
      enum: ['weight', 'unit'],
      required: false,
      default: 'weight',
    },
    availableWeight: {
      type: [
        {
          value: { type: Number, required: true, default: 0 },
          unit: { type: String, required: true, default: '' },
          price: { type: Number, required: false, default: 0 },
          originalPrice: { type: Number, required: false },
        },
      ],
      required: false,
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model('Product', ProductSchema);
