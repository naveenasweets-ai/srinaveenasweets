import { getSelectedWeightOption } from './productInventory';
import type { CartItem } from '../types/contextTypes';

export type CheckoutSummary = {
    subtotal: number;
    deliveryFee: number;
    packagingFee: number;
    platformFee: number;
    gstRate: number;
    gstAmount: number;
    grandTotal: number;
};

export type CheckoutSummaryInput = {
    items?: CartItem[];
    subtotal?: number;
    deliveryFee?: number;
    packagingFee?: number;
    platformFee?: number;
    gstRate?: number;
    paymentMethod?: 'cod' | 'razorpay';
};

export const calculateCheckoutSummary = ({
    items = [],
    subtotal,
    deliveryFee = 0,
    packagingFee = 0,
    platformFee = 0,
    gstRate = 0,
}: CheckoutSummaryInput): CheckoutSummary => {
    const safeSubtotal = Number(subtotal ?? items.reduce((sum, item) => {
        const selectedOption = getSelectedWeightOption(item.product, item.weight);
        const price = selectedOption ? selectedOption.price : item.product.price;
        return sum + price * item.quantity;
    }, 0)) || 0;

    const safeDeliveryFee = Number(deliveryFee) || 0;
    const safePackagingFee = Number(packagingFee) || 0;
    const safePlatformFee = Number(platformFee) || 0;
    const safeGstRate = Number(gstRate) || 0;

    const gstApplicableSubtotal = items.reduce((sum, item) => {
        if (!item.product.gstIncluded) return sum;
        const selectedOption = getSelectedWeightOption(item.product, item.weight);
        const price = selectedOption ? selectedOption.price : item.product.price;
        return sum + price * item.quantity;
    }, 0);

    const gstAmount = Number((gstApplicableSubtotal * (safeGstRate / 100)).toFixed(2));
    const grandTotal = Number((
        safeSubtotal +
        safeDeliveryFee +
        safePackagingFee +
        safePlatformFee +
        gstAmount
    ).toFixed(2));
    console.log('grandTotal: ', grandTotal)
    return {
        subtotal: safeSubtotal,
        deliveryFee: safeDeliveryFee,
        packagingFee: safePackagingFee,
        platformFee: safePlatformFee,
        gstRate: safeGstRate,
        gstAmount,
        grandTotal,
    };
};
