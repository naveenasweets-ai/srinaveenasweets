import { getOrCreateSiteConfig } from '../utils/utils.js';
import ProductSchema from '../schemas/ProductSchema.js';
import { legalPagesDefault } from '../schemas/siteDefaults.js';

const LEGAL_PAGE_SLUGS = legalPagesDefault.map((page) => page.slug);

export async function createCategory(req, res) {
  const { name, description, parentId, type, order } = req.body;

  if (!name?.trim()) {
    return res
      .status(400)
      .json({ success: false, error: 'Category name is required' });
  }

  try {
    const siteConfig = await getOrCreateSiteConfig();
    const slug = (name || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const activeParentCount = (siteConfig.categories || []).filter(
      (item) => item.type !== 'subcategory' && item.isActive !== false,
    ).length;

    const category = {
      name: name.trim(),
      slug,
      description: description || '',
      image: '',
      parentId: parentId || null,
      type: type || 'category',
      order: order ?? 0,
      isActive: type === 'subcategory' || activeParentCount < 4 ? true : false,
    };

    siteConfig.categories.push(category);
    await siteConfig.save();

    return res.status(200).json({ success: true, charges: siteConfig.charges });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
export async function updateCategory(req, res) {
  const { id } = req.params;
  const { name, description, parentId, type, order, isActive, image } =
    req.body;

  try {
    const siteConfig = await getOrCreateSiteConfig();
    const category = siteConfig.categories.id(id);
    if (!category) {
      return res
        .status(404)
        .json({ success: false, error: 'Category not found' });
    }

    if (name) {
      category.name = name.trim();
      category.slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    }
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (parentId !== undefined) category.parentId = parentId || null;
    if (type) category.type = type;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await siteConfig.save();
    return res.status(200).json({ success: true, category });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function deleteCategory(req, res) {
  const { id } = req.params;

  try {
    const siteConfig = await getOrCreateSiteConfig();
    const categoryIndex = siteConfig.categories.findIndex(
      (item) => item._id.toString() === id,
    );
    if (categoryIndex === -1) {
      return res
        .status(404)
        .json({ success: false, error: 'Category not found' });
    }

    siteConfig.categories.splice(categoryIndex, 1);
    await siteConfig.save();

    return res.status(200).json({ success: true, message: 'Category deleted' });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveHeroContent(req, res) {
  try {
    const {
      eyebrow,
      titleLine1,
      titleLine2,
      subtitle,
      description,
      primaryButtonLabel,
      primaryButtonTarget,
      image,
      featuredProductId,
    } = req.body || {};

    const siteConfig = await getOrCreateSiteConfig();
    if (featuredProductId !== undefined) {
      if (featuredProductId === null || featuredProductId === '') {
        siteConfig.hero.featuredProductId = null;
      } else {
        const product = await ProductSchema.findById(featuredProductId);
        if (!product) {
          return res
            .status(400)
            .json({ success: false, error: 'Featured product not found' });
        }
        siteConfig.hero.featuredProductId = product?._id || '';
        siteConfig.hero.image = image || '';
        siteConfig.hero.eyebrow = eyebrow || siteConfig.hero.eyebrow;
        siteConfig.hero.titleLine1 = titleLine1 || siteConfig.hero.titleLine1;
        siteConfig.hero.titleLine2 = titleLine2 || siteConfig.hero.titleLine2;
        siteConfig.hero.subtitle = subtitle || siteConfig.hero.subtitle;
        siteConfig.hero.description =
          description || siteConfig.hero.description;
        siteConfig.hero.primaryButtonLabel =
          primaryButtonLabel || siteConfig.hero.primaryButtonLabel;
        siteConfig.hero.primaryButtonTarget =
          primaryButtonTarget || siteConfig.hero.primaryButtonTarget;
      }
    }

    await siteConfig.save();

    return res
      .status(200)
      .json({ success: true, heroContent: siteConfig.hero });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveHandpickedCategories(req, res) {
  try {
    const { selectedCategories } = req.body || {};

    if (!selectedCategories || !Array.isArray(selectedCategories)) {
      return res.status(400).json({
        success: false,
        error: 'selectedCategories must be an array',
      });
    }

    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.categoriesInfo.selectedCategories = selectedCategories;
    await siteConfig.save();

    return res.status(200).json({
      success: true,
      categoriesInfo: siteConfig.categoriesInfo,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveFeatures(req, res) {
  try {
    const { features } = req.body || {};

    if (!Array.isArray(features)) {
      return res
        .status(400)
        .json({ success: false, error: 'Features must be an array' });
    }

    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.features = features.map((feature) => ({
      title: feature.title || '',
      description: feature.description || '',
    }));

    await siteConfig.save();

    return res
      .status(200)
      .json({ success: true, features: siteConfig.features });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveCharges(req, res) {
  try {
    const {
      deliveryFee,
      freeDeliveryThreshold,
      platformFee,
      packagingFee,
      gstRate,
    } = req.body || {};

    const siteConfig = await getOrCreateSiteConfig();

    if (deliveryFee !== undefined) {
      const value = Number(deliveryFee);
      siteConfig.charges.deliveryFee =
        value < 0 || Number.isNaN(value) ? 0 : value;
    }
    if (freeDeliveryThreshold !== undefined) {
      const value = Number(freeDeliveryThreshold);
      siteConfig.charges.freeDeliveryThreshold =
        value < 0 || Number.isNaN(value) ? 0 : value;
    }
    if (platformFee !== undefined) {
      const value = Number(platformFee);
      siteConfig.charges.platformFee =
        value < 0 || Number.isNaN(value) ? 0 : value;
    }
    if (packagingFee !== undefined) {
      const value = Number(packagingFee);
      siteConfig.charges.packagingFee =
        value < 0 || Number.isNaN(value) ? 0 : value;
    }
    if (gstRate !== undefined) {
      const value = Number(gstRate);
      siteConfig.charges.gstRate = value < 0 || Number.isNaN(value) ? 0 : value;
    }

    await siteConfig.save();

    return res.status(200).json({ success: true, charges: siteConfig.charges });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveLegalPages(req, res) {
  try {
    const { legalPages } = req.body || {};

    if (!Array.isArray(legalPages)) {
      return res
        .status(400)
        .json({ success: false, error: 'legalPages must be an array' });
    }

    const siteConfig = await getOrCreateSiteConfig();

    // The 4 legal pages are fixed: they cannot be added or removed. We only
    // allow updating the title/description/content of the known slugs and
    // always rebuild the array from the fixed default slugs.
    const incomingBySlug = new Map(
      legalPages
        .filter((page) => page && LEGAL_PAGE_SLUGS.includes(page.slug))
        .map((page) => [page.slug, page]),
    );

    siteConfig.legalPages = legalPagesDefault.map((preset) => {
      const incoming = incomingBySlug.get(preset.slug);
      return {
        slug: preset.slug,
        title:
          incoming?.title !== undefined && incoming.title.trim() !== ''
            ? incoming.title.trim()
            : preset.title,
        description: incoming?.description ?? preset.description,
        content: incoming?.content ?? preset.content,
      };
    });

    await siteConfig.save();

    return res
      .status(200)
      .json({ success: true, legalPages: siteConfig.legalPages });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function saveOutletCoordinates(req, res) {
  try {
    const { outletCoordinates, outlets } = req.body || {};
    const items = outletCoordinates || outlets;

    if (!Array.isArray(items)) {
      return res
        .status(400)
        .json({ success: false, error: 'outletCoordinates must be an array' });
    }

    const siteConfig = await getOrCreateSiteConfig();
    siteConfig.outletCoordinates = items
      .filter((item) => item && typeof item.lat === 'number' && typeof item.lng === 'number')
      .map((item) => ({
        name: (item.name || '').trim(),
        address: (item.address || '').trim(),
        lat: Number(item.lat),
        lng: Number(item.lng),
      }));

    await siteConfig.save();

    return res.status(200).json({
      success: true,
      outletCoordinates: siteConfig.outletCoordinates,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
