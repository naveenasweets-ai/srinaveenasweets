/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from 'react';
import type {
  CartItem,
  Product,
  StoreContextType,
  Toast,
  ToastType,
  User,
} from '../types/contextTypes';
import type {
  CategoryConfig,
  CategoryInfoType,
  FeatureItem,
  HeroContent,
  ChargesConfig,
  LegalPage,
  DeliverablePincodesConfig,
} from '../types/appContentTypes';
import { getSelectedWeightOption } from '../utils/productInventory';
import { getDefaultLegalPages } from '../utils/utils';

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const raw = localStorage.getItem('sns_user');
      if (raw) {
        const parsed = JSON.parse(raw) as User;
        return {
          name: parsed.name || '',
          email: parsed.email || '',
          role:
            parsed.role === 'admin'
              ? 'admin'
              : parsed.role === 'customer'
                ? 'customer'
                : 'guest',
          loggedIn: !!parsed.loggedIn,
          token: parsed.token || '',
          _id: parsed._id || '',
        };
      }
    } catch (e) {
      // ignore and fall back to defaults
    }
    return {
      name: '',
      email: '',
      role: 'guest',
      phone: '',
      loggedIn: false,
      token: '',
      _id: '',
    };
  });

  const [products, setProducts] = useState<Product[]>([]);
  const [toast, setToast] = useState<Toast | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [siteContent, setSiteContent] = useState<{
    categories: CategoryConfig[];
    heroContent: HeroContent | null;
    categoriesInfo: CategoryInfoType;
    features: FeatureItem[];
    charges: ChargesConfig;
    legalPages: LegalPage[];
    deliverablePincodes: DeliverablePincodesConfig;
  }>({
    categories: [],
    heroContent: null,
    categoriesInfo: {
      title: 'Our Categories',
      description:
        'Explore our wide range of traditional sweets, festive treats, and bakery delights. From rich milk sweets to soft cakes, we have something for every occasion.',
      selectedCategories: [],
    },
    features: [],
    charges: {
      deliveryFee: 40,
      freeDeliveryThreshold: 499,
      platformFee: 29,
      packagingFee: 15,
      gstRate: 5,
    },
    legalPages: getDefaultLegalPages(),
    deliverablePincodes: [],
  });

  const handpickedCats = siteContent?.categoriesInfo?.selectedCategories?.map(
    (cat) => cat.name,
  );

  const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);
  const wishlistCount = wishlist.length;

  const availableCartItems = cart.filter((item) => {
    const selectedWeightOrUnits = getSelectedWeightOption(
      item.product,
      item.weight,
    );
    return Boolean(selectedWeightOrUnits && selectedWeightOrUnits.value > 0);
  });

  const cartTotal = availableCartItems.reduce(
    (sum, item) => {
      const selectedOption = getSelectedWeightOption(
        item.product,
        item.weight,
      );
      const price = selectedOption ? selectedOption.price : item.product.price;
      return sum + price * item.quantity;
    },
    0,
  );

  const cartCount = availableCartItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,

        toast,
        showToast,

        siteContent,
        setSiteContent,

        selectedCategory,
        setSelectedCategory,

        products,
        setProducts,

        handpickedCats,

        cart,
        setCart,

        cartTotal,
        cartCount,

        wishlist,
        setWishlist,

        isInWishlist,
        wishlistCount,
      }}
    >
      {children}

      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-2xl border flex items-center gap-3 animate-float transition-all max-w-sm ${
            toast.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-900'
              : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-900'
                : toast.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span className="text-sm font-medium tracking-wide">
            {toast.message}
          </span>
        </div>
      )}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
