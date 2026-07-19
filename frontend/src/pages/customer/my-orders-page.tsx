import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { fetchCustomerOrders } from '../../api/orders';
import OrderCard from '../../components/orders/OrderCard';
import OrderListItem from '../../components/orders/OrderListItem';
import type { Order } from '../../types/types';

type TimeFilter = 'this-week' | 'this-month' | 'later-this-year' | 'all';

const MyOrdersPage = () => {
  const hasFetchedOrders = useRef(false);
  const { user, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      if (!user._id || !user.token) return;

      try {
        setLoading(true);
        setError('');

        if (hasFetchedOrders.current) return;
        hasFetchedOrders.current = true;
        const { response, data } = await fetchCustomerOrders(
          user._id,
          user.token,
        );

        if (response.status === 401) {
          showToast('Unauthorized access. Please log in again.', 'error');
          setError('Unauthorized');
          return;
        }

        if (data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || 'Failed to fetch orders');
        }
      } catch (err) {
        setError('Something went wrong');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user._id, user.token, showToast]);

  const matchesTimeFilter = (order: Order, filter: TimeFilter) => {
    if (filter === 'all') return true;
    const orderDate = new Date(order.createdAt || '');
    if (isNaN(orderDate.getTime())) return true;

    const now = new Date();

    if (filter === 'this-week') {
      const startOfWeek = new Date(now);
      const day = startOfWeek.getDay();
      const diff = day === 0 ? 6 : day - 1;
      startOfWeek.setDate(startOfWeek.getDate() - diff);
      startOfWeek.setHours(0, 0, 0, 0);
      return orderDate >= startOfWeek;
    }

    if (filter === 'this-month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return orderDate >= startOfMonth;
    }

    if (filter === 'later-this-year') {
      return orderDate >= new Date(now.getFullYear(), 0, 1);
    }

    return true;
  };

  const matchesSearch = (order: Order, query: string) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      order._id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.customerEmail.toLowerCase().includes(q) ||
      order.customerPhone.includes(q) ||
      order.shippingAddress.toLowerCase().includes(q) ||
      order.city.toLowerCase().includes(q) ||
      order.state.toLowerCase().includes(q) ||
      order.pincode.includes(q)
    );
  };

  const filteredOrders = orders.filter(
    (order) =>
      matchesTimeFilter(order, timeFilter) && matchesSearch(order, searchQuery),
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-(--color-muted)">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-(--color-primary)">My Orders</h1>
      <p className="mt-2 text-(--color-muted)">
        Track and review your past orders
      </p>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'All', value: 'all' },
            { label: 'This Week', value: 'this-week' },
            { label: 'This Month', value: 'this-month' },
            { label: 'Later this year', value: 'later' },
          ].map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setTimeFilter(item.value as TimeFilter)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition cursor-pointer ${
                timeFilter === item.value
                  ? 'border-(--color-accent) bg-(--color-accent) text-white'
                  : 'border-(--color-border) bg-(--color-surface) text-(--color-text) hover:border-(--color-accent)'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by shipping details, customer, order id..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-full border border-(--color-border) bg-(--color-surface) px-5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:border-(--color-accent) focus:outline-none sm:w-80"
        />
      </div>

      {selectedOrder ? (
        <div className="mt-8">
          <button
            type="button"
            onClick={() => setSelectedOrder(null)}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-(--color-accent) transition hover:underline cursor-pointer"
          >
            ← Back to orders
          </button>
          <OrderCard order={selectedOrder} />
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-(--color-border) p-12 text-center">
              <p className="text-(--color-muted)">No orders found.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <OrderListItem
                key={order._id}
                order={order}
                onClick={setSelectedOrder}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
