import type { Product } from '../types/contextTypes';
import { useStore } from '../context/StoreContext';
import AuthApi from './auth';

const ProductApi = () => {
  const apiUrl =
    import.meta.env.MODE === 'production'
      ? (import.meta.env.VITE_BACKEND_URL as string)
      : 'http://localhost:4001';

  const { user, showToast } = useStore();
  const { logout } = AuthApi();

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/products`);

      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch products');
      }

      if (json.success) {
        return json.products as Product[];
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to fetch products',
        'error',
      );
      return [];
    }
  };

  const saveProduct = async (product: Product) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(product),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save product');
      }
      showToast('Product created successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save product',
        'error',
      );
      return null;
    }
  };

  const updateProduct = async (id: string, product: Product) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(product),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to update product');
      }
      showToast('Product updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update product',
        'error',
      );
      return null;
    }
  };

  const deleteProduct = async (id: string, onClose: () => void) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const json = await response.json();

      if (response.status === 401) {
        showToast('Unauthorized access. Please log in again.', 'error');
        logout();
        return;
      }

      if (json.success) {
        showToast('Product deleted!', 'success');
        onClose();
      } else {
        showToast(json.error || 'Failed to delete product', 'error');
      }
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete product',
        'error',
      );
    }
  };

  return {
    fetchProducts,
    saveProduct,
    updateProduct,
    deleteProduct,
  };
};

export default ProductApi;
