/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { CheckoutShippingFormProps } from '../../types/types';
import LocationPicker from './LocationPicker';

const CheckoutShippingForm = ({
  form,
  errors,
  onChange,
  onAddressSelect,
  paymentMethod,
  onPaymentMethodChange,
  isSubmitting,
  otpCode,
  otpSent,
  otpVerified,
  otpMessage,
  otpTimerSeconds,
  isSendingOtp,
  onOtpCodeChange,
  onSendOtp,
  onSubmit,
}: CheckoutShippingFormProps) => {
  const handleAddressSelect = useCallback(
    (data: any) => {
      onChange('address', data.address);
      onChange('city', data.city );
      onChange('state', data.state);
      onChange('pincode', data.pincode);
      onChange('lat', data.lat);
      onChange('lng', data.lng);
      onAddressSelect(data);
    },
    [onChange, onAddressSelect],
  );

  return (
    <form
      onSubmit={onSubmit}
      className="w-full lg:w-2/3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm"
    >
      <div className="mb-6 flex items-start justify-between">
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
          <label className="mb-1 block text-sm font-medium">Phone</label>
          <div className="flex gap-3">
            <input
              value={form.phone}
              onChange={(event) => {
                let value = event.target.value;
                if (value.startsWith('0')) {
                  value = value.slice(1);
                }
                onChange('phone', value);
              }}
              className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
            />

            {paymentMethod === 'cod' && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div
                  onClick={onSendOtp}
                  className="rounded-lg cursor-pointer whitespace-nowrap border border-(--color-accent) px-3 py-2 text-sm font-medium text-(--color-accent) disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSendingOtp
                    ? 'Sending...'
                    : otpTimerSeconds > 0
                      ? `Resend in ${String(Math.floor(otpTimerSeconds / 60)).padStart(2, '0')}:${String(otpTimerSeconds % 60).padStart(2, '0')}`
                      : otpSent
                        ? 'Resend OTP'
                        : 'Send OTP'}
                </div>
              </div>
            )}
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
          )}
        </div>

        <div className="col-span-2">
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

        <div className="col-span-2">
          <LocationPicker
            lat={form.lat}
            lng={form.lng}
            onAddressSelect={handleAddressSelect}
          />
        </div>

        <div className="grid lg:grid-cols-3 grid-cols-1 gap-2 col-span-2">
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
        </div>
      </div>

      {paymentMethod === 'cod' && otpSent && (
        <div className="mt-8 rounded-xl border border-(--color-border) bg-(--color-background) p-4">
          <div className="mt-4">
            <input
              value={otpCode}
              onChange={(event) => onOtpCodeChange(event.target.value)}
              placeholder="Enter OTP"
              className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
            />
          </div>

          {otpMessage && (
            <p
              className={`mt-3 text-sm ${otpVerified ? 'text-green-600' : 'text-(--color-muted)'}`}
            >
              {otpMessage}
            </p>
          )}
        </div>
      )}

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
        className="mt-8 w-full cursor-pointer rounded-lg bg-(--color-accent) px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting
          ? 'Placing order...'
          : paymentMethod === 'cod' && otpSent && !otpVerified
            ? 'Verify & Place Order'
            : paymentMethod === 'razorpay'
              ? 'Pay and place order'
              : 'Place order'}
      </button>
    </form>
  );
};

export default CheckoutShippingForm;
