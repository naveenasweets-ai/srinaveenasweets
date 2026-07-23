/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import { useStore } from '../context/StoreContext';
import type { CartItem } from '../types/contextTypes';

const CustomerApi = () => {
  const apiUrl =
    import.meta.env.MODE === 'production'
      ? (import.meta.env.VITE_BACKEND_URL as string)
      : 'http://localhost:4001';

  const { products, setCart, user, showToast, setWishlist } = useStore();
  const productsRef = useRef(products);
  const userRef = useRef(user);

  useEffect(() => {
    productsRef.current = products;
  }, [products]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const getCustomerData = async () => {
    try {
      const currentUser = userRef.current;
      if (!currentUser?._id) return;

      const response = await fetch(
        `${apiUrl}/api/customer/getUser?_id=${currentUser._id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${currentUser?.token}`,
          },
        },
      );

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

      const returnData = await response.json();
      const latestProducts = productsRef.current;
      if (returnData.success) {
        const cartItems = returnData.data.cartItems || [];
        const wishlistItems = returnData.data.wishlist || [];

        const updatedCart = cartItems
          .map((item: any) => {
            const product = latestProducts.find(
              (p) => p._id === item.productId,
            );

            if (product) {
              return {
                product,
                quantity: item.quantity,
                weight: item.weight,
              };
            }
            return null;
          })
          .filter((item: any) => item !== null) as CartItem[];

        setCart(updatedCart);
        setWishlist(wishlistItems);
      }
    } catch (error) {
      showToast('Failed to fetch customer data.', 'error');
      console.error('Error fetching customer data:', error);
    }
  };

  const updateCart = async (cart: CartItem[], user: any) => {
    if (!user.loggedIn) {
      showToast('Please log in to update your cart.', 'warning');
      return;
    }
    if (user.role !== 'customer') {
      showToast('Only customers can update the cart.', 'warning');
      return;
    }
    const payload = {
      customerId: user._id,
      products: cart.map((item) => ({
        productId: item.product._id,
        quantity: item.quantity,
        weight: item.weight,
      })),
    };

    try {
      const response = await fetch(`${apiUrl}/api/customer/updateCart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

      return response.json();
    } catch (error) {
      showToast('Failed to update cart.', 'error');
      console.error('Error updating cart:', error);
    }
  };

  const updateWishlist = async (wishlist: string[], user: any) => {
    if (!user.loggedIn) {
      showToast('Please log in to update your wishlist.', 'warning');
      return;
    }
    if (user.role !== 'customer') {
      showToast('Only customers can update the wishlist.', 'warning');
      return;
    }

    const payload = {
      customerId: user._id,
      wishlist: wishlist,
    };

    try {
      const response = await fetch(`${apiUrl}/api/customer/updateWishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        return;
      }

      return response.json();
    } catch (error) {
      showToast('Failed to update wishlist.', 'error');
      console.error('Error updating wishlist:', error);
    }
  };

  const getSavedAddresses = async (token: string) => {
    const response = await fetch(`${apiUrl}/api/customer/addresses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    return { response, data };
  };

  const addSavedAddress = async (
    token: string,
    address: {
      fullname: string;
      mobile: string;
      fullAddress: string;
      city: string;
      state: string;
      pincode: string;
      lat: number;
      lng: number;
    },
  ) => {
    const response = await fetch(`${apiUrl}/api/customer/addresses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(address),
    });

    const data = await response.json();
    return { response, data };
  };

  const updateSavedAddress = async (
    token: string,
    addressId: string,
    address: {
      fullname: string;
      mobile: string;
      fullAddress: string;
      city: string;
      state: string;
      pincode: string;
      lat: number;
      lng: number;
    },
  ) => {
    const response = await fetch(
      `${apiUrl}/api/customer/addresses/${addressId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(address),
      },
    );

    const data = await response.json();
    return { response, data };
  };

  const deleteSavedAddress = async (token: string, addressId: string) => {
    const response = await fetch(
      `${apiUrl}/api/customer/addresses/${addressId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();
    return { response, data };
  };

  return {
    getCustomerData,
    updateCart,
    updateWishlist,
    getSavedAddresses,
    addSavedAddress,
    updateSavedAddress,
    deleteSavedAddress,
  };
};

export default CustomerApi;
