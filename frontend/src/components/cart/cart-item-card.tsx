import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CartItem } from '../../types/contextTypes';
import { useStore } from '../../context/StoreContext';
import CustomerUtils from '../../utils/customer';
import { generateSlug, stripHtml } from '../../utils/utils';
import {
  getSelectedWeightOption,
  getOptionPrice,
} from '../../utils/productInventory';

const CartItemCard = () => {
  const { cart } = useStore();
  const { updateQuantity, removeFromCart } = CustomerUtils();

  const displayCart = useMemo(() => cart, [cart]);

  const isOutOfStock = (item: CartItem) => {
    const option = getSelectedWeightOption(item.product, item.weight);
    if (!option) return true;
    const stock = option.stock;
    if (stock === undefined || stock === null) return false;
    return stock <= 0;
  };

  return (
    <div className="md:w-3/4 w-full">
      <div
        className="rounded-lg shadow-md lg:p-6 p-3 mb-4"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
        }}
      >
        {/* Desktop/table view */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr>
                <th
                  className="text-left font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Product
                </th>
                <th
                  className="text-left font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Price
                </th>
                <th
                  className="text-center font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Quantity
                </th>
                <th
                  className="text-left font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {displayCart.map((item: CartItem, i: number) => {
                const selectedOption = getSelectedWeightOption(
                  item.product,
                  item.weight,
                );
                const unitPrice = getOptionPrice(selectedOption);
                const lineTotal = unitPrice * item.quantity;
                const outOfStock = isOutOfStock(item);
                return (
                  <tr
                    key={i}
                    style={{
                      opacity: outOfStock ? 0.6 : 1,
                    }}
                  >
                    <td className="lg:py-4">
                      <div className="lg:flex gap-4 items-center">
                        <Link
                          to={`/product/${generateSlug(item.product._id, item.product.name)}`}
                        >
                          <img
                            className={`w-24 rounded-md ${outOfStock ? 'grayscale' : ''}`}
                            src={item.product.image}
                            alt=""
                          />
                        </Link>
                        <div className="min-w-0 max-w-[20rem]">
                          <p
                            className={`font-semibold ${outOfStock ? 'line-through text-gray-400' : ''}`}
                            style={{ color: outOfStock ? undefined : 'var(--color-primary)' }}
                          >
                            {item.product.name}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: 'var(--color-muted)' }}
                          >
                            {stripHtml(item.product.description)}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--color-muted)' }}
                          >
                            {item.quantity}{' '}
                            {item.product.inventoryType === 'weight' ? 'x' : ''}{' '}
                            {item.weight}{' '}
                            {item.product.inventoryType === 'unit'
                              ? 'unit(s)'
                              : 'g'}
                          </p>
                          {outOfStock && (
                            <span className="inline-block mt-1 rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-700">
                              Out of stock
                            </span>
                          )}
                          <div
                            className="font-semibold mt-4 w-fit text-xs cursor-pointer"
                            style={{ color: 'var(--color-accent)' }}
                            onClick={() =>
                              removeFromCart(item.product._id, item.weight)
                            }
                          >
                            {outOfStock ? 'Remove' : 'Remove'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="lg:py-4 text-nowrap"
                      style={{ color: 'var(--color-text)', textDecoration: outOfStock ? 'line-through' : undefined }}
                    >
                      ₹ {unitPrice}.00
                      {item.product.gstIncluded && (
                        <span className="ml-1.5 rounded bg-(--color-surface-alt) px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-(--color-accent-dark)">
                          + GST
                        </span>
                      )}
                    </td>
                    <td className="lg:py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity - 1,
                              item.weight,
                            )
                          }
                          disabled={outOfStock}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-primary) text-(--color-primary) font-bold shadow-sm transition hover:bg-(--color-primary) hover:text-(--color-accent-light) active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          -
                        </button>
                        <span
                          className="w-8 text-center font-semibold"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.product._id,
                              item.quantity + 1,
                              item.weight,
                            )
                          }
                          disabled={outOfStock}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-primary) text-(--color-primary) font-bold shadow-sm transition hover:bg-(--color-primary) hover:text-(--color-accent-light) active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td
                      className="py-4"
                      style={{ color: 'var(--color-text)', textDecoration: outOfStock ? 'line-through' : undefined }}
                    >
                      ₹ {lineTotal}.00
                      {outOfStock && (
                        <span className="ml-2 text-[10px] text-red-500 font-semibold">
                          (excluded)
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked view */}
        <div className="md:hidden space-y-4">
          {displayCart.map((item: CartItem, i: number) => {
            const mobileOption = getSelectedWeightOption(
              item.product,
              item.weight,
            );
            const mobileUnitPrice = getOptionPrice(mobileOption);
            const outOfStock = isOutOfStock(item);
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-3 rounded-md"
                style={{
                  backgroundColor: 'transparent',
                  opacity: outOfStock ? 0.6 : 1,
                }}
              >
                <Link
                  to={`/product/${generateSlug(item.product._id, item.product.name)}`}
                >
                  <img
                    className={`w-20 h-20 object-cover rounded-md ${outOfStock ? 'grayscale' : ''}`}
                    src={item.product.image}
                    alt=""
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p
                        className={`font-semibold ${outOfStock ? 'line-through text-gray-400' : ''}`}
                        style={{ color: outOfStock ? undefined : 'var(--color-primary)' }}
                      >
                        {item.product.name}
                      </p>
                      <p
                        className="text-xs mt-1 truncate"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {stripHtml(item.product.description)}
                      </p>
                    </div>
                    <div
                      className="text-sm font-semibold flex flex-col items-end"
                      style={{ color: 'var(--color-text)', textDecoration: outOfStock ? 'line-through' : undefined }}
                    >
                      <span className="whitespace-nowrap">
                        ₹ {item.quantity * mobileUnitPrice}.00
                      </span>
                      {item.product.gstIncluded && (
                        <span className="ml-1.5 whitespace-nowrap rounded bg-(--color-surface-alt) px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-(--color-accent-dark)">
                          + GST
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.quantity - 1,
                            item.weight,
                          )
                        }
                        disabled={outOfStock}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-primary) text-(--color-primary) font-bold shadow-sm transition hover:bg-(--color-primary) hover:text-(--color-accent-light) active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        -
                      </button>
                      <span
                        className="w-8 text-center font-semibold"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.product._id,
                            item.quantity + 1,
                            item.weight,
                          )
                        }
                        disabled={outOfStock}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-primary) text-(--color-primary) font-bold shadow-sm transition hover:bg-(--color-primary) hover:text-(--color-accent-light) active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div
                        className="text-xs text-right"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {item.quantity}{' '}
                        {item.product.inventoryType === 'weight' ? 'x' : ''}{' '}
                        {item.weight}{' '}
                        {item.product.inventoryType === 'weight' ? 'g' : ''}
                      </div>
                      {outOfStock && (
                        <span className="text-[10px] font-bold text-red-500">
                          Out of stock (excluded from total)
                        </span>
                      )}
                      <div
                        className="text-xs font-semibold cursor-pointer"
                        style={{ color: 'var(--color-accent)' }}
                        onClick={() =>
                          removeFromCart(item.product._id, item.weight)
                        }
                      >
                        {outOfStock ? 'Remove' : 'Remove'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
