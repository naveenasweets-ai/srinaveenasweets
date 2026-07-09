import ProductSchema from '../schemas/ProductSchema.js';

export async function saveProduct(req, res) {
  try {
    const {
      _id,
      name,
      category,
      subcategory,
      price,
      originalPrice,
      image,
      images,
      badge,
      description,
      inStock,
      inventoryType,
      availableWeight,
    } = req.body || {};

    if (!_id || !_id.toString().trim()) {
      return res
        .status(400)
        .json({ success: false, error: 'Product _id is required' });
    }
    if (!name || !name.toString().trim()) {
      return res
        .status(400)
        .json({ success: false, error: 'Product name is required' });
    }
    if (!category || !category.toString().trim()) {
      return res
        .status(400)
        .json({ success: false, error: 'Product category is required' });
    }
    if (price === undefined || price === null || Number.isNaN(Number(price))) {
      return res
        .status(400)
        .json({ success: false, error: 'Product price is required' });
    }
    if (!image || !image.toString().trim()) {
      return res
        .status(400)
        .json({ success: false, error: 'Product image is required' });
    }

    const product = await ProductSchema.create({
      _id: _id.toString().trim(),
      name: name.toString().trim(),
      category: category.toString().trim(),
      subcategory: subcategory?.toString().trim() || '',
      price: Number(price),
      originalPrice:
        originalPrice !== undefined ? Number(originalPrice) : undefined,
      image: image.toString().trim(),
      images: Array.isArray(images) ? images : [],
      badge: badge?.toString().trim() || undefined,
      description: description?.toString().trim() || '',
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      inventoryType: inventoryType === 'unit' ? 'unit' : 'weight',
      availableWeight:
        availableWeight &&
        typeof availableWeight === 'object' &&
        !Array.isArray(availableWeight)
          ? {
              value: Number(availableWeight.value) || 0,
              unit: String(availableWeight.unit).trim(),
            }
          : null,
    });

    return res.status(201).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

export async function updateProduct(req, res) {
  const { id } = req.params;

  try {
    const updates = req.body || {};
    const allowedUpdates = {
      name: updates.name,
      category: updates.category,
      subcategory: updates.subcategory,
      price: updates.price,
      originalPrice: updates.originalPrice,
      image: updates.image,
      images: Array.isArray(updates.images) ? updates.images : undefined,
      badge: updates.badge,
      description: updates.description,
      inStock: updates.inStock,
      inventoryType: updates.inventoryType === 'unit' ? 'unit' : 'weight',
      availableWeight:
        updates.availableWeight &&
        typeof updates.availableWeight === 'object' &&
        !Array.isArray(updates.availableWeight)
          ? {
              value: Number(updates.availableWeight.value) || 0,
              unit: String(updates.availableWeight.unit).trim(),
            }
          : undefined,
    };

    const product = await ProductSchema.findByIdAndUpdate(id, allowedUpdates, {
      new: true,
      runValidators: true,
      context: 'query',
    });

    if (!product) {
      return res
        .status(404)
        .json({ success: false, error: 'Product not found' });
    }

    return res.status(200).json({ success: true, product });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}
