import type { Order } from '../../types/types';

type OrderListItemProps = {
  order: Order;
  onClick: (order: Order) => void;
};

const formatPrice = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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

const OrderListItem = ({ order, onClick }: OrderListItemProps) => {
  return (
    <button
      type="button"
      onClick={() => onClick(order)}
      className="w-full rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 text-left shadow-sm transition hover:border-(--color-accent) hover:shadow-md cursor-pointer"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-(--color-muted)">
            Order ID
          </p>
          <p className="font-mono text-base font-semibold text-(--color-primary)">
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

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor(order.paymentStatus)}`}
        >
          Payment: {order.paymentStatus}
        </span>
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${statusColor(order.orderStatus)}`}
        >
          Order: {order.orderStatus}
        </span>
        <span className="inline-flex items-center rounded-full border border-(--color-border) bg-(--color-background) px-2.5 py-1 text-xs font-semibold text-(--color-text)">
          {order.paymentMethod === 'razorpay' ? 'Razorpay' : 'Cash on Delivery'}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <div className="text-(--color-muted)">
          <span className="font-medium text-(--color-text)">{order.customerName}</span>
          <span className="mx-2">•</span>
          <span>{order.city}, {order.state}</span>
        </div>
        <span className="font-semibold text-(--color-primary)">
          {formatPrice(order.grandTotal)}
        </span>
      </div>
    </button>
  );
};

export default OrderListItem;
