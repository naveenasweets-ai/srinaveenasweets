/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import AdminLoginPage from './pages/admin-login';
import { useStore } from './context/StoreContext';
import AdminDashboard from './pages/admin/dashboard';
import HomePage from './pages/home';
import AccessDenied from './pages/access-denied';
import AppCustomize from './pages/admin/app-customize';
import { useEffect, useRef } from 'react';
import AppCustomApi from './api/app-customize';
import ProductCatalogue from './pages/admin/products-catalogue';
import ProductApi from './api/product';
import { getDefaultFeatures } from './utils/utils';
import CategoryPage from './pages/category-page';
import ProductDetailPage from './pages/product-detail-page';
import CustomerApi from './api/customer';
import CartPage from './pages/customer/cart-page';
import WishlistPage from './pages/customer/wishlist-page';
import Checkout from './pages/customer/checkout-page';
import OrderConfirmationPage from './pages/customer/order-confirmation-page';
import MyOrdersPage from './pages/customer/my-orders-page';
import AllOrders from './pages/admin/all-orders';
import type { User } from './types/contextTypes';

const ProtectedRoute = ({
  role,
  element,
  user,
}: {
  role: string;
  element: any;
  user: User;
}) => {
  return user.loggedIn && user.role === role ? element : <AccessDenied />;
};

export default function App() {
  const { user, setSiteContent, setProducts } = useStore();
  const { fetchSiteContent } = AppCustomApi();
  const { fetchProducts } = ProductApi();
  const { getCustomerData } = CustomerApi();
  const defaultFeatures = getDefaultFeatures();
  const location = useLocation();

  const hasFetchedSiteContent = useRef(false);
  const hasFetchedProducts = useRef(false);
  const hasFetchedUser = useRef(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  useEffect(() => {
    if (hasFetchedSiteContent.current) return;
    hasFetchedSiteContent.current = true;
    fetchSiteContent().then((content) =>
      setSiteContent({
        categories: content.categories || [],
        heroContent: content.heroContent || null,
        categoriesInfo: content.categoriesInfo || {
          title: 'Our Categories',
          description:
            'Explore our wide range of traditional sweets, festive treats, and bakery delights. From rich milk sweets to soft cakes, we have something for every occasion.',
          selectedCategories: content.categoriesInfo?.selectedCategories || [],
        },
        features: content.features.map(
          (preset: { title: string; description: string }, index: number) => {
            if (preset.title === defaultFeatures[index].title) {
              return {
                title: preset.title,
                description: preset.description || '',
                icon: defaultFeatures[index].icon,
              };
            }
          },
        ),
        charges: content.charges || {
          deliveryFee: 40,
          freeDeliveryThreshold: 499,
          platformFee: 29,
          packagingFee: 15,
          gstRate: 5,
        },
      }),
    );
  }, []);

  useEffect(() => {
    if (hasFetchedProducts.current) return;
    hasFetchedProducts.current = true;
    fetchProducts().then((products) => {
      if (products && Array.isArray(products)) {
        setProducts(products);
      }
    });
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      if (user.loggedIn && user.role === 'customer') {
        await getCustomerData();
        hasFetchedUser.current = true;
      }
    };

    if (hasFetchedUser.current) return;
    getUserData();
  }, [user]);

  return (
    <div className="min-h-screen bg-(--color-background) text-(--color-text) flex flex-col justify-between font-sans selection:bg-(--color-accent-light) selection:text-(--color-text)">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/admin-login" element={<AdminLoginPage />} />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute role="admin" element={<AdminDashboard />} user={user} />
            }
          />
          <Route
            path="/admin-products"
            element={
              <ProtectedRoute role="admin" element={<ProductCatalogue />} user={user} />
            }
          />
          <Route
            path="/app-customize"
            element={<ProtectedRoute role="admin" element={<AppCustomize />} user={user} />}
          />

          <Route path="/category/:slug" element={<CategoryPage />} />

          <Route path="/product/:slug" element={<ProductDetailPage />} />

          <Route
            path="/cart"
            element={<ProtectedRoute role="customer" element={<CartPage />} user={user} />}
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute role="customer" element={<WishlistPage />} user={user} />
            }
          />
          <Route
            path="/checkout"
            element={<ProtectedRoute role="customer" element={<Checkout />} user={user} />}
          />
          <Route
            path="/order-confirmation"
            element={
              <ProtectedRoute
                role="customer"
                element={<OrderConfirmationPage />}
                user={user}
              />
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute
                role="customer"
                element={<MyOrdersPage />}
                user={user}
              />
            }
          />
          <Route
            path="/admin-orders"
            element={
              <ProtectedRoute
                role="admin"
                element={<AllOrders />}
                user={user}
              />
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
