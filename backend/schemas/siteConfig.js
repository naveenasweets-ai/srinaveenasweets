import mongoose from 'mongoose';
import {
  footerHelpDefault,
  footerAboutDefault,
  ribbonDefault,
  handpickedDefault,
  bridalImagesDefault,
  videosDefault,
  chargesDefault,
  legalPagesDefault,
} from './siteDefaults.js';

const { Schema } = mongoose;

const SiteConfigSchema = new Schema(
  {
    siteName: { type: String, default: 'Sri Naveena Sweets' },
    ribbon: {
      type: [String],
      default: ribbonDefault,
    },
    categories: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
        image: { type: String, default: '' },
        parentId: { type: String, default: null },
        type: {
          type: String,
          enum: ['category', 'subcategory'],
          default: 'category',
        },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
      },
    ],
    categoriesInfo: {
      title: { type: String, default: 'Our Categories' },
      description: {
        type: String,
        default:
          'Explore our wide range of traditional sweets, festive treats, and bakery delights. From rich milk sweets to soft cakes, we have something for every occasion.',
      },
      selectedCategories: [
        {
          name: { type: String, default: 'Selected Categories' },
          slug: { type: String, default: 'selected-categories' },
          selectedProducts: { type: [String], default: [] },
        },
      ],
    },
    hero: {
      eyebrow: { type: String, default: 'Freshly baked • festive sweets' },
      titleLine1: { type: String, default: 'Sri Naveena' },
      titleLine2: { type: String, default: 'Sweets & Bakery' },
      subtitle: {
        type: String,
        default: 'Traditional sweetness, baked fresh every day.',
      },
      description: {
        type: String,
        default:
          'From rich milk sweets and festive snacks to soft cakes and bakery favorites, Sri Naveena brings warmth, flavor, and celebration to every occasion.',
      },
      primaryButtonLabel: { type: String, default: 'Explore Treats' },
      primaryButtonTarget: { type: String, default: 'Treats' },
      image: { type: String, default: '/images/hero-bride.jpg' },
      featuredProductId: {
        type: String,
        default: 'SNSPID001',
      },
    },
    features: [
      {
        _id: { type: Schema.Types.ObjectId, auto: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, default: '' },
      },
    ],
    footer: {
      help: {
        type: [
          {
            label: { type: String, default: '' },
            href: { type: String, default: '' },
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            content: { type: String, default: '' },
          },
        ],
        default: footerHelpDefault,
      },
      about: {
        type: [
          {
            label: { type: String, default: '' },
            href: { type: String, default: '' },
            title: { type: String, default: '' },
            description: { type: String, default: '' },
            content: { type: String, default: '' },
          },
        ],
        default: footerAboutDefault,
      },
    },
    videos: {
      type: [
        {
          url: { type: String, default: '' },
          aspectRatio: { type: String, default: '16/9' },
        },
      ],
      default: videosDefault,
    },
    charges: {
      deliveryFee: { type: Number, default: chargesDefault.deliveryFee },
      freeDeliveryThreshold: {
        type: Number,
        default: chargesDefault.freeDeliveryThreshold,
      },
      platformFee: { type: Number, default: chargesDefault.platformFee },
      packagingFee: { type: Number, default: chargesDefault.packagingFee },
      gstRate: { type: Number, default: chargesDefault.gstRate },
    },
    legalPages: {
      type: [
        {
          slug: { type: String, required: true, trim: true },
          title: { type: String, default: '' },
          description: { type: String, default: '' },
          content: { type: String, default: '' },
        },
      ],
      default: legalPagesDefault,
    },
    deliverablePincodes: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true },
);
export default mongoose.model('SiteConfig', SiteConfigSchema);
