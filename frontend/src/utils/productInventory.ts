/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Product } from '../types/contextTypes';

export type ProductWeightOption = {
  value: number;
  unit: string;
};

const normalizeWeightEntry = (entry: any): ProductWeightOption | null => {
  if (!entry || typeof entry !== 'object') return null;

  if (entry.value !== undefined && entry.unit !== undefined) {
    return {
      value: Number(entry.value) || 0,
      unit: String(entry.unit).trim(),
    };
  }

  if (entry.units !== undefined && entry.name !== undefined) {
    return {
      value: Number(entry.units) || 0,
      unit: String(entry.name).trim(),
    };
  }

  return null;
};

export const normalizeProductWeights = (
  product?: Product,
): ProductWeightOption | null => {
  const raw = product?.availableWeight;
  if (!raw) return null;

  if (Array.isArray(raw)) {
    const normalized = raw
      .map(normalizeWeightEntry)
      .filter((entry): entry is ProductWeightOption => Boolean(entry));
    return normalized[0] ?? null;
  }

  return normalizeWeightEntry(raw);
};

export const normalizeProductInventory = (product?: Product) => {
  if (!product) return { inventoryType: 'weight' as const, availableWeight: null };

  return {
    inventoryType:
      product.inventoryType === 'unit' ? ('unit' as const) : ('weight' as const),
    availableWeight: normalizeProductWeights(product),
  };
};

export const getAvailableWeightOption = (
  product: Product,
): ProductWeightOption | null => {
  return normalizeProductWeights(product);
};

export const getProductInventoryState = (product: Product) => {
  const weight = normalizeProductWeights(product);
  const availableWeight = weight && weight.value > 0 ? weight : null;

  return {
    weight,
    availableWeight,
    hasInventory: Boolean(availableWeight),
    isOutOfStock:
      product?.inStock === false || availableWeight === null,
  };
};

export const getSelectedWeightOption = (product: any, unit: string) => {
  const weight = normalizeProductWeights(product);
  if (!weight) return null;
  return weight.unit.toLowerCase() === unit.toLowerCase() ? weight : null;
};

export const isCartItemAvailable = (item: any, products: any[] = []) => {
  const product = products.find((entry) => entry._id === item?.product?._id);
  const weightOption = getSelectedWeightOption(
    product || item?.product,
    item?.weight,
  );

  return Boolean(weightOption && weightOption.value > 0);
};
