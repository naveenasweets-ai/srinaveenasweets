import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import type { CartItem } from '../../types/contextTypes';
import { useStore } from '../../context/StoreContext';
import { generateSlug } from '../../utils/utils';

const CartItemCard = () => {
  const { cart } = useStore();

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
                return (
                  <tr key={i}>
                    <td className="lg:py-4">
                      <div className="lg:flex gap-4 items-center">
                        <Link
                          to={`${generateSlug(item.product._id, item.product.name)}`}
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
                            {item.product.inventoryType === 'unit'
                              ? 'unit(s)'
                              : 'kg'}
                          </p>
                          <div
                            className="font-semibold mt-4 w-fit text-xs cursor-pointer"
                            style={{ color: 'var(--color-accent)' }}
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
                      ₹ {item.product.price}.00
                    </td>
                    <td className="lg:py-4">
                      <div className="flex flex-col-reverse lg:flex-row justify-center items-center">
                        <button className="border rounded-md py-2 px-4 text-[1.2rem]">
                          -
                        </button>
                        <p
                          className="text-center p-2 lg:w-8"
                          style={{ color: 'var(--color-text)' }}
                        >
                          {item.quantity}
                        </p>
                        <button className="border rounded-md py-2 px-4 text-[1.2rem]">
                          +
                        </button>
                      </div>
                    </td>
                    <td className="py-4" style={{ color: 'var(--color-text)' }}>
                      ₹ {item.quantity * item.product.price}.00
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile stacked view */}
        <div className="md:hidden space-y-4">
          {displayCart.map((item: CartItem, i: number) => (
            <div
              key={i}
              className="flex items-start gap-4 p-3 rounded-md"
              style={{ backgroundColor: 'transparent' }}
            >
              <Link to={`/${item.product.category}/${item.product.name}`}>
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
                    ₹ {item.quantity * item.product.price}.00
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button className="border rounded-md px-3 py-1">-</button>
                    <span
                      className="px-2"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {item.quantity}
                    </span>
                    <button className="border rounded-md px-3 py-1">+</button>
                  </div>
                  <div
                    className="text-xs text-right"
                    style={{ color: 'var(--color-muted)' }}
                  >
                    {item.product.inventoryType === 'unit' ? 'unit(s)' : 'kg'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CartItemCard;
