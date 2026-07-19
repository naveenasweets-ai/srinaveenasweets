import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OrderConfirmationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    orderId?: string;
    paymentMethod?: 'cod' | 'razorpay';
    message?: string;
  } | null;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(161,40,43,0.12),transparent_55%)] px-4 py-16 text-(--color-text) sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-4xl flex-col items-center rounded-4xl border border-(--color-border) bg-white/80 p-8 text-center shadow-2xl shadow-black/10 backdrop-blur md:p-12">
        <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-200/60" />
          <div className="absolute inset-2 rounded-full bg-green-100" />
          <div className="absolute inset-0 rounded-full border-4 border-green-300/70" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-4xl font-bold text-white shadow-xl">
            ✓
          </div>
        </div>

        <div className="mb-3 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">
          Order confirmed
        </div>

        <h1 className="text-3xl font-semibold sm:text-4xl">
          Your sweets are on the way!
        </h1>
        <p className="mt-4 max-w-2xl text-base text-(--color-text-muted) sm:text-lg">
          {state?.message ||
            'Your order has been placed successfully and we are preparing it for delivery.'}
        </p>

        <div className="mt-8 grid w-full gap-4 rounded-2xl border border-(--color-border) bg-(--color-background) p-5 text-left sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-(--color-text-muted)">
              Payment method
            </p>
            <p className="mt-1 font-semibold">
              {state?.paymentMethod === 'razorpay'
                ? 'Razorpay'
                : 'Cash on Delivery'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-(--color-text-muted)">
              Order ID
            </p>
            <p className="mt-1 font-semibold">
              {state?.orderId || 'Processing...'}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate('/cart')}
            className="rounded-full bg-(--color-accent) px-6 py-3 font-semibold text-white transition hover:scale-105"
          >
            View cart
          </button>
          <button
            onClick={() => navigate('/')}
            className="rounded-full border border-(--color-border) bg-white px-6 py-3 font-semibold transition hover:scale-105"
          >
            Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
