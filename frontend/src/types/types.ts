/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CheckoutSummary } from "../utils/checkout";
import type { CartItem } from "./contextTypes";

export type CheckoutFormState = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
};

export const initialFormState: CheckoutFormState = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  lat: 16.314209,
  lng: 80.435028,
};


export const DEFAULT_POSITION: [number, number] = [16.314209, 80.435028];

export type LocationPickerProps = {
  lat: number;
  lng: number;
  onAddressSelect: (data: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    state_district?: string
    lat: number;
    lng: number;
  }) => void;
  onClose?: () => void;
};

export type PaymentMethod = 'cod' | 'razorpay' | '';

export type CheckoutOrderPayload = {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    weight: string;
    price: number;
  }>;
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  platformFee: number;
  gstRate: number;
  paymentMethod: PaymentMethod;
  notes: string;
  otpVerified?: boolean;
  otpCode?: string;
};


export type CheckoutShippingFormProps = {
  form: CheckoutFormState;
  errors: Partial<Record<keyof CheckoutFormState, string>>;
  onChange: (field: keyof CheckoutFormState, value: string | number) => void;
  onAddressSelect: (data: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
  }) => void;
  paymentMethod: 'cod' | 'razorpay' | '';
  onPaymentMethodChange: (value: 'cod' | 'razorpay') => void;
  isSubmitting: boolean;
  otpCode: string;
  otpSent: boolean;
  otpVerified: boolean;
  otpMessage: string;
  otpTimerSeconds: number;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  onOtpCodeChange: (value: string) => void;
  onSendOtp: () => void;
  onSubmit: (e: any) => void;
  isPincodeDeliverable: boolean;
  savedAddress?: SavedAddress | null;
  hasSavedAddresses?: boolean;
  onChangeAddress?: () => void;
};

export type SavedAddress = {
  _id: string;
  fullname: string;
  mobile: string;
  fullAddress: string;
  email: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
};

export type OrderItem = {
  productId: string;
  name: string;
  quantity: number;
  weight: string;
  price: number;
};

export type Order = {
  _id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: 'cod' | 'razorpay';
  paymentStatus: string;
  orderStatus: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  packagingFee: number;
  platformFee: number;
  gstRate: number;
  gstAmount: number;
  grandTotal: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  notes: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CheckoutSummaryProps = {
  displayCart: CartItem[];
  totals: CheckoutSummary;
  charges: {
    deliveryFee: number;
    freeDeliveryThreshold: number;
    platformFee: number;
    packagingFee: number;
    gstRate: number;
  };
  isEligibleForFreeDelivery: boolean;
};

export type AddressFormData = {
  fullname: string;
  mobile: string;
  fullAddress: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
};

export type AddressFormProps = {
  onSubmit: (address: AddressFormData) => Promise<void> | void;
  onCancel: () => void;
  isSubmitting: boolean;
  defaultEmail?: string;
  defaultPhone?: string;
  defaultName?: string;
};

export const ADDRESS_FORM_ERRORS: Partial<Record<keyof AddressFormData, string>> = {
  fullname: 'Name is required',
  mobile: 'Phone is required',
  fullAddress: 'Address is required',
  city: 'City is required',
  state: 'State is required',
  pincode: 'Pincode is required',
  lat: 'Location is required',
  lng: 'Location is required',
};

export const outletLocation = {
  lat: 16.314209,
  lng: 80.435028,
};