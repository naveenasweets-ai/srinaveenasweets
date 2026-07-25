import ProductSchema from '../schemas/ProductSchema.js';

async function findProduct(productId) {
  if (!productId) return null;
  return ProductSchema.findById(productId).lean();
}

async function updateProductStock(productId, updates) {
  if (!productId) return null;
  return ProductSchema.findByIdAndUpdate(productId, updates, {
    new: true,
  }).lean();
}

async function findMatchingVariant(product, weight) {
  if (!product || !product.availableWeight || !product.availableWeight.length)
    return null;

  if (product.inventoryType === 'unit')
    return product.availableWeight[0] || null;

  const normalizedWeight = String(weight || '')
    .trim()
    .toLowerCase();
  if (!normalizedWeight) return product.availableWeight[0] || null;

  return (
    product.availableWeight.find((variant) => {
      const variantValue = String(variant.value || '').toLowerCase();
      const variantUnit = String(variant.unit || 'g')
        .trim()
        .toLowerCase();
      const variantKey = `${variantValue}${variantUnit}`;
      return (
        normalizedWeight === variantKey ||
        normalizedWeight === variantValue ||
        normalizedWeight === variantUnit
      );
    }) ||
    product.availableWeight[0] ||
    null
  );
}

export async function validateOrderStock(orderItems) {
  if (!Array.isArray(orderItems) || !orderItems.length) {
    return { valid: true, unavailable: [] };
  }

  const unavailable = [];

  for (const item of orderItems) {
    const productId = item.productId;
    const quantity = Number(item.quantity) || 0;
    const weight = String(item.weight || '')
      .trim()
      .toLowerCase();

    if (!productId || quantity <= 0) continue;

    const product = await findProduct(productId);
    // console.log('product: ', product);
    if (!product) {
      unavailable.push({
        productId,
        name: item.name || 'Unknown',
        weight: item.weight,
        quantity,
        reason: 'Product not found',
      });
      continue;
    }

    const variant = await findMatchingVariant(product, weight);

    if (!variant) {
      unavailable.push({
        productId,
        name: item.name || 'Unknown',
        weight: item.weight,
        quantity,
        reason: 'Weight variant not found',
      });
      continue;
    }

    const currentStock = Number(variant.stock);

    if (currentStock === undefined || currentStock === null) continue;
    if (currentStock < quantity) {
      unavailable.push({
        productId,
        name: item.name || 'Unknown',
        weight: item.weight || variant.value,
        quantity,
        available: currentStock,
        reason: 'Insufficient stock',
      });
    }
  }

  return { valid: unavailable.length === 0, unavailable };
}

export async function deductStock(orderItems) {
  if (!Array.isArray(orderItems) || !orderItems.length) return;

  for (const item of orderItems) {
    const productId = item.productId;
    const quantity = Number(item.quantity) || 0;
    const weight = String(item.weight || '')
      .trim()
      .toLowerCase();

    if (!productId || quantity <= 0) continue;

    const product = await findProduct(productId);
    if (!product || !product.availableWeight || !product.availableWeight.length)
      continue;

    let deducted = false;
    let newAvailableWeight = null;

    if (product.inventoryType === 'unit') {
      const currentStock = Number(product.availableWeight[0]?.stock);
      if (currentStock === undefined || currentStock === null) continue;
      const newStock = Math.max(0, currentStock - quantity);
      newAvailableWeight = [
        {
          ...(product.availableWeight[0] || {}),
          stock: newStock,
        },
      ];
      deducted = true;
    } else {
      const updatedVariants = product.availableWeight.map((variant) => {
        const variantValue = String(variant.value || '').toLowerCase();
        const variantUnit = String(variant.unit || 'g')
          .trim()
          .toLowerCase();
        const variantKey = `${variantValue}${variantUnit}`;
        const match =
          weight === variantKey ||
          weight === variantValue ||
          weight === variantUnit;
        if (!match) return variant;

        const currentStock = Number(variant.stock);
        if (currentStock === undefined || currentStock === null) return variant;
        const newStock = Math.max(0, currentStock - quantity);
        deducted = true;
        return { ...variant, stock: newStock };
      });
      newAvailableWeight = updatedVariants;
    }

    if (!deducted) continue;

    const allOutOfStock = newAvailableWeight.every(
      (variant) => (Number(variant.stock) || 0) <= 0,
    );

    await updateProductStock(productId, {
      availableWeight: newAvailableWeight,
      inStock: !allOutOfStock,
    });
  }
}

export async function restoreStock(orderItems) {
  if (!Array.isArray(orderItems) || !orderItems.length) return;

  for (const item of orderItems) {
    const productId = item.productId;
    const quantity = Number(item.quantity) || 0;
    const weight = String(item.weight || '')
      .trim()
      .toLowerCase();

    if (!productId || quantity <= 0) continue;

    const product = await findProduct(productId);
    if (!product || !product.availableWeight || !product.availableWeight.length)
      continue;

    let restored = false;
    let newAvailableWeight = null;

    if (product.inventoryType === 'unit') {
      const currentStock = Number(product.availableWeight[0]?.stock);
      if (currentStock === undefined || currentStock === null) continue;
      newAvailableWeight = [
        {
          ...(product.availableWeight[0] || {}),
          stock: currentStock + quantity,
        },
      ];
      restored = true;
    } else {
      const updatedVariants = product.availableWeight.map((variant) => {
        const variantValue = String(variant.value || '').toLowerCase();
        const variantUnit = String(variant.unit || 'g')
          .trim()
          .toLowerCase();
        const variantKey = `${variantValue}${variantUnit}`;
        const match =
          weight === variantKey ||
          weight === variantValue ||
          weight === variantUnit;
        if (!match) return variant;

        const currentStock = Number(variant.stock);
        if (currentStock === undefined || currentStock === null) return variant;
        restored = true;
        return { ...variant, stock: currentStock + quantity };
      });
      newAvailableWeight = updatedVariants;
    }

    if (!restored) continue;

    const anyInStock = newAvailableWeight.some(
      (variant) => (Number(variant.stock) || 0) > 0,
    );

    await updateProductStock(productId, {
      availableWeight: newAvailableWeight,
      inStock: anyInStock,
    });
  }
}
