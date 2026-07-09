/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/static-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Routes, Route } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import AdminLoginPage from './pages/admin-login';
import { useStore } from './context/StoreContext';
import AdminDashboard from './pages/admin/dashboard';
import HomePage from './pages/home';
import AccessDenied from './pages/access-denied';
import AppCustomize from './pages/admin/app-customize';
import { useEffect } from 'react';
import AppCustomApi from './api/app-customize';

export default function App() {
  const { user, setSiteContent } = useStore();
  const { fetchSiteContent } = AppCustomApi();

  useEffect(() => {
    fetchSiteContent().then((content) =>
      setSiteContent({
        categories: content.categories || [],
      }),
    );
  }, []);

  const ProtectedRoute = ({
    role,
    element,
  }: {
    role: string;
    element: any;
  }) => {
    return user.loggedIn && user.role === role ? element : <AccessDenied />;
  };

  console.log('Current user:', user); // Log the current user state
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
              <ProtectedRoute role="admin" element={<AdminDashboard />} />
            }
          />
          <Route
            path="/app-customize"
            element={<ProtectedRoute role="admin" element={<AppCustomize />} />}
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
