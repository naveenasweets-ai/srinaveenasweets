/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from 'react-router-dom';
import type { CheckoutShippingFormProps } from '../../types/types';
import AddressForm from './AddressForm';
import { useStore } from '../../context/StoreContext';
import { getDistanceInKm } from '../../utils/checkout';

const CheckoutShippingForm = ({
  form,
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
  savedAddress,
  onChangeAddress,
}: CheckoutShippingFormProps) => {
  const { siteContent } = useStore();
  const hasAddressSelected = Boolean(
    savedAddress || (form.address && form.city && form.state && form.pincode),
  );

  const displayAddress = savedAddress
    ? [
        savedAddress.fullAddress,
        savedAddress.city,
        savedAddress.state,
        savedAddress.pincode,
      ]
        .filter(Boolean)
        .join(', ')
    : [form.address, form.city, form.state, form.pincode]
        .filter(Boolean)
        .join(', ');

  const displayName = savedAddress?.fullname || form.fullName;
  const displayPhone = savedAddress?.mobile || form.phone;

  const isPincodeDeliverable = () => {
    return siteContent.outletCoordinates.some((outlet) => {
      const distance = getDistanceInKm(
        outlet.lat,
        outlet.lng,
        form.lat,
        form.lng,
      );
      return distance < 7;
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="w-full lg:w-2/3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm space-y-6"
    >
      <div className="flex items-start justify-between border-b border-(--color-border) pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-accent)">
            Checkout Step 2 of 2
          </p>
          <h1 className="text-2xl font-semibold text-(--color-primary-dark)">
            Payment & Finalize Order
          </h1>
        </div>
        <Link
          to="/cart"
          className="text-xs font-semibold text-(--color-accent) hover:underline"
        >
          ← Back to cart
        </Link>
      </div>

      {/* Delivery Address Summary Card */}
      {hasAddressSelected ? (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface-alt) p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-(--color-primary-dark)">
                📍 Delivery Address
              </span>
              {isPincodeDeliverable() === true ? (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-800">
                  Deliverable
                </span>
              ) : (
                <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-bold text-red-800">
                  Unavailable
                </span>
              )}
            </div>
            {onChangeAddress && (
              <button
                type="button"
                onClick={onChangeAddress}
                className="rounded-lg border border-(--color-accent)/40 px-3 py-1 text-xs font-semibold text-(--color-accent) hover:bg-(--color-accent-light)/20 transition"
              >
                Change Address
              </button>
            )}
          </div>

          <div className="text-xs text-(--color-text) space-y-1 pt-1">
            <p className="font-semibold flex text-sm text-(--color-primary-dark)">
              <span className="font-semibold text-sm text-(--color-primary-dark) py-1 line-clamp-1 w-3/5">
                {displayName}
              </span>{' '}
              <span className='flex items-center'>{displayPhone ? `📞 ${displayPhone}` : ''}</span>
            </p>
            <p className="text-(--color-muted) leading-relaxed">
              {displayAddress}
            </p>
          </div>

          {!isPincodeDeliverable && (
            <p className="text-xs text-red-500 pt-1">
              ⚠️ Delivery to this area is currently unavailable. We deliver only
              within Guntur area.
            </p>
          )}
        </div>
      ) : (
        /* If no address selected, render AddressForm to capture address */
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-(--color-primary-dark)">
            Enter Delivery Address
          </h3>
          <AddressForm
            initialValues={{
              fullname: form.fullName,
              mobile: form.phone,
              fullAddress: form.address,
              city: form.city,
              state: form.state,
              pincode: form.pincode,
              lat: form.lat,
              lng: form.lng,
            }}
            onSubmit={(data) => {
              onChange('fullName', data.fullname);
              onChange('phone', data.mobile);
              onChange('address', data.fullAddress);
              onChange('city', data.city);
              onChange('state', data.state);
              onChange('pincode', data.pincode);
              onChange('lat', data.lat);
              onChange('lng', data.lng);
              onAddressSelect(data);
            }}
            submitLabel="Confirm Address"
          />
        </div>
      )}

      {/* Payment Method Selection */}
      <div className="pt-2">
        <h2 className="text-base font-semibold text-(--color-primary-dark)">
          Select Payment Method
        </h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <label
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
              paymentMethod === 'cod'
                ? 'border-(--color-accent) bg-(--color-accent-light)/20 shadow-xs'
                : 'border-(--color-border) hover:border-(--color-accent)/40'
            } ${!isPincodeDeliverable ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div>
              <p className="font-semibold text-sm text-(--color-primary-dark)">
                Cash on delivery
              </p>
              <p className="text-xs text-(--color-muted)">
                Pay at the time of delivery
              </p>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              className="h-4 w-4 accent-(--color-accent)"
              checked={paymentMethod === 'cod'}
              disabled={!isPincodeDeliverable}
              onChange={() => onPaymentMethodChange('cod')}
            />
          </label>

          <label
            className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all ${
              paymentMethod === 'razorpay'
                ? 'border-(--color-accent) bg-(--color-accent-light)/20 shadow-xs'
                : 'border-(--color-border) hover:border-(--color-accent)/40'
            } ${!isPincodeDeliverable ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div>
              <p className="font-semibold text-sm text-(--color-primary-dark)">
                Razorpay Online Payment
              </p>
              <p className="text-xs text-(--color-muted)">
                UPI, Credit/Debit Cards, Netbanking
              </p>
            </div>
            <input
              type="radio"
              name="paymentMethod"
              className="h-4 w-4 accent-(--color-accent)"
              checked={paymentMethod === 'razorpay'}
              disabled={!isPincodeDeliverable}
              onChange={() => onPaymentMethodChange('razorpay')}
            />
          </label>
        </div>
      </div>

      {/* OTP verification for COD */}
      {paymentMethod === 'cod' && (
        <div className="rounded-xl border border-(--color-border) bg-(--color-surface-alt) p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-(--color-primary-dark)">
                Phone Number Verification
              </p>
              <p className="text-[11px] text-(--color-muted)">
                OTP will be sent to {displayPhone || form.phone}
              </p>
            </div>
            <button
              type="button"
              onClick={onSendOtp}
              disabled={isSendingOtp || otpTimerSeconds > 0}
              className="rounded-lg border border-(--color-accent) px-3 py-1.5 text-xs font-semibold text-(--color-accent) hover:bg-(--color-accent-light)/20 transition disabled:opacity-50"
            >
              {isSendingOtp
                ? 'Sending...'
                : otpTimerSeconds > 0
                  ? `Resend in ${String(Math.floor(otpTimerSeconds / 60)).padStart(2, '0')}:${String(otpTimerSeconds % 60).padStart(2, '0')}`
                  : otpSent
                    ? 'Resend OTP'
                    : 'Send OTP'}
            </button>
          </div>

          {otpSent && (
            <div>
              <input
                value={otpCode}
                onChange={(event) => onOtpCodeChange(event.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm outline-none transition focus:border-(--color-accent)"
              />
            </div>
          )}

          {otpMessage && (
            <p
              className={`text-xs ${otpVerified ? 'text-green-600 font-semibold' : 'text-(--color-muted)'}`}
            >
              {otpMessage}
            </p>
          )}
        </div>
      )}

      {/* Submit / Place Order Button */}
      <button
        type="submit"
        disabled={isSubmitting || !isPincodeDeliverable || !hasAddressSelected}
        className="w-full cursor-pointer rounded-xl bg-(--color-accent) px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting
          ? 'Processing Order...'
          : paymentMethod === 'cod' && otpSent && !otpVerified
            ? 'Verify OTP & Place Order'
            : paymentMethod === 'razorpay'
              ? 'Proceed to Pay with Razorpay'
              : 'Place Order'}
      </button>
    </form>
  );
};

export default CheckoutShippingForm;
