import { formatPrice } from '../../utils/utils';
import { getSelectedWeightOption } from '../../utils/productInventory';
import type { CheckoutSummaryProps } from '../../types/types';

const CheckoutSummary = ({
  displayCart,
  totals,
  charges,
  isEligibleForFreeDelivery,
}: CheckoutSummaryProps) => {
  return (
    <aside className="w-full lg:w-1/3">
      <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="mt-4 space-y-3">
          {displayCart.map((item) => {
            const selectedOption = getSelectedWeightOption(
              item.product,
              item.weight,
            );
            const itemPrice = selectedOption
              ? selectedOption.price
              : item.product.price;
            return (
              <div
                key={`${item.product._id}-${item.weight}`}
                className="flex items-start justify-between gap-3 rounded-lg border border-(--color-border) p-3"
              >
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-sm text-(--color-muted)">
                    Qty {item.quantity}
                  </p>
                </div>
                <p className="font-medium">
                  {formatPrice(itemPrice * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          <div>
            {isEligibleForFreeDelivery ? (
              <div className="mb-2 flex justify-between text-sm">
                <span className="font-medium text-green-600">Delivery</span>
                <span className="font-medium text-green-600">FREE</span>
              </div>
            ) : (
              charges.deliveryFee > 0 && (
                <div className="mb-2 flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>₹ {charges.deliveryFee.toFixed(2)}</span>
                </div>
              )
            )}
          </div>
          {totals.packagingFee !== 0 && (
            <div className="flex justify-between">
              <span>Packaging</span>
              <span>{formatPrice(totals.packagingFee)}</span>
            </div>
          )}
          {totals.platformFee !== 0 && (
            <div className="flex justify-between">
              <span>Platform fee</span>
              <span>{formatPrice(totals.platformFee)}</span>
            </div>
          )}
          {totals.gstAmount !== 0 && (
            <div className="flex justify-between">
              <span>GST ({charges.gstRate}%)</span>
              <span>{formatPrice(totals.gstAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-(--color-border) pt-2 text-base font-semibold">
            <span>Grand total</span>
            <span>{formatPrice(totals.grandTotal)}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default CheckoutSummary;
