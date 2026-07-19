import { useEffect, useRef, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { fetchCustomerOrders } from '../../api/orders';
import OrderCard from '../../components/orders/OrderCard';
import OrderListItem from '../../components/orders/OrderListItem';
import CustomDropdown from '../../components/CustomDropdown';
import CustomDatepicker from '../../components/CustomDatepicker';
import type { Order } from '../../types/types';

type TimeFilter = 'this-week' | 'this-month' | 'this-year' | 'later' | 'all';

const MyOrdersPage = () => {
  const hasFetchedOrders = useRef(false);
  const { user, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

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

    if (filter === 'this-year') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return orderDate >= startOfYear;
    }

    if (filter === 'later') {
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      return orderDate < startOfYear;
    }

    return true;
  };

  const matchesDateFilter = (order: Order, date: string) => {
    if (!date) return true;
    const orderDate = new Date(order.createdAt || '');
    if (isNaN(orderDate.getTime())) return false;
    const orderDay = new Date(
      orderDate.getFullYear(),
      orderDate.getMonth(),
      orderDate.getDate(),
    );
    const selectedDay = new Date(date);
    return orderDay.getTime() === selectedDay.getTime();
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
      matchesTimeFilter(order, timeFilter) &&
      matchesDateFilter(order, selectedDate) &&
      matchesSearch(order, searchQuery),
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

  const timeOptions = [
    { label: 'All Time', value: 'all' },
    { label: 'This Week', value: 'this-week' },
    { label: 'This Month', value: 'this-month' },
    { label: 'This Year', value: 'this-year' },
    { label: 'Later', value: 'later' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-(--color-primary)">My Orders</h1>
      <p className="mt-2 text-(--color-muted)">
        Track and review your past orders
      </p>

      <div className='flex'>
        <input
          type="text"
          placeholder="Search by shipping details, customer, order id..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input w-full mt-6 rounded-full border border-(--color-border) bg-(--color-surface) px-5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:border-(--color-accent) focus:outline-none sm:w-80"
        />
      </div>

      <div className="mt-4 flex justify-end items-center gap-3">
        <CustomDatepicker
          value={selectedDate}
          onChange={setSelectedDate}
          placeholder="Select date"
        />

        <CustomDropdown
          options={timeOptions}
          value={timeFilter}
          onChange={(value) => setTimeFilter(value as TimeFilter)}
          placeholder="Time filter"
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
              <p className="text-(--color-muted)">
                You haven&apos;t placed any orders yet.
              </p>
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
