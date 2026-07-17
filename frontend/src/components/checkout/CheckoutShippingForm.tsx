import { Link } from 'react-router-dom';
import type { CheckoutShippingFormProps } from '../../types/types';

const CheckoutShippingForm = ({
  form,
  errors,
  onChange,
  paymentMethod,
  onPaymentMethodChange,
  isSubmitting,
  onSubmit,
}: CheckoutShippingFormProps) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="w-full lg:w-2/3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-accent)">
            Checkout
          </p>
          <h1 className="text-2xl font-semibold">Shipping and payment</h1>
        </div>
        <Link to="/cart" className="text-sm font-medium text-(--color-accent)">
          Back to cart
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Full name</label>
          <input
            value={form.fullName}
            onChange={(event) => onChange('fullName', event.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => onChange('email', event.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <input
            value={form.phone}
            onChange={(event) => onChange('phone', event.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Pincode</label>
          <input
            value={form.pincode}
            onChange={(event) => onChange('pincode', event.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.pincode && (
            <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Address</label>
          <textarea
            value={form.address}
            onChange={(event) => onChange('address', event.target.value)}
            className="min-h-22.5 w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">City</label>
          <input
            value={form.city}
            onChange={(event) => onChange('city', event.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.city && (
            <p className="mt-1 text-sm text-red-500">{errors.city}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">State</label>
          <input
            value={form.state}
            onChange={(event) => onChange('state', event.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.state && (
            <p className="mt-1 text-sm text-red-500">{errors.state}</p>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Payment method</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label
            className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${paymentMethod === 'cod' ? 'border-(--color-accent) bg-(--color-accent-light)' : 'border-(--color-border)'}`}
          >
            <div>
              <p className="font-medium">Cash on delivery</p>
              <p className="text-sm text-(--color-muted)">
                Pay at the time of delivery
              </p>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              className="h-4 w-4"
              checked={paymentMethod === 'cod'}
              onChange={() => onPaymentMethodChange('cod')}
            />
          </label>
          <label
            className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${paymentMethod === 'razorpay' ? 'border-(--color-accent) bg-(--color-accent-light)' : 'border-(--color-border)'}`}
          >
            <div>
              <p className="font-medium">Razorpay</p>
              <p className="text-sm text-(--color-muted)">
                Secure card / UPI / netbanking
              </p>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              className="h-4 w-4"
              checked={paymentMethod === 'razorpay'}
              onChange={() => onPaymentMethodChange('razorpay')}
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full rounded-lg bg-(--color-accent) px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting
          ? 'Placing order...'
          : paymentMethod === 'razorpay'
            ? 'Pay and place order'
            : 'Place order'}
      </button>
    </form>
  );
};

export default CheckoutShippingForm;
