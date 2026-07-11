import { useStore } from '../context/StoreContext';
import type { CategoryConfig, HeroContent } from '../types/appContentTypes';
import type { FeatureItem } from '../types/contextTypes';

/* eslint-disable @typescript-eslint/no-explicit-any */
const AppCustomApi = () => {
  const apiUrl =
    import.meta.env.MODE === 'production'
      ? (import.meta.env.VITE_BACKEND_URL as string)
      : 'http://localhost:4001';

  const { user, showToast } = useStore();

  const fetchSiteContent = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/site-content`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to fetch hero content');
      }
      return json || null;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to fetch hero content',
        'error',
      );
      return null;
    }
  };

  const saveCategory = async (category: Partial<CategoryConfig>) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(category),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save category');
      }
      showToast('Category saved successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save category',
        'error',
      );
      return null;
    }
  };

  const updateCategory = async (
    id: string,
    updates: Partial<CategoryConfig>,
  ) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(updates),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to update category');
      }
      showToast('Category updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update category',
        'error',
      );
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/admin/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to delete category');
      }
      showToast('Category deleted successfully', 'success');
      return true;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to delete category',
        'error',
      );
      return false;
    }
  };

  const saveHeroContent = async (content: HeroContent) => {
    try {
      const response = await fetch(`${apiUrl}/api/site-content/hero-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(content),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save hero content');
      }
      showToast('Hero section updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save hero content',
        'error',
      );
      return null;
    }
  };

  const saveHandpickedCategories = async (selectedCategories: any[]) => {
    try {
      const response = await fetch(
        `${apiUrl}/api/admin/handpicked-categories`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
          body: JSON.stringify({ selectedCategories }),
        },
      );
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save handpicked categories');
      }
      showToast('Handpicked categories saved successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error
          ? err.message
          : 'Failed to save handpicked categories',
        'error',
      );
      return null;
    }
  };

  const saveFeatures = async (features: FeatureItem[]) => {
    try {
      const response = await fetch(`${apiUrl}/api/site-content/features`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({ features }),
      });
      const json = await response.json();
      if (!response.ok) {
        throw new Error(json.error || 'Failed to save features');
      }
      showToast('Features updated successfully', 'success');
      return json;
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save features',
        'error',
      );
      return null;
    }
  };

  return {
    saveCategory,
    updateCategory,
    deleteCategory,
    fetchSiteContent,
    saveHeroContent,
    saveHandpickedCategories,
    saveFeatures,
  };
};

export default AppCustomApi;
