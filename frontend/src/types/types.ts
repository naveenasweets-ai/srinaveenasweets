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
};

export const initialFormState: CheckoutFormState = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

export type PaymentMethod = 'cod' | 'razorpay';

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
};


export type CheckoutShippingFormProps = {
  form: CheckoutFormState;
  errors: Partial<Record<keyof CheckoutFormState, string>>;
  onChange: (field: keyof CheckoutFormState, value: string) => void;
  paymentMethod: 'cod' | 'razorpay';
  onPaymentMethodChange: (value: 'cod' | 'razorpay') => void;
  isSubmitting: boolean;
  onSubmit: () => void;
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