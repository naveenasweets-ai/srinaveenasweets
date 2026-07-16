import { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { IoIosSearch } from 'react-icons/io';
import { IoMdAdd } from 'react-icons/io';
import { CiEdit } from 'react-icons/ci';
import { FaRegTrashAlt } from 'react-icons/fa';
import type { Product } from '../../types/contextTypes';
import { getProductPrice, getProductOriginalPrice } from '../../utils/productInventory';
import UpdateCatalogue from '../../components/admin-catalogue/update-catalogue';
import DeleteConfirmModal from '../../components/admin-catalogue/delete-confirmation';

const ProductCatalogue = () => {
  const { products } = useStore();

  const [productSearch, setProductSearch] = useState('');
  const [actionModal, setActionModal] = useState<'add' | 'edit' | 'none'>(
    'none',
  );
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(
    undefined,
  );

  const [deleteConfirm, setDeleteConfirm] = useState<{
    product: Product;
    isOpen: boolean;
  }>({
    product: {
      _id: '',
      name: '',
      category: '',
      description: '',
      price: 0,
      image: '',
    },
    isOpen: false,
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearch.toLowerCase()),
  );

  return (
    <div className="space-y-6 lg:p-12 p-4">
      <div className="rounded-[28px] border border-[#f3d48a]/70 bg-linear-to-br from-[#fff8ef] via-[#fffdf7] to-[#fef4da] p-4 shadow-[0_12px_35px_rgba(139,30,45,0.08)] sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-[#8b1e2d]">
              Product Catalogue
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              onClick={() => {
                setEditingProduct(undefined);
                setActionModal('add');
              }}
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#8b1e2d] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(139,30,45,0.2)] transition hover:bg-[#a02233]"
            >
              <IoMdAdd className="text-base" /> Add New
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-[#f3d48a]/70 bg-white/70 p-3 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b1e2d]">
              <IoIosSearch />
            </span>
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search items, categories…"
              className="w-full rounded-2xl border border-[#f3d48a]/80 bg-[#fffdf7] py-2.5 pl-10 pr-4 text-sm text-[#4d2b1f] outline-none transition focus:border-[#8b1e2d] focus:ring-2 focus:ring-[#f3d48a]/60"
            />
          </div>
          <div className="rounded-full bg-[#fef4da] px-3 py-1.5 text-sm font-medium text-[#8b1e2d]">
            {filteredProducts.length} items
          </div>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#f3d48a]/80 bg-[#fffdf7] p-8 text-center text-[#6d4a36] shadow-sm">
          No products match your current search. Try a different keyword.
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((p, i) => {
            const displayPrice = getProductPrice(p);
            const displayOriginalPrice = getProductOriginalPrice(p);
            const d = displayOriginalPrice
              ? Math.round(
                  ((displayOriginalPrice - displayPrice) /
                    displayOriginalPrice) *
                    100,
                )
              : 0;
            const outOfStock = p.inStock === false;

            return (
              <div
                key={i}
                className={`group flex flex-col justify-between overflow-hidden rounded-3xl border border-[#f3d48a]/70 bg-[#fffdf7] shadow-[0_10px_30px_rgba(139,30,45,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(139,30,45,0.14)] ${
                  outOfStock ? 'opacity-80' : ''
                }`}
              >
                <div>
                  <div className="relative aspect-5/6 overflow-hidden bg-[#fff8ef]">
                    <img
                      src={p.image}
                      alt={p.name}
                      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                        outOfStock ? 'grayscale-20' : ''
                      }`}
                    />

                    {outOfStock && (
                      <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-[#5f1021]/65 backdrop-blur-[1px]">
                        <span className="rounded-full border border-[#f3d48a] bg-[#8b1e2d] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] text-[#fef4da]">
                          Sold Out
                        </span>
                      </div>
                    )}

                    {p.badge && (
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-[#8b1e2d] px-2.5 py-1 text-[10px] font-semibold text-[#fef4da]">
                        {p.badge}
                      </span>
                    )}
                    {d > 0 && (
                      <span className="absolute right-2 top-2 z-10 rounded-full bg-[#d4a017] px-2.5 py-1 text-[10px] font-semibold text-white">
                        -{d}%
                      </span>
                    )}

                    <div className="absolute inset-0 z-20 hidden items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setActionModal('edit');
                        }}
                        className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#8b1e2d] transition hover:bg-[#fef4da]"
                      >
                        <CiEdit /> Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ product: p, isOpen: true })
                        }
                        className="flex items-center gap-1.5 rounded-xl bg-[#e53935] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#c62828]"
                      >
                        <FaRegTrashAlt /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="p-3">
                    <span className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-[#d4a017] sm:text-[12px] lg:text-[13px]">
                      {p.category}
                    </span>
                    <span className="mt-0.5 block text-[10px] font-medium uppercase tracking-[0.18em] text-[#8b1e2d]/70 sm:text-[11px] lg:text-[12px]">
                      {p.subcategory}
                    </span>
                    <h4 className="mt-1 line-clamp-2 text-sm font-semibold leading-tight text-[#4d2b1f] sm:text-base lg:text-lg">
                      {p.name}
                    </h4>
                  </div>
                </div>

                <div className="mt-auto border-t border-[#f3d48a]/70 bg-linear-to-r from-[#fff8ef] to-[#fef4da] p-3">
                  <div className="flex flex-col gap-2">
                    <div className="min-w-0">
                      <span className="block text-base font-bold text-[#8b1e2d] sm:text-lg lg:text-xl">
                        ₹{displayPrice.toLocaleString('en-IN')}/-
                      </span>
                      {displayOriginalPrice && (
                        <span className="ml-1 block text-xs text-[#8a6a4a] line-through sm:text-sm">
                          ₹{displayOriginalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 md:hidden">
                      <button
                        onClick={() => {
                          setEditingProduct(p);
                          setActionModal('edit');
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-[#8b1e2d] transition hover:bg-[#fef4da]"
                      >
                        <CiEdit /> Edit
                      </button>
                      <button
                        onClick={() =>
                          setDeleteConfirm({ product: p, isOpen: true })
                        }
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-[#e53935] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#c62828]"
                      >
                        <FaRegTrashAlt /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {actionModal !== 'none' && (
        <UpdateCatalogue
          key={`${actionModal}-${editingProduct?._id ?? 'new'}`}
          action={actionModal}
          closeModal={() => {
            setActionModal('none');
            setEditingProduct(undefined);
          }}
          product={actionModal === 'edit' ? editingProduct : undefined}
        />
      )}

      {deleteConfirm.isOpen && (
        <DeleteConfirmModal
          product={deleteConfirm.product}
          onConfirm={() => {
            // deleteProduct(deleteConfirm.product._id, () => {
            //   setDeleteConfirm(null);
            // });
          }}
          onCancel={() =>
            setDeleteConfirm({
              product: {
                _id: '',
                name: '',
                category: '',
                description: '',
                price: 0,
                image: '',
              },
              isOpen: false,
            })
          }
        />
      )}
    </div>
  );
};

export default ProductCatalogue;
