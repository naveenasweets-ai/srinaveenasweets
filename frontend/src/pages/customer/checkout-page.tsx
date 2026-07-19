/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { initialFormState, type CheckoutFormState } from '../../types/types';
import { calculateCheckoutSummary } from '../../utils/checkout';
import { getSelectedWeightOption } from '../../utils/productInventory';
import CheckoutShippingForm from '../../components/checkout/CheckoutShippingForm';
import CheckoutSummary from '../../components/checkout/CheckoutSummary';
import {
  initiateCheckoutPayment,
  loadRazorpayScript,
  sendCheckoutOtp,
  submitCheckoutOrder,
  verifyCheckoutOtp,
  verifyRazorpayPayment,
} from '../../api/checkout';
import CustomerUtils from '../../utils/customer';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartTotal, user, showToast, siteContent, setCart } = useStore();
  const { clearCart } = CustomerUtils();
  const [form, setForm] = useState<CheckoutFormState>(initialFormState);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay' | ''>(
    '',
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpTimerSeconds, setOtpTimerSeconds] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof CheckoutFormState, string>>
  >({});

  const checkoutState = location.state as {
    data?: typeof cart;
    total?: number;
    subtotal?: number;
    deliveryFee?: number;
    gstAmount?: number;
    packagingFee?: number;
    platformFee?: number;
    count?: number;
  } | null;

  const displayCart = useMemo(() => {
    if (checkoutState?.data?.length) return checkoutState.data;
    return cart;
  }, [cart, checkoutState]);

  const charges = siteContent?.charges || {
    deliveryFee: 40,
    freeDeliveryThreshold: 499,
    platformFee: 29,
    packagingFee: 15,
    gstRate: 5,
  };

  const deliveryFee = checkoutState?.deliveryFee ?? 0;
  const packagingFee = checkoutState?.packagingFee ?? charges.packagingFee;
  const platformFee = checkoutState?.platformFee ?? charges.platformFee;
  const subtotal = checkoutState?.subtotal ?? cartTotal;

  const isEligibleForFreeDelivery = cartTotal >= charges.freeDeliveryThreshold;

  const totals = useMemo(
    () =>
      calculateCheckoutSummary({
        items: displayCart,
        subtotal,
        deliveryFee,
        packagingFee,
        platformFee,
        gstRate: charges.gstRate,
        paymentMethod,
      }),
    [
      charges.gstRate,
      deliveryFee,
      displayCart,
      packagingFee,
      paymentMethod,
      platformFee,
      subtotal,
    ],
  );

  const validate = () => {
    const nextErrors: Partial<Record<keyof CheckoutFormState, string>> = {};

    if (!form.fullName.trim()) nextErrors.fullName = 'Name is required';
    if (!form.email.trim()) nextErrors.email = 'Email is required';
    if (!form.phone.trim()) nextErrors.phone = 'Phone is required';
    if (!form.address.trim()) nextErrors.address = 'Address is required';
    if (!form.city.trim()) nextErrors.city = 'City is required';
    if (!form.state.trim()) nextErrors.state = 'State is required';
    if (!form.pincode.trim()) nextErrors.pincode = 'Pincode is required';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (otpTimerSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setOtpTimerSeconds((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [otpTimerSeconds]);

  const handleChange = (field: keyof CheckoutFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));

    if (field === 'phone') {
      setOtpCode('');
      setOtpSent(false);
      setOtpVerified(false);
      setOtpMessage('');
      setOtpTimerSeconds(0);
    }
  };

  const handleSendOtp = async () => {
    if (!form.phone.trim()) {
      showToast(
        'Please enter your phone number to receive the OTP.',
        'warning',
      );
      return;
    }

    setIsSendingOtp(true);
    setOtpMessage('');
    setOtpCode('');

    try {
      const { response, data } = await sendCheckoutOtp(
        form.phone.trim(),
        user.token,
      );
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to send OTP.');
      }

      setOtpSent(true);
      setOtpVerified(false);
      setOtpTimerSeconds(120);
      setOtpMessage(
        'OTP sent successfully. Please enter the code you received.',
      );
      showToast('OTP sent successfully.', 'success');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to send OTP.';
      setOtpMessage(message);
      showToast(message, 'error');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (paymentMethod === '') {
      showToast('Please select the payment method', 'warning');
      return;
    }

    if (!validate()) return;
    if (!displayCart.length) {
      showToast('Your cart is empty.', 'warning');
      return;
    }
    if (!user.loggedIn) {
      showToast('Please sign in to place an order.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      let verifiedNow = false;

      if (paymentMethod === 'cod' && otpSent && !otpVerified) {
        if (!otpCode.trim()) {
          showToast('Please enter the OTP received on your phone.', 'warning');
          setIsSubmitting(false);
          return;
        }

        setIsVerifyingOtp(true);
        try {
          const { response, data } = await verifyCheckoutOtp(
            form.phone.trim(),
            otpCode.trim(),
            user.token,
          );

          if (!response.ok || !data.success) {
            throw new Error(data.error || 'OTP verification failed.');
          }

          verifiedNow = true;
          setOtpVerified(true);
          setOtpMessage('Phone verification completed successfully.');
          showToast('OTP verified successfully.', 'success');
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'OTP verification failed.';
          setOtpVerified(false);
          setOtpMessage(message);
          showToast(message, 'error');
          setIsVerifyingOtp(false);
          setIsSubmitting(false);
          return;
        } finally {
          setIsVerifyingOtp(false);
        }
      }

      if (paymentMethod === 'cod' && !otpVerified && !verifiedNow) {
        showToast(
          'Please verify the OTP sent to your phone before placing the order.',
          'warning',
        );
        setIsSubmitting(false);
        return;
      }

      const payload = {
        customerId: user._id,
        customerName: form.fullName.trim(),
        customerEmail: form.email.trim(),
        customerPhone: form.phone.trim(),
        shippingAddress: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        items: displayCart.map((item) => ({
          productId: item.product._id,
          name: item.product.name,
          quantity: item.quantity,
          weight: item.weight,
          price:
            (getSelectedWeightOption(item.product, item.weight)?.price ??
              item.product.price) * item.quantity,
        })),
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        packagingFee: totals.packagingFee,
        platformFee: totals.platformFee,
        gstRate: totals.gstRate,
        paymentMethod,
        notes: `Checkout via ${paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}`,
        otpVerified:
          paymentMethod === 'cod' ? otpVerified || verifiedNow : undefined,
        otpCode: paymentMethod === 'cod' ? otpCode.trim() : undefined,
      };

      const { response, data } = await submitCheckoutOrder(payload, user.token);
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Unable to place order.');
      }

      if (paymentMethod === 'razorpay') {
        const { response: paymentResponse, data: paymentData } =
          await initiateCheckoutPayment(
            data.order._id,
            totals.grandTotal,
            user.token,
            {
              customerName: form.fullName.trim(),
              customerEmail: form.email.trim(),
              customerPhone: form.phone.trim(),
            },
          );
        if (!paymentResponse.ok || !paymentData.success) {
          throw new Error(paymentData.error || 'Payment initiation failed.');
        }

        await loadRazorpayScript();
        const Razorpay = (
          window as Window &
            typeof globalThis & {
              Razorpay?: new (options: Record<string, unknown>) => {
                open: () => void;
              };
            }
        ).Razorpay;
        if (!Razorpay) {
          throw new Error('Razorpay SDK is unavailable right now.');
        }

        const paymentOptions = {
          key: paymentData.keyId,
          amount: paymentData.razorpayOrder?.amount,
          currency: paymentData.razorpayOrder?.currency || 'INR',
          order_id: paymentData.razorpayOrder?.id,
          name: paymentData.name || 'Sri Naveena Sweets',
          description: paymentData.description || 'Order payment',
          prefill: paymentData.prefill || {},
          theme: { color: '#a1282b' },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              setIsSubmitting(true);
              const { response: verifyResponse, data: verifyData } =
                await verifyRazorpayPayment(
                  data.order._id,
                  response.razorpay_order_id,
                  response.razorpay_payment_id,
                  response.razorpay_signature,
                  totals.grandTotal,
                  {
                    ...payload,
                    customerName: form.fullName.trim(),
                    customerEmail: form.email.trim(),
                    customerPhone: form.phone.trim(),
                    subtotal: totals.subtotal,
                    deliveryFee: totals.deliveryFee,
                    packagingFee: totals.packagingFee,
                    platformFee: totals.platformFee,
                    gstRate: totals.gstRate,
                    gstAmount: totals.gstAmount,
                    grandTotal: totals.grandTotal,
                  },
                  user.token,
                );

              if (!verifyResponse.ok || !verifyData.success) {
                throw new Error(
                  verifyData.error || 'Payment verification failed.',
                );
              }

              setCart([]);
              clearCart();
              setForm(initialFormState);
              showToast(
                'Payment completed and order confirmed successfully.',
                'success',
              );
              navigate('/order-confirmation', {
                state: {
                  orderId: verifyData.order?._id || data.order._id,
                  paymentMethod: 'razorpay' as const,
                  message:
                    'Your payment was successful and your order is confirmed.',
                },
              });
            } catch (verifyError) {
              const message =
                verifyError instanceof Error
                  ? verifyError.message
                  : 'Payment verification failed.';
              showToast(message, 'error');
            } finally {
              setIsSubmitting(false);
            }
          },
          modal: {
            ondismiss: () => {
              showToast('Payment was cancelled.', 'warning');
            },
          },
        };

        const rzp = new Razorpay(paymentOptions);
        rzp.open();
        return;
      }

      setCart([]);
      clearCart();
      showToast(
        'Order placed successfully. We will confirm it shortly.',
        'success',
      );
      navigate('/order-confirmation', {
        state: {
          orderId: data.order?._id,
          paymentMethod: paymentMethod as 'cod' | 'razorpay',
          message:
            'Your order has been placed successfully and will be confirmed shortly.',
        },
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unexpected error';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8 text-(--color-text) sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        <CheckoutShippingForm
          form={form}
          errors={errors}
          onChange={handleChange}
          paymentMethod={paymentMethod}
          onPaymentMethodChange={setPaymentMethod}
          isSubmitting={isSubmitting}
          otpCode={otpCode}
          otpSent={otpSent}
          otpVerified={otpVerified}
          otpMessage={otpMessage}
          otpTimerSeconds={otpTimerSeconds}
          isSendingOtp={isSendingOtp}
          isVerifyingOtp={isVerifyingOtp}
          onOtpCodeChange={setOtpCode}
          onSendOtp={handleSendOtp}
          onSubmit={handleSubmit}
        />

        <CheckoutSummary
          displayCart={displayCart}
          totals={totals}
          charges={charges}
          isEligibleForFreeDelivery={isEligibleForFreeDelivery}
        />
      </div>
    </div>
  );
};

export default CheckoutPage;
