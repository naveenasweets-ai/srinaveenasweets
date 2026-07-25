import { Router } from 'express';
import SiteConfig from '../schemas/siteConfig.js';
import { requireAdminAuth } from '../middleware/requireAuth.js';
import * as siteController from '../controllers/siteConfigController.js';
import { legalPagesDefault } from '../schemas/siteDefaults.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const siteConfig = await SiteConfig.findOne();
    if (!siteConfig) {
      return res
        .status(200)
        .json({
          success: true,
          categories: [],
          heroContent: null,
          legalPages: legalPagesDefault,
          outletCoordinates: [],
        });
    }

    return res.status(200).json({
      success: true,
      categories: siteConfig.categories || [],
      heroContent: siteConfig.hero || null,
      categoriesInfo: siteConfig.categoriesInfo,
      features: siteConfig.features || [],
      charges: siteConfig.charges || {
        deliveryFee: 40,
        freeDeliveryThreshold: 499,
        platformFee: 29,
        packagingFee: 15,
        gstRate: 5,
      },
      legalPages:
        Array.isArray(siteConfig.legalPages) && siteConfig.legalPages.length
          ? siteConfig.legalPages
          : legalPagesDefault,
      outletCoordinates: siteConfig.outletCoordinates || [],
      footer: siteConfig.footer || {
        help: [
          {
            label: 'Track Order',
            href: '/track-order',
            title: 'Track Your Order',
            description: 'Monitor your order status in real-time',
            content:
              'Keep track of your order from dispatch to delivery. Enter your order ID to get real-time updates.',
          },
          {
            label: 'Shipping & Delivery',
            href: '/shipping-and-delivery',
            title: 'Shipping & Delivery',
            description: 'Learn about our shipping options',
            content:
              'We offer standard and express shipping to all locations. Orders are carefully packaged and dispatched within 24 hours.',
          },
          {
            label: 'Returns & Exchange',
            href: '/returnes-and-exchange',
            title: 'Returns & Exchange',
            description: 'Easy returns and exchanges',
            content:
              'We offer hassle-free returns and exchanges within 7 days of delivery for unused items in original packaging.',
          },
          {
            label: 'FAQs',
            href: '/faqs',
            title: 'Frequently Asked Questions',
            description: 'Answers to common questions',
            content:
              'Find answers to commonly asked questions about our products, ordering, and shipping policies.',
          },
        ],
        about: [
          {
            label: 'Our Heritage',
            href: '/our-heritage',
            title: 'Our Heritage',
            description: 'Discover our rich history',
            content:
              'Five decades of weaving stories into silk. From the temple looms of Kanchipuram, draping the women of India since 1972.',
          },
        ],
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

router
  .route('/hero-content')
  .post(requireAdminAuth, siteController.saveHeroContent);

router.route('/features').post(requireAdminAuth, siteController.saveFeatures);

router.route('/charges').post(requireAdminAuth, siteController.saveCharges);

router
  .route('/legal-pages')
  .post(requireAdminAuth, siteController.saveLegalPages);

router
  .route('/outlet-coordinates')
  .post(requireAdminAuth, siteController.saveOutletCoordinates);

export default router;
