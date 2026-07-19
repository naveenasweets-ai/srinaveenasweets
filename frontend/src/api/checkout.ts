import type { CheckoutOrderPayload } from '../types/types';

const apiUrl =
    import.meta.env.MODE === 'production'
        ? (import.meta.env.VITE_BACKEND_URL as string)
        : 'http://localhost:4001';

type CheckoutCustomerDetails = {
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
};

type RazorpayWindow = Window & typeof globalThis & {
    Razorpay?: new (options: Record<string, unknown>) => {
        open: () => void;
    };
};

export const submitCheckoutOrder = async (
    payload: CheckoutOrderPayload,
    token: string,
) => {
    const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    const data = await response.json();
    return { response, data };
};

export const loadRazorpayScript = () => {
    return new Promise<void>((resolve, reject) => {
        if ((window as RazorpayWindow).Razorpay) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Unable to load Razorpay SDK'));
        document.body.appendChild(script);
    });
};

export const initiateCheckoutPayment = async (
    orderId: string,
    amount: number,
    token: string,
    customerDetails?: CheckoutCustomerDetails,
) => {
    const roundedAmount = Number((Math.round(Number(amount) * 100) / 100).toFixed(2));
    const response = await fetch(`${apiUrl}/api/orders/payment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            orderId,
            amount: roundedAmount,
            receipt: orderId,
            ...customerDetails,
        }),
    });

    const data = await response.json();
    return { response, data };
};

export const sendCheckoutOtp = async (phone: string, token: string) => {
    const response = await fetch(`${apiUrl}/api/orders/otp/send`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
    });

    const data = await response.json();
    return { response, data };
};

export const verifyCheckoutOtp = async (phone: string, otp: string, token: string) => {
    const response = await fetch(`${apiUrl}/api/orders/otp/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone, otp }),
    });

    const data = await response.json();
    return { response, data };
};

export const verifyRazorpayPayment = async (
    orderId: string,
    razorpay_order_id: string,
    razorpay_payment_id: string,
    razorpay_signature: string,
    amount: number,
    orderData: Record<string, unknown>,
    token: string,
) => {
    const response = await fetch(`${apiUrl}/api/orders/payment/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            orderId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            amount: amount,
            orderData,
        }),
    });

    const data = await response.json();
    return { response, data };
};
