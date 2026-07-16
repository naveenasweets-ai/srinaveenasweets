import ProductSchema from '../schemas/ProductSchema.js';

export async function fetchProducts(req, res) {
  try {
    const products = await ProductSchema.find();
    return res.status(200).json({ success: true, products });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
}

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
    if (!image || !image.toString().trim()) {
      return res
        .status(400)
        .json({ success: false, error: 'Product image is required' });
    }

    const normalizedWeightOptions =
      Array.isArray(availableWeight) && availableWeight.length
        ? availableWeight
            .map((entry) => ({
              value: Number(entry?.value) || 0,
              unit: String(entry?.unit ?? '').trim(),
              price: Number(entry?.price) || 0,
              originalPrice:
                entry?.originalPrice !== undefined &&
                entry?.originalPrice !== null &&
                entry?.originalPrice !== ''
                  ? Number(entry.originalPrice)
                  : undefined,
            }))
            .filter((entry) => entry.value > 0 && entry.unit)
        : null;

    const product = await ProductSchema.create({
      _id: _id.toString().trim(),
      name: name.toString().trim(),
      category: category.toString().trim(),
      subcategory: subcategory?.toString().trim() || '',
      price: price !== undefined ? Number(price) : undefined,
      originalPrice:
        originalPrice !== undefined && originalPrice !== null && originalPrice !== ''
          ? Number(originalPrice)
          : undefined,
      image: image.toString().trim(),
      images: Array.isArray(images) ? images : [],
      badge: badge?.toString().trim() || undefined,
      description: description?.toString().trim() || '',
      inStock: inStock !== undefined ? Boolean(inStock) : true,
      inventoryType: inventoryType === 'unit' ? 'unit' : 'weight',
      availableWeight: normalizedWeightOptions,
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
    const normalizedWeightOptions =
      Array.isArray(updates.availableWeight) && updates.availableWeight.length
        ? updates.availableWeight
            .map((entry) => ({
              value: Number(entry?.value) || 0,
              unit: String(entry?.unit ?? '').trim(),
              price: Number(entry?.price) || 0,
              originalPrice:
                entry?.originalPrice !== undefined &&
                entry?.originalPrice !== null &&
                entry?.originalPrice !== ''
                  ? Number(entry.originalPrice)
                  : undefined,
            }))
            .filter((entry) => entry.value > 0 && entry.unit)
        : undefined;
    const allowedUpdates = {
      name: updates.name,
      category: updates.category,
      subcategory: updates.subcategory,
      price: updates.price !== undefined ? Number(updates.price) : undefined,
      originalPrice:
        updates.originalPrice !== undefined &&
        updates.originalPrice !== null &&
        updates.originalPrice !== ''
          ? Number(updates.originalPrice)
          : undefined,
      image: updates.image,
      images: Array.isArray(updates.images) ? updates.images : undefined,
      badge: updates.badge,
      description: updates.description,
      inStock: updates.inStock,
      inventoryType: updates.inventoryType === 'unit' ? 'unit' : 'weight',
      availableWeight: normalizedWeightOptions,
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
