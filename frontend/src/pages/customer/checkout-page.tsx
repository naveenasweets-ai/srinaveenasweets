/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import {
  initialFormState,
  type CheckoutFormState,
  type SavedAddress,
} from '../../types/types';
import { calculateCheckoutSummary } from '../../utils/checkout';
import { getSelectedWeightOption } from '../../utils/productInventory';
import CheckoutShippingForm from '../../components/checkout/CheckoutShippingForm';
import CheckoutSummary from '../../components/checkout/CheckoutSummary';
import SavedAddressSelection from '../../components/checkout/SavedAddressSelection';
import {
  initiateCheckoutPayment,
  loadRazorpayScript,
  sendCheckoutOtp,
  submitCheckoutOrder,
  verifyCheckoutOtp,
  verifyRazorpayPayment,
} from '../../api/checkout';
import CustomerUtils from '../../utils/customer';
import CustomerApi from '../../api/customer';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartTotal, user, showToast, siteContent, setCart } = useStore();
  const { clearCart } = CustomerUtils();
  const {
    addSavedAddress,
    updateSavedAddress,
    deleteSavedAddress,
    getSavedAddresses,
  } = CustomerApi();
  const [form, setForm] = useState<CheckoutFormState>(initialFormState);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<
    string | null
  >(null);
  const [addressStep, setAddressStep] = useState<'select' | 'checkout'>(
    'select',
  );
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  useEffect(() => {
    if (user.loggedIn && user.email && !form.email) {
      setForm((prev) => ({ ...prev, email: user.email }));
    }
  }, [user.loggedIn, user.email, form.email]);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user.loggedIn || !user.token) return;
      setIsLoadingAddresses(true);
      try {
        const { data } = await getSavedAddresses(user.token);
        if (data?.success) {
          setSavedAddresses(data.data || []);
        }
      } catch {
        // silently ignore fetch errors
      } finally {
        setIsLoadingAddresses(false);
      }
    };
    fetchAddresses();
  }, [user.loggedIn, user.token]);

  const handleSelectAddressAndContinue = async (address: SavedAddress) => {
    setSelectedSavedAddressId(address._id);
    setForm((prev) => ({
      ...prev,
      fullName: address.fullname || prev.fullName,
      phone: address.mobile || prev.phone,
      address: address.fullAddress || prev.address,
      city: address.city || prev.city,
      state: address.state || prev.state,
      pincode: address.pincode || prev.pincode,
      lat: address.lat ?? prev.lat,
      lng: address.lng ?? prev.lng,
    }));
  };

  useEffect(() => {
    if (
      savedAddresses.length > 0 &&
      !selectedSavedAddressId &&
      addressStep === 'select'
    ) {
      const defaultAddr =
        savedAddresses.find((addr) => addr.isDefault) || savedAddresses[0];
      handleSelectAddressAndContinue(defaultAddr);
    }
  }, [savedAddresses, selectedSavedAddressId, addressStep]);

  const handleAddNewAddressAndContinue = async (address: {
    fullname: string;
    mobile: string;
    fullAddress: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
  }) => {
    if (!user.token) return;
    try {
      const { data } = await addSavedAddress(user.token, address);
      if (data?.success) {
        setSavedAddresses(data.data || []);
        const newAddress = (data.data || []).slice(-1)[0];
        if (newAddress) {
          setSelectedSavedAddressId(newAddress._id);
        }
        setForm((prev) => ({
          ...prev,
          fullName: address.fullname || prev.fullName,
          phone: address.mobile || prev.phone,
          address: address.fullAddress || prev.address,
          city: address.city || prev.city,
          state: address.state || prev.state,
          pincode: address.pincode || prev.pincode,
          lat: address.lat ?? prev.lat,
          lng: address.lng ?? prev.lng,
        }));
        setAddressStep('checkout');
      }
    } catch {
      showToast('Failed to save address', 'error');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!user.token) return;
    try {
      const { data } = await deleteSavedAddress(user.token, addressId);
      if (data?.success) {
        setSavedAddresses(data.data || []);
        if (selectedSavedAddressId === addressId) {
          setSelectedSavedAddressId(null);
        }
        showToast('Address removed', 'success');
      }
    } catch {
      showToast('Failed to remove address', 'error');
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    if (!user.token) return;
    try {
      const { data } = await updateSavedAddress(
        user.token,
        addressId,
        savedAddresses.find((a) => a._id === addressId) || ({} as any),
        true,
      );
      if (data?.success) {
        setSavedAddresses(data.data || []);
        showToast('Default address updated', 'success');
        if (!selectedSavedAddressId) {
          const defaultAddr = (data.data || []).find(
            (a: SavedAddress) => a.isDefault,
          );
          if (defaultAddr) {
            setSelectedSavedAddressId(defaultAddr._id);
          }
        }
      }
    } catch {
      showToast('Failed to update default address', 'error');
    }
  };

  const saveCurrentAddressIfNew = async () => {
    if (!user.token) return;
    const addressPayload = {
      fullname: form.fullName.trim(),
      mobile: form.phone.trim(),
      fullAddress: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pincode: form.pincode.trim(),
      lat: form.lat,
      lng: form.lng,
    };
    try {
      if (selectedSavedAddressId) {
        const { data } = await updateSavedAddress(
          user.token,
          selectedSavedAddressId,
          addressPayload,
        );
        if (data?.success) {
          setSavedAddresses(data.data || []);
        }
      } else {
        const { data } = await addSavedAddress(user.token, addressPayload);
        if (data?.success) {
          setSavedAddresses(data.data || []);
        }
      }
    } catch {
      // silent fail - order already placed
    }
  };

  const handleBackToAddressSelection = () => {
    setAddressStep('select');
  };

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

  const deliverablePincodes = siteContent?.deliverablePincodes || [];
  const isPincodeDeliverable =
    !form.pincode.trim() || deliverablePincodes.length === 0
      ? true
      : deliverablePincodes.includes(form.pincode.trim());

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
    if (form.lat === 0) nextErrors.lat = 'Location is required';
    if (form.lng === 0) nextErrors.lng = 'Location is required';

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

  const handleChange = (
    field: keyof CheckoutFormState,
    value: string | number,
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSelectedSavedAddressId(null);
    setErrors((prev) => ({ ...prev, [field]: '' }));

    if (field === 'phone') {
      setOtpCode('');
      setOtpSent(false);
      setOtpVerified(false);
      setOtpMessage('');
      setOtpTimerSeconds(0);
    }

    if (field === 'pincode') {
      const trimmed = typeof value === 'string' ? value.trim() : String(value);
      const nextDeliverable =
        !trimmed || deliverablePincodes.length === 0
          ? true
          : deliverablePincodes.includes(trimmed);
      if (!nextDeliverable && paymentMethod !== '') {
        setPaymentMethod('');
      }
    }
  };

  const handleAddressSelect = (data: {
    address: string;
    city: string;
    state: string;
    pincode: string;
    lat: number;
    lng: number;
  }) => {
    setForm((prev) => ({
      ...prev,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      lat: data.lat,
      lng: data.lng,
    }));
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
        longitude: form.lng,
        latitude: form.lat,
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

              saveCurrentAddressIfNew();
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

      await saveCurrentAddressIfNew();
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

  const selectedSavedAddress =
    savedAddresses.find((addr) => addr._id === selectedSavedAddressId) || null;

  return (
    <div className="min-h-screen bg-(--color-background) px-4 py-8 text-(--color-text) sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 lg:flex-row">
        {isLoadingAddresses ? (
          'Your Addresses are Loading...'
        ) : addressStep === 'select' ? (
          <SavedAddressSelection
            savedAddresses={savedAddresses}
            selectedAddressId={selectedSavedAddressId}
            onSelectAddress={handleSelectAddressAndContinue}
            onAddAddress={handleAddNewAddressAndContinue}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
            onContinue={() => {
              setAddressStep('checkout');
            }}
            isSubmitting={isSubmitting}
          />
        ) : (
          <CheckoutShippingForm
            form={form}
            errors={errors}
            onChange={handleChange}
            onAddressSelect={handleAddressSelect}
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
            deliverablePincodes={deliverablePincodes}
            isPincodeDeliverable={isPincodeDeliverable}
            savedAddress={selectedSavedAddress}
            hasSavedAddresses={savedAddresses.length > 0}
            onChangeAddress={handleBackToAddressSelection}
          />
        )}

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
