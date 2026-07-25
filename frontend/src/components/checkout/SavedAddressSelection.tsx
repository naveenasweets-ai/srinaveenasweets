/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState } from 'react';
import type { AddressFormData, SavedAddress } from '../../types/types';
import AddressForm from './AddressForm';

export type SavedAddressSelectionProps = {
  savedAddresses: SavedAddress[];
  selectedAddressId: string | null;
  onSelectAddress: (address: SavedAddress) => void;
  onAddAddress: (address: AddressFormData) => Promise<void>;
  onUpdateAddress?: (
    addressId: string,
    address: AddressFormData,
  ) => Promise<void>;
  onDeleteAddress: (addressId: string) => Promise<void>;
  onSetDefaultAddress?: (addressId: string) => Promise<void>;
  onContinue: () => void;
  isSubmitting: boolean;
};

const SavedAddressCard = ({
  address,
  selected,
  onSelect,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  address: SavedAddress;
  selected: boolean;
  onSelect: () => void;
  onEdit?: () => void;
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
      className={`cursor-pointer rounded-xl border p-4 flex flex-col gap-3 relative transition-all ${
        selected
          ? 'border-(--color-accent) bg-(--color-accent-light)/30 shadow-xs'
          : 'border-(--color-border) hover:border-(--color-accent)/50'
      }`}
    >
      <div className="flex gap-2">
        <input
          type="radio"
          name="savedAddress"
          checked={selected}
          onChange={onSelect}
          className="mt-1 accent-(--color-accent)"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold text-sm text-(--color-primary-dark) py-1 line-clamp-1">
              {address.fullname}
            </p>
            {address.isDefault && (
              <span className="rounded-full bg-(--color-accent) px-2 py-0.5 text-[10px] font-bold text-white">
                Default
              </span>
            )}
          </div>
          <p className="text-xs text-(--color-muted) mt-0.5">
            {displayAddress}
          </p>
          {address.mobile && (
            <p className="text-xs text-(--color-muted) mt-0.5">
              📞 {address.mobile}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between w-full gap-1.5">
        {onEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit();
            }}
            className="flex-1 rounded-lg px-2 py-1 text-xs font-semibold border border-(--color-border) bg-(--color-surface) text-(--color-accent) hover:bg-(--color-accent-light)/20 transition"
          >
            Edit
          </button>
        )}
        {!address.isDefault && onSetDefault && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSetDefault();
            }}
            className="flex-1 rounded-lg px-2 py-1 text-xs font-medium border border-(--color-border) bg-(--color-surface) hover:border-(--color-accent) transition"
          >
            Set default
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
            className="flex-1 rounded-lg px-2 py-1 text-xs font-medium border border-red-500 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 transition"
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
  onUpdateAddress,
  onDeleteAddress,
  onSetDefaultAddress,
  onContinue,
  isSubmitting,
}: SavedAddressSelectionProps) {
  const [showAddForm, setShowAddForm] = useState(savedAddresses.length === 0);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const editingAddress =
    savedAddresses.find((addr) => addr._id === editingAddressId) || null;

  const handleAddSubmit = async (address: AddressFormData) => {
    await onAddAddress(address);
    setShowAddForm(false);
    onContinue();
  };

  const handleEditSubmit = async (address: AddressFormData) => {
    if (editingAddressId && onUpdateAddress) {
      await onUpdateAddress(editingAddressId, address);
    }
    setEditingAddressId(null);
  };

  return (
    <div className="w-full lg:w-2/3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-accent)">
            Checkout Step 1 of 2
          </p>
          <h1 className="text-2xl font-semibold text-(--color-primary-dark)">
            Select Delivery Address
          </h1>
        </div>
      </div>

      {/* Add New Address Button & Form */}
      {!showAddForm && editingAddressId === null && (
        <button
          type="button"
          onClick={() => {
            setShowAddForm(true);
            setEditingAddressId(null);
          }}
          className="w-full rounded-xl border border-dashed border-(--color-accent)/60 bg-(--color-surface-alt) px-4 py-3 mb-4 text-left text-xs font-semibold text-(--color-accent) hover:bg-(--color-accent-light)/20 transition flex items-center gap-2"
        >
          <span>➕ Add new address</span>
        </button>
      )}

      {showAddForm && editingAddressId === null && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-(--color-accent) mb-2">
            New Delivery Address:
          </p>
          <AddressForm
            onSubmit={handleAddSubmit}
            onCancel={() => setShowAddForm(false)}
            isSubmitting={isSubmitting}
            submitLabel="Save & Continue to Payment"
          />
        </div>
      )}

      {/* Addresses List */}
      {savedAddresses.length > 0 ? (
        <div className="flex flex-col gap-3 mb-6">
          {savedAddresses.map((addr: SavedAddress) => (
            <div key={addr._id}>
              <SavedAddressCard
                address={addr}
                selected={selectedAddressId === addr._id}
                onSelect={() => {
                  onSelectAddress(addr);
                  setEditingAddressId(null);
                  setShowAddForm(false);
                }}
                onEdit={() => {
                  onSelectAddress(addr);
                  setEditingAddressId(addr._id);
                  setShowAddForm(false);
                }}
                onDelete={() => onDeleteAddress(addr._id)}
                onSetDefault={
                  onSetDefaultAddress && !addr.isDefault
                    ? () => onSetDefaultAddress(addr._id)
                    : undefined
                }
              />

              {/* Inline Edit Form if this address is being edited */}
              {editingAddressId === addr._id && editingAddress && (
                <div className="mt-3 pl-4 border-l-2 border-(--color-accent)">
                  <p className="text-xs font-semibold text-(--color-accent) mb-2">
                    Editing Address:
                  </p>
                  <AddressForm
                    initialValues={{
                      fullname: editingAddress.fullname,
                      mobile: editingAddress.mobile,
                      fullAddress: editingAddress.fullAddress,
                      city: editingAddress.city,
                      state: editingAddress.state,
                      pincode: editingAddress.pincode,
                      lat: editingAddress.lat,
                      lng: editingAddress.lng,
                    }}
                    onSubmit={handleEditSubmit}
                    onCancel={() => setEditingAddressId(null)}
                    isSubmitting={isSubmitting}
                    submitLabel="Update Address"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mb-4 text-xs text-(--color-muted)">
          No saved addresses found. Please add a new address below to continue.
        </p>
      )}

      {/* Continue to Payment Button */}
      {selectedAddressId && !showAddForm && editingAddressId === null && (
        <button
          type="button"
          onClick={onContinue}
          className="mt-6 w-full cursor-pointer rounded-xl bg-(--color-accent) px-4 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-90 active:scale-[0.99]"
        >
          Proceed to Payment →
        </button>
      )}
    </div>
  );
}
