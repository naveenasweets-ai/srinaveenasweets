import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CartItem } from '../../types/contextTypes';
import { useStore } from '../../context/StoreContext';
import CustomerUtils from '../../utils/customer';
import { generateSlug } from '../../utils/utils';
import {
  getSelectedWeightOption,
  getOptionPrice,
} from '../../utils/productInventory';

const CartItemCard = () => {
  const { cart } = useStore();
  const { updateQuantity, removeFromCart } = CustomerUtils();

  const displayCart = useMemo(() => cart, [cart]);

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
                return (
                  <tr key={i}>
                    <td className="lg:py-4">
                      <div className="lg:flex gap-4 items-center">
                        <Link
                          to={`/product/${generateSlug(item.product._id, item.product.name)}`}
                        >
                          <img
                            className="w-24 rounded-md"
                            src={item.product.image}
                            alt=""
                          />
                        </Link>
                        <div>
                          <p
                            className="font-semibold"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {item.product.name}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: 'var(--color-muted)' }}
                          >
                            {item.product.description}
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
                          <div
                            className="font-semibold mt-4 w-fit text-xs cursor-pointer"
                            style={{ color: 'var(--color-accent)' }}
                            onClick={() =>
                              removeFromCart(item.product._id, item.weight)
                            }
                          >
                            Remove
                          </div>
                        </div>
                      </div>
                    </td>
                    <td
                      className="lg:py-4 text-nowrap"
                      style={{ color: 'var(--color-text)' }}
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
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-primary) text-(--color-primary) font-bold shadow-sm transition hover:bg-(--color-primary) hover:text-(--color-accent-light) active:scale-95"
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
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-primary) text-(--color-primary) font-bold shadow-sm transition hover:bg-(--color-primary) hover:text-(--color-accent-light) active:scale-95"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4" style={{ color: 'var(--color-text)' }}>
                      ₹ {lineTotal}.00
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
            return (
              <div
                key={i}
                className="flex items-start gap-4 p-3 rounded-md"
                style={{ backgroundColor: 'transparent' }}
              >
                <Link
                  to={`/product/${generateSlug(item.product._id, item.product.name)}`}
                >
                  <img
                    className="w-20 h-20 object-cover rounded-md"
                    src={item.product.image}
                    alt=""
                  />
                </Link>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p
                        className="font-semibold"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {item.product.name}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {item.product.description}
                      </p>
                    </div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: 'var(--color-text)' }}
                    >
                      ₹ {item.quantity * mobileUnitPrice}.00
                      {item.product.gstIncluded && (
                        <span className="ml-1.5 rounded bg-(--color-surface-alt) px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-(--color-accent-dark)">
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
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-primary) text-(--color-primary) font-bold shadow-sm transition hover:bg-(--color-primary) hover:text-(--color-accent-light) active:scale-95"
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
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-(--color-primary) text-(--color-primary) font-bold shadow-sm transition hover:bg-(--color-primary) hover:text-(--color-accent-light) active:scale-95"
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
                        {item.product.inventoryType === 'unit'
                          ? 'unit(s)'
                          : 'g'}
                      </div>
                      <div
                        className="text-xs font-semibold cursor-pointer"
                        style={{ color: 'var(--color-accent)' }}
                        onClick={() =>
                          removeFromCart(item.product._id, item.weight)
                        }
                      >
                        Remove
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
