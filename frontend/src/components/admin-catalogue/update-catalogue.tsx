/* eslint-disable @typescript-eslint/no-explicit-any */
// this is a modal to update the catalogue of products in the admin panel as form
import { useRef, useState } from 'react';
import { IoMdAdd } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';
import type { Product } from '../../types/contextTypes';
import { fileListToBase64 } from '../../utils/utils';
import { useStore } from '../../context/StoreContext';
import {
  normalizeProductWeights,
  type ProductWeightOption,
} from '../../utils/productInventory';
import ProductApi from '../../api/product';
import { ImageUploadZone } from '../app-customize/image-upload-zone';

const UpdateCatalogue = ({
  action,
  closeModal,
  product,
}: {
  action: string;
  closeModal: () => void;
  product?: Product;
}) => {
  const { siteContent, setProducts } = useStore();
  const categoryOptions = siteContent.categories.filter(
    (cat) => cat.type !== 'subcategory',
  );

  const getDefaultCategoryId = (currentProduct?: Product) => {
    const matchingCategory = categoryOptions.find(
      (cat) => cat._id === currentProduct?.category,
    );
    return matchingCategory?._id ?? categoryOptions[0]?._id ?? '';
  };

  const getInitialDescription = (value = '') => {
    const description = value ?? '';
    return description.includes('<')
      ? description
      : description.replace(/\n/g, '<br/>');
  };

  const getInitialInventoryType = (currentProduct?: Product) =>
    currentProduct?.inventoryType === 'unit' ? 'unit' : 'weight';

  const getInitialWeight = (
    currentProduct?: Product,
    type: 'weight' | 'unit' = 'weight',
  ) =>
    normalizeProductWeights(currentProduct) ||
    (type === 'unit' ? { value: 1, unit: 'unit' } : { value: 250, unit: 'g' });

  const [productId, setProductId] = useState(product?._id ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [origPrice, setOrigPrice] = useState(product?.originalPrice ?? '');
  const [subcategoryId, setSubcategoryId] = useState(
    product?.subcategory ?? '',
  );
  const [description, setDescription] = useState(() =>
    getInitialDescription(product?.description ?? ''),
  );
  const [image, setImage] = useState(product?.image ?? '');
  const [badge, setBadge] = useState(product?.badge ?? '');
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [additionalImages, setAdditionalImages] = useState(
    product?.images ?? [],
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    getDefaultCategoryId(product),
  );

  const subcategoryOptions = siteContent.categories.filter(
    (cat) => cat.type === 'subcategory' && cat.parentId === selectedCategoryId,
  );

  const api = ProductApi();

  const [inventoryType, setInventoryType] = useState<'weight' | 'unit'>(
    getInitialInventoryType(product),
  );
  const [inventoryWeight, setInventoryWeight] = useState<ProductWeightOption>(
    getInitialWeight(product, getInitialInventoryType(product)),
  );

  const editorRef = useRef<HTMLDivElement | null>(null);

  const exec = (cmd: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false as any);
    setDescription(editorRef.current.innerHTML);
  };

  const sanitizeWeightOption = (entry: ProductWeightOption) => ({
    value: Number(entry.value) || 0,
    unit:
      String(entry.unit).trim() || (inventoryType === 'unit' ? 'unit' : 'g'),
  });

  const selectedCategoryName =
    categoryOptions.find((cat) => cat._id === selectedCategoryId)?.name ?? '';
  const selectedSubcategoryName =
    subcategoryOptions.find((cat) => cat._id === subcategoryId)?.name ?? '';

  const makeProductPayload = () => {
    const payload = {
      _id: productId.trim(),
      name: name.trim(),
      category: selectedCategoryName,
      subcategory: selectedSubcategoryName,
      price: Number(price) || 0,
      originalPrice: origPrice !== '' ? Number(origPrice) : undefined,
      image,
      images: additionalImages,
      badge: badge.trim() || undefined,
      description,
      inStock,
      inventoryType,
      availableWeight: sanitizeWeightOption(inventoryWeight),
    };

    if (!payload.badge) {
      delete payload.badge;
    }
    if (
      payload.originalPrice === undefined ||
      Number.isNaN(payload.originalPrice)
    ) {
      delete payload.originalPrice;
    }

    return payload;
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = makeProductPayload();

    const result = await api.saveProduct(payload);
    if (result?.success && result.product) {
      setProducts((prevProducts) => [...prevProducts, result.product]);
      closeModal();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = makeProductPayload();

    const result = await api.updateProduct(productId, payload);
    if (result?.success && result.product) {
      setProducts((prevProducts) =>
        prevProducts.map((item) =>
          item._id === result.product._id ? result.product : item,
        ),
      );
      closeModal();
    }
  };

  const inputClassName =
    'w-full rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] px-3 py-2.5 text-sm text-[#4d2b1f] shadow-sm outline-none transition focus:border-[#8b1e2d] focus:ring-2 focus:ring-[#f3d48a]/50 disabled:cursor-not-allowed disabled:bg-[#f8efe3]';
  const labelClassName =
    'mb-1 block text-[11px] font-bold uppercase tracking-[0.24em] text-[#5f1021]';

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center bg-[#5f1021]/60 p-4 backdrop-blur-sm">
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-4xl border border-[#f3d48a]/70 bg-[#fffdf7] shadow-[0_24px_70px_rgba(95,16,33,0.2)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#f3d48a]/70 bg-[#fffdf7]/95 px-6 py-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8b1e2d] text-xl text-[#fff8ef] shadow-[0_10px_24px_rgba(139,30,45,0.18)]">
              <IoMdAdd />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#5f1021]">
                {action === 'add' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <p className="text-xs text-[#8a6a4a]">Publishes instantly</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="rounded-full p-2 text-[#8b1e2d] transition hover:bg-[#fef4da]"
          >
            <IoCloseSharp />
          </button>
        </div>
        <form
          onSubmit={action === 'add' ? handleAdd : handleSave}
          className="space-y-5 p-6"
        >
          <div className="rounded-3xl border border-[#f3d48a]/70 bg-[linear-gradient(135deg,#fffdf7_0%,#fff8ef_100%)] p-4 shadow-[0_14px_35px_rgba(95,16,33,0.06)] sm:p-5">
            <div>
              <label className={labelClassName}>Product Id</label>
              <input
                required
                type="text"
                disabled={action === 'edit'}
                value={productId ?? ''}
                onChange={(e: any) => setProductId(e.target.value)}
                className={`${inputClassName} ${action === 'edit' ? 'cursor-not-allowed' : ''}`}
              />
            </div>
            <div className="mt-5">
              <label className={labelClassName}>Main Image</label>
              <div className="rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] p-3">
                <ImageUploadZone value={image} onChange={setImage} />
              </div>
            </div>
            <div className="mt-5">
              <label className={labelClassName}>Additional Images</label>
              <input
                type="file"
                accept="image/*"
                multiple
                className="w-full rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] p-3 text-sm text-[#4d2b1f]"
                onChange={async (e) => {
                  const newImages = await fileListToBase64(e.target.files);
                  setAdditionalImages((prev) => [...prev, ...newImages]);
                  if (e.target) e.target.value = '';
                }}
              />
              {additionalImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {additionalImages.map((src, index) => (
                    <div
                      key={index}
                      className="relative overflow-hidden rounded-2xl border border-[#f3d48a]/70"
                    >
                      <img
                        src={src}
                        alt={`Additional ${index + 1}`}
                        className="h-24 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setAdditionalImages((prev) =>
                            prev.filter((_, i) => i !== index),
                          )
                        }
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-sm text-[#5f1021]"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClassName}>Name *</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product Name"
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>Category</label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className={`${inputClassName} cursor-pointer bg-[#fffdf7]`}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClassName}>
                Subcategory{' '}
                <span className="font-normal text-[#8a6a4a]">optional</span>
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className={`${inputClassName} cursor-pointer bg-[#fffdf7]`}
              >
                <option value="">None</option>
                {subcategoryOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClassName}>Price (₹) *</label>
              <input
                required
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>Original Price</label>
              <input
                type="number"
                value={origPrice}
                onChange={(e) => setOrigPrice(e.target.value)}
                placeholder="For discount"
                className={inputClassName}
              />
            </div>
            <div>
              <label className={labelClassName}>Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Optional"
                className={inputClassName}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={`${labelClassName} mb-2`}>
                Product Measurement
              </label>
              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#f3d48a]/70 bg-[#fff8ef] p-3">
                  <input
                    type="radio"
                    name="inventoryType"
                    value="weight"
                    checked={inventoryType === 'weight'}
                    onChange={() => {
                      setInventoryType('weight');
                      setInventoryWeight((prev) => ({
                        value: prev.value > 0 ? prev.value : 250,
                        unit:
                          prev.unit && prev.unit !== 'unit' ? prev.unit : 'g',
                      }));
                    }}
                    className="accent-[#8b1e2d]"
                  />
                  <span className="text-sm font-medium text-[#5f1021]">
                    Weight
                  </span>
                </label>
                <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-[#f3d48a]/70 bg-[#fff8ef] p-3">
                  <input
                    type="radio"
                    name="inventoryType"
                    value="unit"
                    checked={inventoryType === 'unit'}
                    onChange={() => {
                      setInventoryType('unit');
                      setInventoryWeight((prev) => ({
                        value: prev.value > 0 ? prev.value : 1,
                        unit:
                          prev.unit && prev.unit !== 'g' ? prev.unit : 'unit',
                      }));
                    }}
                    className="accent-[#8b1e2d]"
                  />
                  <span className="text-sm font-medium text-[#5f1021]">
                    Units
                  </span>
                </label>
              </div>
            </div>
            <div className="sm:col-span-2 rounded-3xl border border-[#f3d48a]/70 bg-[#fff8ef] p-4">
              <label className={`${labelClassName} mb-1`}>
                {inventoryType === 'unit'
                  ? 'Unit Inventory'
                  : 'Weight Inventory'}
              </label>
              <p className="mb-4 text-[11px] text-[#8a6a4a]">
                {inventoryType === 'unit'
                  ? 'Set a single unit amount and label for this product.'
                  : 'Set a single weight amount and unit for this product.'}
              </p>
              <div className="grid items-center gap-3 sm:grid-cols-[120px_1fr]">
                <label className="text-xs font-semibold text-[#5f1021]">
                  {inventoryType === 'unit' ? 'Units' : 'Weight'}
                </label>
                <input
                  type="number"
                  min="0"
                  value={inventoryWeight.value}
                  onChange={(e) =>
                    setInventoryWeight((prev) => ({
                      ...prev,
                      value: Number(e.target.value) || 0,
                    }))
                  }
                  className={inputClassName}
                />
                <label className="text-xs font-semibold text-[#5f1021]">
                  {inventoryType === 'unit' ? 'Unit label' : 'Weight unit'}
                </label>
                <input
                  type="text"
                  value={inventoryWeight.unit}
                  onChange={(e) =>
                    setInventoryWeight((prev) => ({
                      ...prev,
                      unit: e.target.value,
                    }))
                  }
                  placeholder={inventoryType === 'unit' ? 'piece' : 'g'}
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] p-3">
              <span className="text-xs font-bold text-[#5f1021]">
                Available in Stock immediately
              </span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-[#8b1e2d] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                <span className="ml-3 min-w-17.5 text-xs font-bold text-[#5f1021]">
                  {inStock ? '✓ In Stock' : '✗ Sold Out'}
                </span>
              </label>
            </div>
            <div className="sm:col-span-2">
              <label className={`${labelClassName} mb-2`}>Description</label>
              <div className="mb-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => exec('bold')}
                  title="Bold"
                  className="rounded-lg border border-[#f3d48a]/70 bg-[#fffdf7] px-3 py-1 text-sm font-bold text-[#5f1021]"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => exec('italic')}
                  title="Italic"
                  className="rounded-lg border border-[#f3d48a]/70 bg-[#fffdf7] px-3 py-1 text-sm italic text-[#5f1021]"
                >
                  I
                </button>
              </div>
              <div
                ref={editorRef}
                onInput={(e) =>
                  setDescription((e.target as HTMLDivElement).innerHTML)
                }
                contentEditable
                suppressContentEditableWarning
                className="min-h-24 w-full rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] px-4 py-2.5 text-sm text-[#4d2b1f] shadow-sm outline-none transition focus:border-[#8b1e2d] focus:ring-2 focus:ring-[#f3d48a]/50"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 rounded-2xl border border-[#f3d48a]/70 bg-[#fffdf7] py-3 text-sm font-semibold text-[#5f1021] transition hover:bg-[#fef4da]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#8b1e2d] py-3 text-sm font-semibold text-[#fff8ef] shadow-[0_10px_24px_rgba(139,30,45,0.18)] transition hover:bg-[#a02233]"
            >
              <IoMdAdd /> Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateCatalogue;
