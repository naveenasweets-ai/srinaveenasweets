import type { Product } from '../../types/contextTypes';
import { FaRegTrashAlt } from 'react-icons/fa';

export default function DeleteConfirmModal({
  product,
  onConfirm,
  onCancel,
}: {
  product: Product;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <FaRegTrashAlt />
          </div>
          <div className="text-center">
            <h3 className="font-display text-lg font-bold text-maroon-900 mb-2">
              Delete Product?
            </h3>
            <p className="text-sm text-maroon-700/70 mb-4">
              Are you sure you want to delete{' '}
              <span className="font-semibold">"{product.name}"</span>? This
              action cannot be undone.
            </p>
            <div className="bg-maroon-50 rounded-xl p-3 mb-4 flex items-center gap-3">
              <img
                src={product.image}
                alt={product.name}
                className="w-12 h-16 object-cover rounded-lg"
              />
              <div className="text-left flex-1">
                <span className="text-[9px] font-bold text-gold-600 uppercase block">
                  {product.category}
                </span>
                <h4 className="text-sm font-bold text-maroon-900">
                  {product.name}
                </h4>
                <span className="text-xs font-bold text-maroon-900">
                  ₹{product.price.toLocaleString('en-IN')}
                  {product.gstIncluded && (
                    <span className="ml-1.5 rounded bg-[#fff3e0] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-[#9f6c2a]">
                      GST
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border-2 border-gold-200 text-maroon-900 text-sm font-bold hover:bg-gold-50 cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <FaRegTrashAlt /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
