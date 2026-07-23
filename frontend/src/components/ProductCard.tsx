import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import type { Product } from '../types/contextTypes';
import {
  getProductInventoryState,
  getProductPrice,
  getProductOriginalPrice,
  getWeightOptions,
} from '../utils/productInventory';
import { generateSlug, stripHtml } from '../utils/utils';
import CustomerUtils from '../utils/customer';
import { getDefaultInventorySelection } from '../utils/productInventory';

export default function ProductCard({ product }: { product: Product }) {
  const { isInWishlist, user } = useStore();
  const { addToCart, toggleWishlist } = CustomerUtils();
  const displayPrice = getProductPrice(product);
  const displayOriginalPrice = getProductOriginalPrice(product);
  const discount = displayOriginalPrice
    ? Math.round(
        ((displayOriginalPrice - displayPrice) / displayOriginalPrice) * 100,
      )
    : 0;

  const liked = isInWishlist(product._id);
  const inventoryState = getProductInventoryState(product);
  const outOfStock = inventoryState.isOutOfStock;
  const isAdmin = user.role === 'admin';
  const productUrl = `/product/${generateSlug(product._id, product.name)}`;
  const weightOptions = getWeightOptions(product);
  const defaultWeight = getDefaultInventorySelection(product);
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState<string>(defaultWeight);

  const handleAddToCart = (e: React.MouseEvent) => {
    if (user.role === 'admin') return;
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, quantity, selectedWeight);
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-(--color-border) bg-(--color-surface) shadow-[0_10px_30px_rgba(95,16,33,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-(--color-accent) hover:shadow-[0_22px_48px_-24px_rgba(26,15,15,0.35)]">
      {/* Image section */}
      <div className="flex flex-col">
        <Link
          to={productUrl}
          className="relative block aspect-3/4 overflow-hidden bg-(--color-surface-alt) cursor-pointer"
        >
          <img
            src={product.image}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
              outOfStock ? 'opacity-65 grayscale-30' : ''
            }`}
          />

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-(--color-primary-dark)/70 backdrop-blur-[2px]">
              <span className="rounded-full border border-(--color-accent)/60 bg-(--color-primary) px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-(--color-accent-light) shadow-2xl">
                Out of stock
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="pointer-events-none absolute left-3 top-3 z-10 flex flex-col gap-1.5">
            {product.badge && (
              <span className="rounded-full bg-(--color-primary) px-2.5 py-1 text-[9px] font-bold tracking-[0.2em] text-(--color-accent-light) shadow-lg">
                {product.badge.toUpperCase()}
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-full bg-(--color-accent) px-2.5 py-1 text-[9px] font-extrabold tracking-[0.2em] text-(--color-primary-dark) shadow-lg">
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* Wishlist toggle */}
          {!isAdmin && (
            <button
              onClick={(e) => {
                if (user.role === 'admin') return;
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist(product._id);
              }}
              className={`absolute right-3 top-3 z-10 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full shadow-lg transition-all sm:h-10 sm:w-10 ${
                liked
                  ? 'scale-100 bg-(--color-primary) text-(--color-accent)'
                  : 'bg-(--color-surface)/95 text-(--color-primary-dark) backdrop-blur-sm hover:bg-(--color-surface) hover:text-(--color-primary)'
              }`}
              title={liked ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <svg
                viewBox="0 0 24 24"
                fill={liked ? 'currentColor' : 'none'}
                stroke="currentColor"
                strokeWidth={liked ? 0 : 1.8}
                className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          )}

          {/* Quantity & weight controls on hover for larger screens */}
          {!outOfStock && !isAdmin && (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 hidden p-3 transition-transform duration-300 group-hover:translate-y-0 md:pointer-events-auto md:flex md:translate-y-full"
            >
              <div className="grid grid-cols-2 w-full items-center gap-2 rounded-xl bg-(--color-surface)/95 backdrop-blur-sm border border-(--color-border) p-1.5">
                {product.inventoryType === 'weight' &&
                  weightOptions.length > 0 && (
                    <select
                      value={selectedWeight}
                      onChange={(e) => setSelectedWeight(e.target.value)}
                      className="h-9 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-xs font-semibold text-(--color-primary-dark) focus:border-(--color-accent) focus:outline-none"
                    >
                      {weightOptions.map((option) => (
                        <option
                          key={`${option.value}${option.unit}`}
                          value={String(option.value)}
                        >
                          {option.value} g
                        </option>
                      ))}
                    </select>
                  )}
                <div className="flex items-center border border-(--color-border) rounded-lg">
                  <button
                    onClick={(e) => {
                      if (user.role === 'admin') return;
                      e.preventDefault();
                      e.stopPropagation();
                      setQuantity((q) => Math.max(1, q - 1));
                    }}
                    className="h-9 w-9 cursor-pointer items-center justify-center rounded-l-lg text-(--color-primary-dark) transition hover:bg-(--color-surface-alt) hover:text-(--color-accent) active:scale-95"
                  >
                    −
                  </button>
                  <span className="min-w-[2.25rem] text-center text-sm font-bold text-(--color-primary-dark)">
                    {quantity}
                  </span>
                  <button
                    onClick={(e) => {
                      if (user.role === 'admin') return;
                      e.preventDefault();
                      e.stopPropagation();
                      setQuantity((q) => q + 1);
                    }}
                    className="h-9 w-9 cursor-pointer items-center justify-center rounded-r-lg text-(--color-primary-dark) transition hover:bg-(--color-surface-alt) hover:text-(--color-accent) active:scale-95"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className={`flex h-9 flex-1 cursor-pointer items-center justify-center rounded-lg bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-light)_100%)] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-(--color-accent-light) shadow-md transition-all hover:brightness-110 active:scale-[0.97] ${product.inventoryType === 'weight' ? 'col-span-2' : ''}`}
                >
                  ADD TO BAG
                </button>
              </div>
            </div>
          )}
        </Link>

        {!outOfStock && !isAdmin && (
          <div className="px-3 pb-3 pt-3 md:hidden">
            <div className="grid grid-cols-2 w-full items-center gap-2">
              {product.inventoryType === 'weight' &&
                weightOptions.length > 0 && (
                  <select
                    value={selectedWeight}
                    onChange={(e) => setSelectedWeight(e.target.value)}
                    className="h-10 rounded-lg border border-(--color-border) bg-(--color-surface) px-2 text-xs font-semibold text-(--color-primary-dark) focus:border-(--color-accent) focus:outline-none"
                  >
                    {weightOptions.map((option) => (
                      <option
                        key={`${option.value}${option.unit}`}
                        value={String(option.value)}
                      >
                        {option.value} g
                      </option>
                    ))}
                  </select>
                )}
              <div
                className={`flex items-center justify-between border border-(--color-border) rounded-lg ${product.inventoryType === 'weight' ? '' : 'col-span-2'}`}
              >
                <button
                  onClick={(e) => {
                    if (user.role === 'admin') return;
                    e.preventDefault();
                    e.stopPropagation();
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-l-lg text-(--color-primary-dark) transition hover:bg-(--color-surface-alt) hover:text-(--color-accent) active:scale-95 font-bold"
                >
                  −
                </button>
                <span className="flex min-w-[2.5rem] items-center justify-center text-sm font-bold text-(--color-primary-dark)">
                  {quantity}
                </span>
                <button
                  onClick={(e) => {
                    if (user.role === 'admin') return;
                    e.preventDefault();
                    e.stopPropagation();
                    setQuantity((q) => q + 1);
                  }}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-r-lg text-(--color-primary-dark) transition hover:bg-(--color-surface-alt) hover:text-(--color-accent) active:scale-95 font-bold"
                >
                  +
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex col-span-2 h-10 flex-1 cursor-pointer items-center justify-center rounded-xl bg-[linear-gradient(135deg,var(--color-primary)_0%,var(--color-primary-light)_100%)] px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-(--color-accent-light) shadow-lg transition-all hover:brightness-110 active:scale-[0.97]"
              >
                ADD TO BAG
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Info section */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-4">
        <Link
          to={productUrl}
          className="mb-1 cursor-pointer text-[9px] font-bold uppercase tracking-[0.24em] text-(--color-accent-dark) hover:underline sm:text-[10px]"
        >
          {product.category}
        </Link>
        <p className="mb-1.5 truncate text-[9px] font-medium text-(--color-muted) sm:text-[10px]">
          {product.subcategory}
        </p>
        <Link
          to={productUrl}
          className="font-display mb-1.5 cursor-pointer text-sm font-bold leading-tight text-(--color-primary-dark) transition-colors hover:text-(--color-primary) sm:text-base lg:text-lg"
        >
          {product.name}
        </Link>
        {product.description && (
          <p className="line-clamp-3 mb-2 text-xs text-(--color-muted) leading-relaxed">
            {stripHtml(product.description)}
          </p>
        )}

        {/* Price */}
        <div className="mt-auto flex items-baseline justify-between gap-2 border-t border-(--color-border) pt-2.5">
          <div>
            <span className="font-display text-base font-bold text-(--color-primary-dark) sm:text-lg lg:text-xl">
              ₹{displayPrice.toLocaleString('en-IN')}
            </span>
            {displayOriginalPrice && (
              <span className="ml-2 text-xs text-(--color-muted) line-through sm:text-sm">
                ₹{displayOriginalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.gstIncluded && (
              <span className="ml-1.5 rounded bg-(--color-surface-alt) px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-(--color-accent-dark)">
                + GST
              </span>
            )}
          </div>
          {outOfStock && (
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-(--color-muted)">
              Sold Out
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
