import { useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import CartItemCard from '../../components/cart/cart-item-card';
import { Link } from 'react-router-dom';

const CartPage = () => {
  const { cart, cartTotal, cartCount } = useStore();

  const DELIVERY_FEE = parseFloat(import.meta.env.VITE_DELIVERY_FEE || '40');
  const FREE_DELIVERY_THRESHOLD = parseFloat(import.meta.env.VITE_FREE_DELIVERY_THRESHOLD || '499');
  const PLATFORM_FEE = parseFloat(import.meta.env.VITE_PLATFORM_FEE || '29');
  const PACKAGING_FEE = parseFloat(import.meta.env.VITE_PACKAGING_FEE || '15');
  const GST_RATE = parseFloat(import.meta.env.VITE_GST_RATE || '5') / 100;

  const displayCart = useMemo(() => cart, [cart]);
  const hasItems = displayCart.length > 0;

  const platformFee = PLATFORM_FEE;
  const packagingFee = PACKAGING_FEE;
  const gstAmount = cartTotal * GST_RATE;
  const deliveryFee =
    cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total =
    cartTotal + platformFee + packagingFee + gstAmount + deliveryFee;

  const freeDeliveryProgress = Math.min(
    (cartTotal / FREE_DELIVERY_THRESHOLD) * 100,
    100,
  );
  const amountToFreeDelivery = Math.max(
    FREE_DELIVERY_THRESHOLD - cartTotal,
    0,
  );

  const isEligibleForFreeDelivery = cartTotal >= FREE_DELIVERY_THRESHOLD;

  const [openBreakdown, setOpenBreakdown] = useState(false);

  return hasItems ? (
    <>
      <div
        className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
        style={{ backgroundColor: 'var(--color-background)' }}
      >
        <div className="mx-auto max-w-7xl">
          <div
            className="mb-6 rounded-2xl border p-6 shadow-sm sm:p-8"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1
                  className="text-3xl font-semibold"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Your Cart
                </h1>
              </div>
              <div
                className="w-fit rounded-full px-4 py-2 text-sm font-medium"
                style={{
                  backgroundColor: 'var(--color-surface-alt)',
                  color: 'var(--color-primary)',
                }}
              >
                {displayCart.length}{' '}
                {displayCart.length === 1 ? 'item' : 'items'}
              </div>
            </div>
          </div>
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
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="flex justify-between mb-2 text-sm">
                  <span>Subtotal</span>
                  <span>₹ {cartTotal.toFixed(2)}</span>
                </div>

                {isEligibleForFreeDelivery ? (
                  <div className="flex justify-between mb-2 text-sm">
                    <span className="text-green-600 font-medium">
                      Delivery
                    </span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                ) : (
                  <div className="flex justify-between mb-2 text-sm">
                    <span>Delivery Fee</span>
                    <span>₹ {DELIVERY_FEE.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between mb-2 text-sm">
                  <span>GST (5%)</span>
                  <span>₹ {gstAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between mb-2 text-sm">
                  <span>Packaging</span>
                  <span>₹ {packagingFee.toFixed(2)}</span>
                </div>

                <div className="flex justify-between mb-2 text-sm">
                  <span>Platform Fee</span>
                  <span>₹ {platformFee.toFixed(2)}</span>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between mb-3">
                  <span className="font-semibold">Total</span>
                  <span className="font-semibold">
                    ₹ {total.toFixed(2)}
                  </span>
                </div>

                {!isEligibleForFreeDelivery && amountToFreeDelivery > 0 && (
                  <div className="mb-4 p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                    <div className="flex justify-between mb-1">
                      <span style={{ color: 'var(--color-text)' }}>Free Delivery Progress</span>
                      <span style={{ color: 'var(--color-accent)' }}>
                        ₹ {amountToFreeDelivery.toFixed(2)} away
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${freeDeliveryProgress}%`,
                          backgroundColor: 'var(--color-accent)',
                        }}
                      />
                    </div>
                  </div>
                )}

                {isEligibleForFreeDelivery && (
                  <div className="mb-4 p-3 rounded-lg text-xs font-medium text-center" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                    🎉 You unlocked FREE DELIVERY!
                  </div>
                )}

                <Link
                  to="/checkout"
                  className="text-white py-2.5 px-4 rounded-lg mt-2 w-full text-center font-medium"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                  state={{
                    data: displayCart,
                    total,
                    subtotal: cartTotal,
                    deliveryFee,
                    gstAmount,
                    packagingFee,
                    platformFee,
                    count: cartCount,
                  }}
                >
                  Proceed to Checkout
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
                ₹ {total.toFixed(2)}
              </div>
              {isEligibleForFreeDelivery && (
                <div className="text-xs text-green-600 font-medium">
                  Free Delivery Applied
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOpenBreakdown(true)}
                className="py-2.5 px-4 rounded-md font-medium border"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  backgroundColor: 'transparent',
                }}
              >
                Price Breakdown
              </button>
              <Link
                to="/checkout"
                state={{
                  data: displayCart,
                  total,
                  subtotal: cartTotal,
                  deliveryFee,
                  gstAmount,
                  packagingFee,
                  platformFee,
                  count: cartCount,
                }}
                className="py-2.5 px-5 rounded-md text-white font-medium"
                style={{ backgroundColor: 'var(--color-accent)' }}
              >
                Checkout
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile price breakdown drawer */}
        {openBreakdown && (
          <div className="md:hidden fixed inset-0 z-20">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpenBreakdown(false)}
            />
            <div
              className="absolute bottom-0 left-0 right-0 rounded-t-2xl p-5 pb-8 flex flex-col gap-3"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderTop: '1px solid var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: 'var(--color-text)' }}
                >
                  Price Breakdown
                </h3>
                <button
                  type="button"
                  onClick={() => setOpenBreakdown(false)}
                  className="text-2xl leading-none"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text)' }}>Subtotal</span>
                <span style={{ color: 'var(--color-text)' }}>
                  ₹ {cartTotal.toFixed(2)}
                </span>
              </div>

              {isEligibleForFreeDelivery ? (
                <div className="flex justify-between text-sm">
                  <span className="text-green-600 font-medium">Delivery</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--color-text)' }}>Delivery Fee</span>
                  <span style={{ color: 'var(--color-text)' }}>
                    ₹ {DELIVERY_FEE.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text)' }}>GST (5%)</span>
                <span style={{ color: 'var(--color-text)' }}>
                  ₹ {gstAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text)' }}>Packaging</span>
                <span style={{ color: 'var(--color-text)' }}>
                  ₹ {packagingFee.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text)' }}>Platform Fee</span>
                <span style={{ color: 'var(--color-text)' }}>
                  ₹ {platformFee.toFixed(2)}
                </span>
              </div>

              <hr className="my-1" style={{ borderColor: 'var(--color-border)' }} />

              <div className="flex justify-between">
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  Total
                </span>
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                  ₹ {total.toFixed(2)}
                </span>
              </div>

              {!isEligibleForFreeDelivery && amountToFreeDelivery > 0 && (
                <div className="mt-2 p-3 rounded-lg text-xs" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                  <div className="flex justify-between mb-1">
                    <span style={{ color: 'var(--color-text)' }}>Free Delivery Progress</span>
                    <span style={{ color: 'var(--color-accent)' }}>
                      ₹ {amountToFreeDelivery.toFixed(2)} away
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--color-border)' }}>
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${freeDeliveryProgress}%`,
                        backgroundColor: 'var(--color-accent)',
                      }}
                    />
                  </div>
                </div>
              )}

              {isEligibleForFreeDelivery && (
                <div className="mt-2 p-3 rounded-lg text-xs font-medium text-center" style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>
                  🎉 You unlocked FREE DELIVERY!
                </div>
              )}
            </div>
          </div>
        )}
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
