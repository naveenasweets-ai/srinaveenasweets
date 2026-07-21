import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { fetchAllOrders } from '../../api/orders';
import OrderCard from '../../components/orders/OrderCard';
import OrderListItem from '../../components/orders/OrderListItem';
import CustomDropdown from '../../components/CustomDropdown';
import CustomDatepicker from '../../components/CustomDatepicker';
import type { Order } from '../../types/types';

type TimeFilter = 'this-week' | 'this-month' | 'this-year' | 'later' | 'all';
type StatusFilter = 'all' | 'pending' | 'confirmed' | 'delivered';

const AllOrders = () => {
  const { user, showToast } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    const loadOrders = async () => {
      if (!user.token) return;

      try {
        setLoading(true);
        setError('');
        const { response, data } = await fetchAllOrders(user.token);

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
  }, [user.token, showToast]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { all: orders.length };
    orders.forEach((order) => {
      const key = order.orderStatus.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }, [orders]);

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
    const [year, month, day] = date.split('-').map(Number);
    return (
      orderDate.getFullYear() === year &&
      orderDate.getMonth() === month - 1 &&
      orderDate.getDate() === day
    );
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
      (statusFilter === 'all' ||
        order.orderStatus.toLowerCase() === statusFilter) &&
      matchesSearch(order, searchQuery),
  );

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-(--color-muted)">Loading all orders...</p>
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

  const statusTabs: { label: string; value: StatusFilter }[] = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Confirmed', value: 'confirmed' },
    { label: 'Delivered', value: 'delivered' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-(--color-primary)">All Orders</h1>
      <p className="mt-2 text-(--color-muted)">
        Manage and track all customer orders
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {statusTabs.map((tab) => {
          const count = statusCounts[tab.value] || 0;
          const isActive = statusFilter === tab.value;
          const activeClass = isActive
            ? 'border-(--color-accent) ring-2 ring-(--color-accent)/20'
            : 'border-(--color-border) hover:border-(--color-accent)';
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setStatusFilter(tab.value)}
              className={`flex flex-col items-center justify-center rounded-2xl border bg-(--color-surface) px-3 py-4 text-center shadow-sm transition cursor-pointer ${activeClass}`}
            >
              <span className="text-[11px] font-semibold uppercase tracking-wider text-(--color-muted)">
                {tab.label}
              </span>
              <span
                className={`mt-1 text-2xl font-bold ${
                  isActive ? 'text-(--color-accent)' : 'text-(--color-text)'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search by shipping details, customer, order id..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full search-input rounded-full border border-(--color-border) bg-(--color-surface) px-5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-muted) focus:border-(--color-accent) focus:outline-none sm:w-80"
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

export default AllOrders;
