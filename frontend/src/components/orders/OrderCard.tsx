import type { Order } from '../../types/types';

type OrderCardProps = {
  order: Order;
};

const formatPrice = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const statusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'confirmed':
    case 'delivered':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const OrderCard = ({ order }: OrderCardProps) => {
  const lineTotal = (price: number, quantity: number) =>
    formatPrice(price * quantity);

  return (
    <div className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-(--color-border) pb-4">
        <div>
          <p className="text-sm font-medium text-(--color-muted)">
            Order ID
          </p>
          <p className="font-mono text-lg font-semibold text-(--color-primary)">
            {order._id}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-(--color-muted)">
            Placed on
          </p>
          <p className="text-sm font-semibold text-(--color-text)">
            {formatDate(order.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(order.paymentStatus)}`}
        >
          Payment: {order.paymentStatus}
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${statusColor(order.orderStatus)}`}
        >
          Order: {order.orderStatus}
        </span>
        <span className="inline-flex items-center rounded-full border border-(--color-border) bg-(--color-background) px-3 py-1 text-xs font-semibold text-(--color-text)">
          {order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
        </span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-(--color-border) bg-(--color-background) p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">
            Customer
          </p>
          <p className="mt-1 text-sm font-medium text-(--color-text)">
            {order.customerName}
          </p>
          <p className="text-xs text-(--color-muted)">
            {order.customerEmail}
          </p>
          <p className="text-xs text-(--color-muted)">
            {order.customerPhone}
          </p>
        </div>
        <div className="rounded-xl border border-(--color-border) bg-(--color-background) p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">
            Shipping Address
          </p>
          <p className="mt-1 text-sm text-(--color-text)">
            {order.shippingAddress}
          </p>
          <p className="text-xs text-(--color-muted)">
            {order.city}, {order.state} - {order.pincode}
          </p>
        </div>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">
          Items
        </p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-(--color-border)">
                <th className="pb-2 font-semibold text-(--color-text)">
                  Product
                </th>
                <th className="pb-2 font-semibold text-(--color-text)">
                  Qty
                </th>
                <th className="pb-2 font-semibold text-(--color-text)">
                  Weight
                </th>
                <th className="pb-2 text-right font-semibold text-(--color-text)">
                  Price
                </th>
                <th className="pb-2 text-right font-semibold text-(--color-text)">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, index) => (
                <tr key={index} className="border-b border-(--color-border)/60">
                  <td className="py-3 font-medium text-(--color-primary)">
                    {item.name}
                  </td>
                  <td className="py-3 text-(--color-text)">
                    {item.quantity}
                  </td>
                  <td className="py-3 text-(--color-muted)">
                    {item.weight || '-'}
                  </td>
                  <td className="py-3 text-right text-(--color-text)">
                    {formatPrice(item.price)}
                  </td>
                  <td className="py-3 text-right font-semibold text-(--color-text)">
                    {lineTotal(item.price, item.quantity)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-(--color-muted)">Subtotal</span>
            <span className="font-medium text-(--color-text)">
              {formatPrice(order.subtotal)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-(--color-muted)">Delivery</span>
            <span className="font-medium text-(--color-text)">
              {formatPrice(order.deliveryFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-(--color-muted)">Packaging</span>
            <span className="font-medium text-(--color-text)">
              {formatPrice(order.packagingFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-(--color-muted)">Platform fee</span>
            <span className="font-medium text-(--color-text)">
              {formatPrice(order.platformFee)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-(--color-muted)">
              GST ({order.gstRate}%)
            </span>
            <span className="font-medium text-(--color-text)">
              {formatPrice(order.gstAmount)}
            </span>
          </div>
        </div>
        <div className="flex items-end justify-end">
          <div className="rounded-xl border border-(--color-accent-light) bg-(--color-background) p-4 text-right">
            <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">
              Grand Total
            </p>
            <p className="text-2xl font-bold text-(--color-primary)">
              {formatPrice(order.grandTotal)}
            </p>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="mt-4 rounded-xl border border-dashed border-(--color-border) bg-(--color-background) p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">
            Notes
          </p>
          <p className="mt-1 text-sm text-(--color-text)">
            {order.notes}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
