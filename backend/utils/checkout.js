export const calculateCheckoutTotals = ({
  subtotal,
  deliveryFee = 0,
  packagingFee = 0,
  platformFee = 0,
  gstRate = 0,
  paymentMethod = 'cod',
}) => {
  const safeSubtotal = Number(subtotal) || 0;
  const safeDeliveryFee = Number(deliveryFee) || 0;
  const safePackagingFee = Number(packagingFee) || 0;
  const safePlatformFee = Number(platformFee) || 0;
  const safeGstRate = Number(gstRate) || 0;

  const gstAmount = Number((safeSubtotal * (safeGstRate / 100)).toFixed(2));
  const grandTotal = Number(
    (
      safeSubtotal +
      safeDeliveryFee +
      safePackagingFee +
      safePlatformFee +
      gstAmount
    ).toFixed(2),
  );

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
