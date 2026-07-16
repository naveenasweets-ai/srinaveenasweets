/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Product, ProductWeightPrice } from '../types/contextTypes';

export type ProductWeightOption = {
  value: number;
  unit: string;
};

export type ProductWeightPriceOption = ProductWeightPrice;

const normalizeWeightEntry = (
  entry: any,
): ProductWeightPriceOption | null => {
  if (!entry || typeof entry !== 'object') return null;

  const value =
    entry.value !== undefined ? Number(entry.value) : Number(entry.units);
  const unit =
    entry.unit !== undefined
      ? String(entry.unit).trim()
      : String(entry.name ?? '').trim();

  if (Number.isNaN(value) || value <= 0 || !unit) return null;

  return {
    value,
    unit,
    price: entry.price !== undefined ? Number(entry.price) || 0 : 0,
    originalPrice:
      entry.originalPrice !== undefined &&
        entry.originalPrice !== null &&
        entry.originalPrice !== ''
        ? Number(entry.originalPrice)
        : undefined,
  };
};

const normalizeSelection = (selection?: string) =>
  String(selection ?? '').trim().toLowerCase();

export const normalizeProductWeights = (
  product?: Product,
): ProductWeightPriceOption[] => {
  const raw = product?.availableWeight;
  if (!raw) return [];

  if (Array.isArray(raw)) {
    return raw
      .map(normalizeWeightEntry)
      .filter(
        (entry): entry is ProductWeightPriceOption => Boolean(entry),
      );
  }

  const single = normalizeWeightEntry(raw);
  return single ? [single] : [];
};

export const normalizeProductInventory = (product?: Product) => {
  return {
    inventoryType:
      product?.inventoryType === 'unit' ? ('unit' as const) : ('weight' as const),
    availableWeight: normalizeProductWeights(product),
  };
};

export const getAvailableWeightOption = (
  product?: Product,
): ProductWeightPriceOption | null =>
  product ? normalizeProductWeights(product)[0] ?? null : null;

export const getInventoryDisplayLabel = (product?: Product) => {
  const option = getAvailableWeightOption(product);
  if (!option || option.value <= 0) return '';

  return product?.inventoryType === 'unit'
    ? `${option.value} ${option.unit}`.trim()
    : `${option.value}${option.unit}`.trim();
};

export const getDefaultInventorySelection = (product?: Product) => {
  const option = getAvailableWeightOption(product);
  if (!option || option.value <= 0) return '';

  if (product?.inventoryType === 'unit') {
    return option.unit || 'unit';
  }

  return String(option.value);
};

export const getProductInventoryState = (product: Product) => {
  const weightOptions = normalizeProductWeights(product);
  const hasInventory = weightOptions.length > 0;

  return {
    weightOptions,
    hasInventory,
    isOutOfStock: product?.inStock === false || !hasInventory,
  };
};

export const getSelectedWeightOption = (
  product: any,
  selectedValue?: string,
): ProductWeightPriceOption | null => {
  const options = normalizeProductWeights(product);
  if (!options.length) return null;

  if (product?.inventoryType === 'unit') return options[0];

  const normalizedSelection = normalizeSelection(selectedValue);
  if (!normalizedSelection) return options[0];

  const match = options.find((option) => {
    const normalizedValue = String(option.value).toLowerCase();
    const normalizedUnit = option.unit.toLowerCase();

    return (
      normalizedSelection === normalizedValue ||
      normalizedSelection === normalizedUnit ||
      normalizedSelection === `${normalizedValue}${normalizedUnit}` ||
      normalizedSelection === `${normalizedValue} ${normalizedUnit}`
    );
  });

  return match ?? null;
};

export const getProductPrice = (product: Product): number => {
  if (product.inventoryType === 'unit') {
    return Number(product.price) || 0;
  }

  const options = normalizeProductWeights(product);
  return options[0]?.price || 0;
};

export const getProductOriginalPrice = (product: Product): number | undefined => {
  if (product.inventoryType === 'unit') {
    return product.originalPrice;
  }

  const options = normalizeProductWeights(product);
  return options[0]?.originalPrice;
};

export const getWeightOptions = (product?: Product): ProductWeightPriceOption[] =>
  normalizeProductWeights(product);

export const getOptionPrice = (
  option: ProductWeightPriceOption | null,
): number => (option ? Number(option.price) || 0 : 0);

export const getOptionOriginalPrice = (
  option: ProductWeightPriceOption | null,
): number | undefined => option?.originalPrice;

export const isCartItemAvailable = (item: any, products: any[] = []) => {
  const product = products.find((entry) => entry._id === item?.product?._id);
  const weightOption = getSelectedWeightOption(
    product || item?.product,
    item?.weight,
  );

  return Boolean(weightOption && weightOption.value > 0);
};
