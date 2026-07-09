/* eslint-disable @typescript-eslint/no-explicit-any */
// this is a modal to update the catalogue of products in the admin panel as form
import { useRef, useState } from 'react';
import { IoMdAdd } from 'react-icons/io';
import { IoCloseSharp } from 'react-icons/io5';
import type { Product } from '../../types/contextTypes';
import { ImageUploadZone } from './image-upload-zone';
import { fileListToBase64 } from '../../utils/utils';
import { useStore } from '../../context/StoreContext';
import AppCustomApi from '../../api/app-customize';
import {
  normalizeProductWeights,
  type ProductWeightOption,
} from '../../utils/productInventory';

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
  const [productId, setProductId] = useState(product?._id ?? '');
  const [name, setName] = useState(product?.name ?? '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [origPrice, setOrigPrice] = useState(product?.originalPrice ?? '');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [description, setDescription] = useState(() => {
    const d = product?.description ?? '';
    return d.includes('<') ? d : d.replace(/\n/g, '<br/>');
  });
  const categoryOptions = siteContent.categories.filter(
    (cat) => cat.type !== 'subcategory',
  );
  const [image, setImage] = useState(product?.image ?? '');
  const [badge, setBadge] = useState(product?.badge ?? '');
  const [inStock, setInStock] = useState(product?.inStock ?? true);
  const [additionalImages, setAdditionalImages] = useState(
    product?.images ?? [],
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    categoryOptions[0]?._id ?? '',
  );

  const subcategoryOptions = siteContent.categories.filter(
    (cat) => cat.type === 'subcategory' && cat.parentId === selectedCategoryId,
  );

  const api = AppCustomApi();

  const initialInventoryType =
    product?.inventoryType === 'unit' ? 'unit' : 'weight';
  const [inventoryType, setInventoryType] = useState<'weight' | 'unit'>(
    initialInventoryType,
  );

  const initialWeight =
    normalizeProductWeights(product) ||
    (initialInventoryType === 'unit'
      ? { value: 1, unit: 'unit' }
      : { value: 250, unit: 'g' });
  const [inventoryWeight, setInventoryWeight] =
    useState<ProductWeightOption>(initialWeight);

  const editorRef = useRef<HTMLDivElement | null>(null);

  const exec = (cmd: string) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand(cmd, false as any);
    // update state after command
    setDescription(editorRef.current.innerHTML);
  };

  const sanitizeWeightOption = (entry: ProductWeightOption) => {
    return {
      value: Number(entry.value) || 0,
      unit:
        String(entry.unit).trim() || (inventoryType === 'unit' ? 'unit' : 'g'),
    };
  };

  const makeProductPayload = () => {
    const payload = {
      _id: productId.trim(),
      name: name.trim(),
      category: selectedCategoryId,
      subcategory: subcategoryId || '',
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
  return (
    <div className="fixed inset-0 z-999 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto admin-scroll">
        <div className="flex items-center justify-between p-6 border-b border-gold-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gold-500 flex items-center justify-center text-white">
              <IoMdAdd />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-maroon-900">
                {action === 'add' ? 'Add New Product' : 'Edit Product'}
              </h2>
              <p className="text-xs text-maroon-700/70">Publishes instantly</p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-full hover:bg-maroon-50 text-maroon-700 cursor-pointer"
          >
            <IoCloseSharp />
          </button>
        </div>
        <form
          onSubmit={action === 'add' ? handleAdd : handleSave}
          className="p-6 space-y-5"
        >
          <div>
            <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
              Product Id
            </label>
            <input
              required
              type="text"
              disabled={action === 'edit'}
              value={productId ?? ''}
              onChange={(e: any) => setProductId(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 bg-gray-50 ${action === 'edit' ? 'cursor-not-allowed' : ''}`}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
              Main Image
            </label>
            <ImageUploadZone value={image} onChange={setImage} />
          </div>
          <div>
            <label className="block text-xs font-bold text-maroon-900 uppercase tracking-wider mb-3">
              Additional Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full text-xs text-maroon-700 rounded-xl border-2 border-gold-200 p-3"
              onChange={async (e) => {
                const newImages = await fileListToBase64(e.target.files);
                setAdditionalImages((prev) => [...prev, ...newImages]);
                if (e.target) e.target.value = '';
              }}
            />
            {additionalImages.length > 0 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {additionalImages.map((src, index) => (
                  <div
                    key={index}
                    className="relative rounded-xl overflow-hidden border border-gold-200"
                  >
                    <img
                      src={src}
                      alt={`Additional ${index + 1}`}
                      className="w-full h-24 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setAdditionalImages((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/90 text-maroon-900 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Name *
              </label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Mahalakshmi Kanjivaram"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Category
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSubcategoryId('');
                }}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 bg-white cursor-pointer"
              >
                {categoryOptions.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Subcategory{' '}
                <span className="text-maroon-400 font-normal">optional</span>
              </label>
              <select
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 bg-white cursor-pointer"
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
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Price (₹) *
              </label>
              <input
                required
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm font-bold text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Original Price
              </label>
              <input
                type="number"
                value={origPrice}
                onChange={(e) => setOrigPrice(e.target.value)}
                placeholder="For discount"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Badge
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="Optional"
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#5f1021] mb-1 uppercase tracking-wide">
                Product Measurement
              </label>
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <label className="flex items-center gap-2 p-3 border border-[#f3d48a]/60 rounded-2xl bg-[#fff8ef] cursor-pointer">
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
                    className="accent-maroon-900"
                  />
                  <span className="text-sm font-medium text-[#5f1021]">
                    Weight
                  </span>
                </label>
                <label className="flex items-center gap-2 p-3 border border-[#f3d48a]/60 rounded-2xl bg-[#fff8ef] cursor-pointer">
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
                    className="accent-maroon-900"
                  />
                  <span className="text-sm font-medium text-[#5f1021]">
                    Units
                  </span>
                </label>
              </div>
            </div>
            <div className="sm:col-span-2 bg-[#fff8ef] p-4 rounded-3xl border border-[#f3d48a]/50">
              <label className="block text-xs font-bold text-[#5f1021] mb-1 uppercase tracking-wide">
                {inventoryType === 'unit'
                  ? 'Unit Inventory'
                  : 'Weight Inventory'}
              </label>
              <p className="text-[11px] text-[#5f1021]/80 mb-4">
                {inventoryType === 'unit'
                  ? 'Set a single unit amount and label for this product.'
                  : 'Set a single weight amount and unit for this product.'}
              </p>
              <div className="grid sm:grid-cols-[120px_1fr] gap-3 items-center">
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
                  className="w-full px-3 py-2 border border-gold-200 rounded-xl bg-white text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
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
                  className="w-full px-3 py-2 border border-gold-200 rounded-xl bg-white text-sm text-maroon-900 focus:outline-none focus:border-maroon-700"
                />
              </div>
            </div>
            <div className="sm:col-span-2 bg-maroon-50/50 p-3 rounded-xl border border-gold-200/60 flex items-center justify-between">
              <span className="text-xs font-bold text-maroon-900 block">
                Available in Stock immediately
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-maroon-900"></div>
                <span className="ml-3 text-xs font-bold text-maroon-900 min-w-[70px]">
                  {inStock ? '✓ In Stock' : '✗ Sold Out'}
                </span>
              </label>
            </div>
            {/* description */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-maroon-900 mb-1">
                Description
              </label>
              <div className="mb-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => exec('bold')}
                  title="Bold"
                  className="px-3 py-1 rounded-lg border border-gold-200 bg-white text-sm font-bold"
                >
                  B
                </button>
                <button
                  type="button"
                  onClick={() => exec('italic')}
                  title="Italic"
                  className="px-3 py-1 rounded-lg border border-gold-200 bg-white text-sm italic"
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
                className="w-full px-4 py-2.5 border-2 border-gold-200 rounded-xl text-sm text-maroon-900 focus:outline-none focus:border-maroon-700 transition-colors placeholder:text-maroon-300 min-h-[80px]"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 py-3 rounded-xl border-2 border-gold-200 text-maroon-900 text-sm font-bold hover:bg-gold-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-gold-500 hover:bg-gold-400 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
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
