/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ADDRESS_FORM_ERRORS,
  type AddressFormData,
  type AddressFormProps,
} from '../../types/types';
import LocationPicker from './LocationPicker';
import { getDistanceInKm } from '../../utils/checkout';
import { useStore } from '../../context/StoreContext';

export default function AddressForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = 'Save Address',
  defaultPhone = '',
  defaultName = '',
}: AddressFormProps) {
  const hasUserInteracted = useRef(false);
  const { siteContent } = useStore();
  const [form, setForm] = useState<AddressFormData>({
    fullname: initialValues?.fullname || defaultName || '',
    mobile: initialValues?.mobile || defaultPhone || '',
    fullAddress: initialValues?.fullAddress || '',
    city: initialValues?.city || '',
    state: initialValues?.state || '',
    pincode: initialValues?.pincode || '',
    lat: initialValues?.lat ?? 16.314209,
    lng: initialValues?.lng ?? 80.435028,
  });
  console.log('form: ', form.fullAddress, form.lat, form.lng)
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormData, string>>
  >({});

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

  useEffect(() => {
    if (initialValues && !hasUserInteracted.current) {
      setForm((prev) => ({
        ...prev,
        fullname: initialValues.fullname ?? prev.fullname,
        mobile: initialValues.mobile ?? prev.mobile,
        fullAddress: initialValues.fullAddress ?? prev.fullAddress,
        city: initialValues.city ?? prev.city,
        state: initialValues.state ?? prev.state,
        pincode: initialValues.pincode ?? prev.pincode,
        lat: initialValues.lat ?? prev.lat,
        lng: initialValues.lng ?? prev.lng,
      }));
    }
  }, [initialValues]);

  const handleAddressSelect = useCallback(
    (data: {
      address: string;
      city: string;
      state: string;
      pincode: string;
      lat: number;
      lng: number;
    }) => {
      hasUserInteracted.current = true;
      setForm((prev) => ({
        ...prev,
        fullAddress: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        lat: data.lat,
        lng: data.lng,
      }));
    },
    [],
  );

  const handleChange = (
    field: keyof AddressFormData,
    value: string | number,
  ) => {
    hasUserInteracted.current = true;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<Record<keyof AddressFormData, string>> = {};
    (Object.keys(ADDRESS_FORM_ERRORS) as Array<keyof AddressFormData>).forEach(
      (key) => {
        const value = form[key];
        if (typeof value === 'string') {
          if (!value.trim()) {
            nextErrors[key] = ADDRESS_FORM_ERRORS[key] || `${key} is required`;
          }
        } else if (value === 0 && (key === 'lat' || key === 'lng')) {
          nextErrors[key] = ADDRESS_FORM_ERRORS[key] || `${key} is required`;
        }
      },
    );

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    await onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-(--color-border) bg-(--color-surface-alt) p-4 shadow-xs"
    >
      <div className="lg:grid grid-cols-1 flex flex-col gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-(--color-primary-dark)">
            Full Name
          </label>
          <input
            value={form.fullname}
            onChange={(event) => handleChange('fullname', event.target.value)}
            placeholder="Enter full name"
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm outline-none transition focus:border-(--color-accent)"
          />
          {errors.fullname && (
            <p className="mt-1 text-xs text-red-500">{errors.fullname}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold text-(--color-primary-dark)">
            Mobile Number
          </label>
          <input
            value={form.mobile}
            onChange={(event) => {
              let value = event.target.value;
              if (value.startsWith('0')) {
                value = value.slice(1);
              }
              handleChange('mobile', value);
            }}
            placeholder="10-digit mobile number"
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm outline-none transition focus:border-(--color-accent)"
          />
          {errors.mobile && (
            <p className="mt-1 text-xs text-red-500">{errors.mobile}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-(--color-primary-dark)">
            Full Address
          </label>
          <textarea
            value={form.fullAddress}
            onChange={(event) =>
              handleChange('fullAddress', event.target.value)
            }
            placeholder="House/Flat No, Street, Landmark"
            className="min-h-20 w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-sm outline-none transition focus:border-(--color-accent)"
          />
          {errors.fullAddress && (
            <p className="mt-1 text-xs text-red-500">{errors.fullAddress}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <button
            type="button"
            onClick={() => setIsLocationPickerOpen(true)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-left text-xs font-medium text-(--color-muted) hover:border-(--color-accent) transition flex items-center justify-between"
          >
            <span>
              {form.lat !== 0 || form.lng !== 0
                ? '📍 Location selected on map'
                : '📍 Click to select exact location on map'}
            </span>
            <span className="text-[11px] underline text-(--color-accent)">
              Change map pin
            </span>
          </button>
          {(errors.lat || errors.lng) && (
            <p className="mt-1 text-xs text-red-500">
              {errors.lat || errors.lng}
            </p>
          )}
        </div>

        <div className="col-span-2 lg:grid grid-cols-3 gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-(--color-primary-dark)">
              City
            </label>
            <input
              value={form.city}
              disabled
              placeholder="Auto-filled"
              className="w-full rounded-lg border border-(--color-border) bg-gray-100 px-3 py-2 text-xs text-gray-600 disabled:cursor-not-allowed"
            />
            {errors.city && (
              <p className="mt-1 text-xs text-red-500">{errors.city}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-(--color-primary-dark)">
              State
            </label>
            <input
              value={form.state}
              disabled
              placeholder="Auto-filled"
              className="w-full rounded-lg border border-(--color-border) bg-gray-100 px-3 py-2 text-xs text-gray-600 disabled:cursor-not-allowed"
            />
            {errors.state && (
              <p className="mt-1 text-xs text-red-500">{errors.state}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-(--color-primary-dark)">
              Pincode
            </label>
            <input
              value={form.pincode}
              disabled
              placeholder="Auto-filled"
              className="w-full rounded-lg border border-(--color-border) bg-gray-100 px-3 py-2 text-xs text-gray-600 disabled:cursor-not-allowed"
            />
            {errors.pincode && (
              <p className="mt-1 text-xs text-red-500">{errors.pincode}</p>
            )}
          </div>
          {!isPincodeDeliverable() && form.pincode.length === 6 && (
            <p className="col-span-3 mt-2 text-xs text-red-500">
              Delivery to this location is currently unavailable. We are
              delivering only within Guntur area.
            </p>
          )}
        </div>
      </div>

      {isLocationPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-(--color-border) bg-(--color-surface) shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-(--color-border)">
              <h3 className="text-base font-semibold">
                Select location on map
              </h3>
              <button
                type="button"
                onClick={() => setIsLocationPickerOpen(false)}
                className="text-xs font-medium text-(--color-muted) hover:text-(--color-primary-dark) transition"
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
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !isPincodeDeliverable()}
          className="rounded-lg bg-(--color-accent) px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-(--color-border) px-4 py-2 text-xs font-semibold transition hover:bg-(--color-surface)"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
