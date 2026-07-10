import { useEffect, useState } from 'react';
import { useStore } from '../../context/StoreContext';
import AppCustomApi from '../../api/app-customize';
import ProductApi from '../../api/product';
import type { Product } from '../../types/contextTypes';
import type { CategoryConfig } from '../../types/appContentTypes';

interface SelectedCategoryItem {
  name: string;
  slug: string;
  selectedProducts: string[];
  _id?: string;
}

const Handpicked = () => {
  const { siteContent, products } = useStore();

  const { saveHandpickedCategories } = AppCustomApi();
  const { fetchProducts } = ProductApi();

  const [selectedCategories, setSelectedCategories] = useState<
    SelectedCategoryItem[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const selectedCategoriesSetting = async () => {
      if (siteContent?.categoriesInfo?.selectedCategories) {
        setSelectedCategories(siteContent.categoriesInfo.selectedCategories);
      }
    };
    selectedCategoriesSetting();
  }, [siteContent]);

  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, []);

  const allCategories = siteContent?.categories || [];

  const handleCategoryToggle = (category: CategoryConfig) => {
    setSelectedCategories((prev) => {
      const exists = prev.find((item) => item.name === category.name);

      if (exists) {
        return prev.filter((item) => item.name !== category.name);
      } else {
        return [
          ...prev,
          {
            name: category.name,
            slug: category.slug,
            selectedProducts: [],
            _id: category._id,
          },
        ];
      }
    });
  };

  const handleProductToggle = (
    categoryId: string | undefined,
    productId: string,
  ) => {
    setSelectedCategories((prev) =>
      prev.map((item) => {
        if (item._id === categoryId) {
          const productExists = item.selectedProducts.includes(productId);
          return {
            ...item,
            selectedProducts: productExists
              ? item.selectedProducts.filter((id) => id !== productId)
              : [...item.selectedProducts, productId],
          };
        }
        return item;
      }),
    );
  };

  const getProductsForCategory = (categoryName: string | undefined) => {
    return products.filter((product) => product.category === categoryName);
  };

  const handleSave = async () => {
    setIsLoading(true);
    const dataToSave = selectedCategories.map((item) => ({
      name: item.name,
      slug: item.slug,
      selectedProducts: item.selectedProducts,
    }));

    const result = await saveHandpickedCategories(dataToSave);
    setIsLoading(false);

    if (result?.success) {
      console.log('Handpicked categories saved successfully');
    }
  };

  const categories = allCategories.filter((cat) => cat.type === 'category');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold text-[var(--color-primary-dark)]">
          Handpicked Categories and Products
        </h2>
        <p className="text-sm text-[var(--color-primary-light)]">
          Customize the handpicked categories and products displayed on the home
          page.
        </p>
      </div>

      <div className="rounded-[28px] border border-[#f3d48a]/70 bg-[linear-gradient(135deg,#fffdf7_0%,#fff8ef_100%)] p-5 shadow-[0_18px_45px_rgba(95,16,33,0.08)] sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold text-[var(--color-primary-dark)]">
            Select Categories
          </h3>
          <span className="text-sm text-[var(--color-primary-light)]">
            {selectedCategories.length} selected
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {categories.length > 0 ? (
            categories.map((category) => {
              const isSelected = selectedCategories.some(
                (item) => item.name === category.name,
              );
              return (
                <label
                  key={category._id}
                  className="flex items-center gap-3 cursor-pointer rounded-lg p-3 hover:bg-white/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-5 h-5 rounded cursor-pointer accent-[#e8a643]"
                  />
                  <span className="text-sm font-medium text-[var(--color-primary-dark)]">
                    {category.name}
                  </span>
                </label>
              );
            })
          ) : (
            <p className="text-sm text-[var(--color-primary-light)] py-4">
              No categories available
            </p>
          )}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className="flex flex-col gap-4">
          {selectedCategories.map((selectedCat) => {
            const categoryProducts = getProductsForCategory(selectedCat.name);

            return (
              <div
                key={selectedCat._id}
                className="rounded-[28px] border border-[#f3d48a]/70 bg-[linear-gradient(135deg,#fffdf7_0%,#fff8ef_100%)] p-5 shadow-[0_18px_45px_rgba(95,16,33,0.08)] sm:p-6"
              >
                <div className="mb-4 flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-[var(--color-primary-dark)]">
                    Products for{' '}
                    <span className="text-[#e8a643]">{selectedCat.name}</span>
                  </h3>
                  <span className="text-sm text-[var(--color-primary-light)]">
                    {selectedCat.selectedProducts.length} selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-3">
                  {categoryProducts.length > 0 ? (
                    categoryProducts.map((product: Product) => {
                      const isSelected = selectedCat.selectedProducts.includes(
                        product._id,
                      );
                      return (
                        <label
                          key={product._id}
                          className="flex items-center gap-3 cursor-pointer rounded-lg p-3 hover:bg-white/50 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              handleProductToggle(selectedCat._id, product._id)
                            }
                            className="w-5 h-5 rounded cursor-pointer accent-[#e8a643]"
                          />
                          <div className="flex flex-col flex-1">
                            <span className="text-sm font-medium text-[var(--color-primary-dark)]">
                              {product.name}
                            </span>
                            <span className="text-xs text-[var(--color-primary-light)]">
                              ₹{product.price}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <p className="text-sm text-[var(--color-primary-light)] py-4">
                      No products available for this category
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-6 py-2 bg-[#e8a643] text-white rounded-lg font-medium hover:bg-[#d89233] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Handpicked;
