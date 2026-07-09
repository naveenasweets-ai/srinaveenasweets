import { getOrCreateSiteConfig } from '../utils/utils.js';

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

    return res.status(201).json({ success: true, category });
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
