const apiUrl =
  import.meta.env.MODE === 'production'
    ? (import.meta.env.VITE_BACKEND_URL as string)
    : 'http://localhost:4001';

export const fetchCustomerOrders = async (
  customerId: string,
  token: string,
) => {
  const response = await fetch(
    `${apiUrl}/api/orders/customer/${customerId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();
  return { response, data };
};

export const fetchAllOrders = async (token: string) => {
  const response = await fetch(`${apiUrl}/api/orders`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  return { response, data };
};

export const updateOrderStatus = async (
  orderId: string,
  status: string,
  token: string,
) => {
  const response = await fetch(`${apiUrl}/api/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });

  const data = await response.json();
  return { response, data };
};
