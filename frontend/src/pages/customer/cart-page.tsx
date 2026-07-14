import { useMemo } from 'react';
import { useStore } from '../../context/StoreContext';
import CartItemCard from '../../components/cart/cart-item-card';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cart, cartTotal, cartCount } = useStore();

  const displayCart = useMemo(() => cart, [cart]);
  const hasItems = displayCart.length > 0;

  return hasItems ? (
    <>
      <div
        className="py-8 pb-24 lg:pb-8 lg:min-h-screen"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="container mx-auto px-4">
          <h1
            className="text-2xl font-semibold mb-4"
            style={{ color: 'var(--color-primary)' }}
          >
            Shopping Cart
          </h1>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <CartItemCard />
            <div className="md:w-1/4 w-full hidden lg:flex flex-col gap-4">
              <div
                className="rounded-lg shadow-md p-6 flex flex-col"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                <h2 className="text-lg font-semibold mb-4">Summary</h2>
                <div className="flex justify-between mb-2">
                  <span>Subtotal</span>
                  <span>₹ {cartTotal.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    ₹ {cartTotal.toFixed(2)}
                  </span>
                </div>
                <Link
                  to="/checkout"
                  className="text-white py-2 px-4 rounded-lg mt-4 w-full text-center"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                  state={{
                    data: displayCart,
                    total: cartTotal,
                    count: cartCount,
                  }}
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Mobile checkout bar */}
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 p-3 z-10"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-sm" style={{ color: 'var(--color-muted)' }}>
                Total
              </div>
              <div
                className="font-semibold"
                style={{ color: 'var(--color-text)' }}
              >
                ₹ {cartTotal.toFixed(2)}
              </div>
            </div>
            <Link
              to="/checkout"
              state={{ data: displayCart, total: cartTotal, count: cartCount }}
              className="py-2 px-4 rounded-md text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </>
  ) : (
    <>
      <div
        className="lg:min-h-screen flex justify-center items-center lg:p-12 my-12"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="w-full max-w-md flex flex-col items-center text-center px-4">
          <h4
            className="lg:text-[3rem] text-[1.6rem] font-googleBiscuits"
            style={{ color: 'var(--color-muted)' }}
          >
            No items in cart
          </h4>
          <p className="mt-4 text-sm" style={{ color: 'var(--color-text)' }}>
            Browse our categories and add delicious items to your cart.
          </p>
        </div>
      </div>
    </>
  );
};

export default CartPage;
