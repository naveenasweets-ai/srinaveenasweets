/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
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
  isPincodeDeliverable,
  savedAddress,
  hasSavedAddresses,
  onChangeAddress,
}: CheckoutShippingFormProps) => {
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const handleAddressSelect = useCallback(
    (data: any) => {
      onChange('address', data.address);
      onChange('city', data.city);
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
          {savedAddress && (
            <p className="text-sm text-(--color-muted)">
              Selected: {savedAddress.fullname}, {savedAddress.fullAddress}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 whitespace-nowrap">
          {hasSavedAddresses && onChangeAddress && (
            <button
              type="button"
              onClick={onChangeAddress}
              className="text-sm font-medium text-(--color-accent)"
            >
              Change address
            </button>
          )}
          <Link
            to="/cart"
            className="text-sm font-medium text-(--color-accent)"
          >
            Back to cart
          </Link>
        </div>
      </div>

      <div className="lg:grid flex flex-col gap-4 lg:grid-cols-2">
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
          <button
            type="button"
            onClick={() => setIsLocationPickerOpen(true)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-left text-sm font-medium text-(--color-muted) hover:border-(--color-accent) transition"
          >
            {form.lat !== 0 || form.lng !== 0 ? (
              `Location selected`
            ) : errors.lat || errors.lng ? (
              <p className="mt-1 text-sm text-red-500">{errors.lat}</p>
            ) : (
              'Click to select exact location on map'
            )}
          </button>
        </div>

        {isLocationPickerOpen && (
          <div className="col-span-2">
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
              <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-2xl">
                <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-border)">
                  <h3 className="text-lg font-semibold">
                    Select location on map
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsLocationPickerOpen(false)}
                    className="text-sm text-(--color-muted) hover:text-(--color-primary-dark) transition"
                  >
                    Close
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <LocationPicker
                    lat={form.lat}
                    lng={form.lng}
                    onAddressSelect={handleAddressSelect}
                    onClose={() => setIsLocationPickerOpen(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 grid-cols-1 gap-2 col-span-2">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input
              value={form.city}
              disabled
              onChange={(event) => onChange('city', event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-500">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">State</label>
            <input
              value={form.state}
              disabled
              onChange={(event) => onChange('state', event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
            {errors.state && (
              <p className="mt-1 text-sm text-red-500">{errors.state}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Pincode</label>
            <input
              value={form.pincode}
              disabled
              onChange={(event) => onChange('pincode', event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            />
            {errors.pincode && (
              <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
            )}
          </div>
        </div>
        {!isPincodeDeliverable && form.pincode.length === 6 && (
          <p className="col-span-2 lg:text-end text-sm text-red-500">
            Delivery to this pincode is currently unavailable. We are delivering
            only in and around <b>Guntur</b>.
          </p>
        )}
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
            className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${paymentMethod === 'cod' ? 'border-(--color-accent) bg-(--color-accent-light)' : 'border-(--color-border)'} ${!isPincodeDeliverable ? 'opacity-60' : ''}`}
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
              disabled={!isPincodeDeliverable}
              onChange={() => onPaymentMethodChange('cod')}
            />
          </label>
          <label
            className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 ${paymentMethod === 'razorpay' ? 'border-(--color-accent) bg-(--color-accent-light)' : 'border-(--color-border)'} ${!isPincodeDeliverable ? 'opacity-60' : ''}`}
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
              disabled={!isPincodeDeliverable}
              onChange={() => onPaymentMethodChange('razorpay')}
            />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !isPincodeDeliverable}
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
