/* eslint-disable @typescript-eslint/no-explicit-any */
import type { CartItem, Product } from '../types/contextTypes';
import {
  getSelectedWeightOption,
  getDefaultInventorySelection,
} from './productInventory';
import { useStore } from '../context/StoreContext';
import CustomerApi from '../api/customer';

const CustomerUtils = () => {
  const { user, showToast, cart, setCart, wishlist, setWishlist } = useStore();
  const { updateCart, updateWishlist } = CustomerApi();

  const addToCart = async (
    product: Product,
    quantity = 1,
    activeWeight?: string,
    silent = false,
  ) => {
    const resolvedWeight =
      activeWeight ?? getDefaultInventorySelection(product);
    const selectedSizeOption = getSelectedWeightOption(product, resolvedWeight);
    if (!selectedSizeOption || selectedSizeOption.value <= 0) {
      showToast('This is currently out of stock.', 'warning');
      return;
    }

    const safeQuantity = Math.min(quantity, selectedSizeOption.value);
    if (safeQuantity < quantity) {
      showToast(
        `Only ${selectedSizeOption.value} ${selectedSizeOption.unit} available.`,
        'warning',
      );
    }

    const existingItem = cart.find(
      (item) =>
        item.product._id === product._id && item.weight === resolvedWeight,
    );

    const newCart = existingItem
      ? cart.map((item) =>
          item.product._id === product._id && item.weight === resolvedWeight
            ? {
                ...item,
                quantity: item.quantity + safeQuantity,
                weight: resolvedWeight,
              }
            : item,
        )
      : [...cart, { product, quantity: safeQuantity, weight: resolvedWeight }];

    await updateCart(newCart, user).then((res: any) => {
      if (res.success) {
        setCart(newCart);
        if (!silent) showToast('Added item(s) to your bag!', 'success');
      } else {
        if (!silent) showToast('Failed to add item to cart.', 'error');
      }
    });
  };

  const removeFromCart = async (productId: string, weight?: string, silent = false) => {
    const newCart = cart.filter((item) => {
      const matchesProduct = item.product._id === productId;
      return weight
        ? !(matchesProduct && item.weight === weight)
        : !matchesProduct;
    });

    await updateCart(newCart, user).then((res) => {
      if (res.success) {
        setCart(newCart);
        if (!silent) showToast('Removed item from your bag!', 'success');
      } else {
        if (!silent) showToast('Failed to remove item from cart.', 'error');
      }
    });
  };

  const updateQuantity = async (
    productId: string,
    quantity: number,
    weight?: string,
    silent = false,
  ) => {
    if (quantity <= 0) {
      await removeFromCart(productId, weight, silent);
      return;
    }

    const matchingItem = cart.find(
      (item) => item.product._id === productId && item.weight === weight,
    );
    const weightOrUnitsOption = matchingItem
      ? getSelectedWeightOption(matchingItem.product, matchingItem.weight)
      : null;

    if (weightOrUnitsOption && quantity > weightOrUnitsOption.value) {
      showToast(
        `Only ${weightOrUnitsOption.value} ${weightOrUnitsOption.unit} available.`,
        'warning',
      );
      return;
    }

    const newCart = cart.map((item) =>
      item.product._id === productId && item.weight === weight
        ? { ...item, quantity }
        : item,
    );

    await updateCart(newCart, user).then((res) => {
      if (res.success) {
        setCart(newCart);
        if (!silent) showToast('Updated item quantity!', 'success');
      } else {
        if (!silent) showToast('Failed to update item quantity.', 'error');
      }
    });
  };

  const clearCart = async () => {
    const newCart: CartItem[] = [];
    await updateCart(newCart, user).then((res) => {
      if (res.success) {
        setCart(newCart);
        showToast('Cleared your bag!', 'success');
      } else {
        showToast('Failed to clear cart.', 'error');
      }
    });
  };

  const toggleWishlist = (productId: string) => {
    console.log('Toggling wishlist for productId: ', productId);
    const updatedWishlist = wishlist.includes(productId)
      ? wishlist.filter((id) => id !== productId)
      : [...wishlist, productId];

    updateWishlist(updatedWishlist, user).then((res) => {
      if (res.success) {
        setWishlist(updatedWishlist);
        showToast(
          wishlist.includes(productId)
            ? 'Removed from your wishlist!'
            : 'Added to your wishlist!',
          'success',
        );
      } else {
        showToast('Failed to update wishlist.', 'error');
      }
    });
  };

  return {
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleWishlist,
  };
};

export default CustomerUtils;
