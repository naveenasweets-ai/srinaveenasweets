/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback } from 'react';
import type { SavedAddress } from '../../types/types';
import LocationPicker from './LocationPicker';
import { useStore } from '../../context/StoreContext';

type AddressFormData = {
  fullname: string;
  mobile: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
};

type AddressFormProps = {
  onSubmit: (address: AddressFormData) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
  defaultEmail?: string;
  defaultPhone?: string;
  defaultName?: string;
};

const ADDRESS_FORM_ERRORS: Partial<Record<keyof AddressFormData, string>> = {
  fullname: 'Name is required',
  mobile: 'Phone is required',
  fullAddress: 'Address is required',
  city: 'City is required',
  state: 'State is required',
  pincode: 'Pincode is required',
  lat: 'Location is required',
  lng: 'Location is required',
};

const AddressForm = ({
  onSubmit,
  onCancel,
  isSubmitting,
  defaultPhone = '',
  defaultName = '',
}: AddressFormProps) => {
  const [form, setForm] = useState<AddressFormData>({
    fullname: defaultName,
    mobile: defaultPhone,
    fullAddress: '',
    city: '',
    state: '',
    pincode: '',
    lat: 0,
    lng: 0,
  });
  const { siteContent } = useStore();
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof AddressFormData, string>>
  >({});

  const handleAddressSelect = useCallback(
    (data: {
      address: string;
      city: string;
      state: string;
      pincode: string;
      lat: number;
      lng: number;
    }) => {
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

  const deliverablePincodes = siteContent?.deliverablePincodes || [];
  const isPincodeDeliverable =
    !form.pincode.trim() || deliverablePincodes.length === 0
      ? true
      : deliverablePincodes.includes(form.pincode.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="lg:grid grid-cols-1 flex flex-col gap-3 md:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Full Name</label>
          <input
            value={form.fullname}
            onChange={(event) => handleChange('fullname', event.target.value)}
            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.fullname && (
            <p className="mt-1 text-sm text-red-500">{errors.fullname}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Mobile</label>
          <input
            value={form.mobile}
            onChange={(event) => {
              let value = event.target.value;
              if (value.startsWith('0')) {
                value = value.slice(1);
              }
              handleChange('mobile', value);
            }}
            className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.mobile && (
            <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium">Address</label>
          <textarea
            value={form.fullAddress}
            onChange={(event) =>
              handleChange('fullAddress', event.target.value)
            }
            className="min-h-22.5 w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
          />
          {errors.fullAddress && (
            <p className="mt-1 text-sm text-red-500">{errors.fullAddress}</p>
          )}
        </div>
        <div className="col-span-2 lg:grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">City</label>
            <input
              value={form.city}
              onChange={(event) => handleChange('city', event.target.value)}
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
              onChange={(event) => handleChange('state', event.target.value)}
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
              onChange={(event) => handleChange('pincode', event.target.value)}
              className="w-full rounded-lg border border-(--color-border) bg-transparent px-3 py-2"
            />
            {errors.pincode && (
              <p className="mt-1 text-sm text-red-500">{errors.pincode}</p>
            )}
          </div>
          {!isPincodeDeliverable && form.pincode.length === 6 && (
            <p className="col-span-3 lg:text-end text-sm text-red-500">
              Delivery to this pincode is currently unavailable.
            </p>
          )}
        </div>
        <div className="md:col-span-2">
          <button
            type="button"
            disabled={!isPincodeDeliverable}
            onClick={() => setIsLocationPickerOpen(true)}
            className="w-full rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-2 text-left text-sm font-medium text-(--color-muted) hover:border-(--color-accent) transition"
          >
            {form.lat !== 0 || form.lng !== 0
              ? 'Location selected'
              : 'Click to select exact location on map'}
          </button>
          {(errors.lat || errors.lng) && (
            <p className="mt-1 text-sm text-red-500">
              {errors.lat || errors.lng}
            </p>
          )}
        </div>
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
                  className="text-sm text-(--color-muted) hover:text-white transition"
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

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-(--color-accent) px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Saving...' : 'Save Address'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-(--color-border) px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

type SavedAddressSelectionProps = {
  savedAddresses: SavedAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (address: SavedAddress) => void;
  onAddAddress: (address: AddressFormData) => Promise<void>;
  onDeleteAddress: (addressId: string) => Promise<void>;
  onSetDefaultAddress?: (addressId: string) => Promise<void>;
  onContinue: () => void;
  isSubmitting: boolean;
};

const SavedAddressCard = ({
  address,
  selected,
  onSelect,
  onDelete,
  onSetDefault,
}: {
  address: SavedAddress;
  selected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  onSetDefault?: () => void;
}) => {
  const displayAddress = [
    address.fullAddress,
    address.city,
    address.state,
    address.pincode,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <label
      className={`cursor-pointer rounded-xl border p-4 flex gap-3 relative ${
        selected
          ? 'border-(--color-accent) bg-(--color-accent-light)'
          : 'border-(--color-border)'
      }`}
    >
      <input
        type="radio"
        name="savedAddress"
        checked={selected}
        onChange={onSelect}
        className="mt-1"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium pb-2">{address.fullname}</p>
          {address.isDefault && (
            <span className="rounded-full bg-(--color-accent) px-2 py-0.5 text-xs font-semibold text-white">
              Default
            </span>
          )}
        </div>
        <p className="text-sm text-(--color-muted)">{displayAddress}</p>
        {address.mobile && (
          <p className="text-sm text-(--color-muted)">{address.mobile}</p>
        )}
      </div>
      <div className="flex items-end gap-2 absolute right-4">
        {!address.isDefault && onSetDefault && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSetDefault();
            }}
            className={`rounded-lg px-2 py-1 text-xs font-medium border border-(--color-border) hover:border-(--color-accent) transition ${
              selected ? 'bg-(--color-on-primary)' : ''
            }`}
          >
            Set as default
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete();
            }}
            className={`rounded-lg px-2 py-1 text-xs font-medium border border-(--color-border) hover:border-(--color-accent) transition text-red-500 hover:text-red-700 ${
              selected ? 'bg-(--color-on-primary)' : ''
            }`}
          >
            Delete
          </button>
        )}
      </div>
    </label>
  );
};

export default function SavedAddressSelection({
  savedAddresses,
  selectedAddressId,
  onSelectAddress,
  onAddAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onContinue,
  isSubmitting,
}: SavedAddressSelectionProps) {
  const [showAddForm, setShowAddForm] = useState(savedAddresses.length === 0);
  const hasSelection = !!selectedAddressId;

  const handleAddAddress = async (address: AddressFormData) => {
    await onAddAddress(address);
    setShowAddForm(false);
    onContinue();
  };

  return (
    <div className="w-full lg:w-2/3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-(--color-accent)">
          Checkout
        </p>
        <h1 className="text-2xl font-semibold">Select delivery address</h1>
      </div>

      {savedAddresses.length > 0 ? (
        <div className="flex flex-col gap-3 mb-6">
          {savedAddresses.map((addr: any) => (
            <SavedAddressCard
              key={addr._id}
              address={addr}
              selected={selectedAddressId === addr._id}
              onSelect={() => onSelectAddress(addr)}
              onDelete={
                selectedAddressId === addr._id
                  ? () => onDeleteAddress(addr._id)
                  : undefined
              }
              onSetDefault={
                onSetDefaultAddress && !addr.isDefault
                  ? () => onSetDefaultAddress(addr._id)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <p className="mb-4 text-sm text-(--color-muted)">
          No saved addresses found. Please add a new address to continue.
        </p>
      )}

      {!showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="w-full rounded-lg border border-dashed border-(--color-border) bg-(--color-surface) px-3 py-3 text-left text-sm font-medium text-(--color-muted) hover:border-(--color-accent) transition"
        >
          + Add new address
        </button>
      )}

      {showAddForm && (
        <AddressForm
          onSubmit={handleAddAddress}
          onCancel={() => setShowAddForm(false)}
          isSubmitting={isSubmitting}
        />
      )}

      {hasSelection && !showAddForm && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-6 w-full cursor-pointer rounded-lg bg-(--color-accent) px-4 py-3 font-semibold text-white transition hover:opacity-90"
        >
          Continue to checkout
        </button>
      )}
    </div>
  );
}
