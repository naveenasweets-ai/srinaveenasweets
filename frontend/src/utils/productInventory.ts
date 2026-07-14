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

const normalizeSelection = (selection?: string) =>
  String(selection ?? '').trim().toLowerCase();

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
): ProductWeightOption | null => normalizeProductWeights(product);

export const getInventoryDisplayLabel = (product?: Product) => {
  const option = normalizeProductWeights(product);
  if (!option || option.value <= 0) return '';

  return product?.inventoryType === 'unit'
    ? `${option.value} ${option.unit}`.trim()
    : `${option.value}${option.unit}`.trim();
};

export const getDefaultInventorySelection = (product?: Product) => {
  const option = normalizeProductWeights(product);

  if (!option || option.value <= 0) return '';

  if (product?.inventoryType === 'unit') {
    return option.unit || 'unit';
  }

  return String(option.value);
};

export const getProductInventoryState = (product: Product) => {
  const weight = normalizeProductWeights(product);
  const availableWeight = weight && weight.value > 0 ? weight : null;
  const hasInventory = Boolean(availableWeight);

  return {
    weight,
    availableWeight,
    hasInventory,
    isOutOfStock: product?.inStock === false || !hasInventory,
  };
};

export const getSelectedWeightOption = (
  product: any,
  selectedValue?: string,
) => {
  const option = normalizeProductWeights(product);
  if (!option || option.value <= 0) return null;

  if (product?.inventoryType === 'unit') return option;

  const normalizedSelection = normalizeSelection(selectedValue);
  if (!normalizedSelection) return option;

  const normalizedValue = String(option.value).toLowerCase();
  const normalizedUnit = option.unit.toLowerCase();

  return normalizedSelection === normalizedValue ||
    normalizedSelection === normalizedUnit ||
    normalizedSelection === `${normalizedValue}${normalizedUnit}` ||
    normalizedSelection === `${normalizedValue} ${normalizedUnit}`
    ? option
    : null;
};

export const isCartItemAvailable = (item: any, products: any[] = []) => {
  const product = products.find((entry) => entry._id === item?.product?._id);
  const weightOption = getSelectedWeightOption(
    product || item?.product,
    item?.weightOrUnits,
  );

  return Boolean(weightOption && weightOption.value > 0);
};
