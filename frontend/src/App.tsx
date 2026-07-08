import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/header/Header';
import Footer from './components/footer/Footer';
import AdminLoginPage from './pages/admin-login';
import { useStore } from './context/StoreContext';
import AdminDashboard from './pages/admin-dashboard';

function HomePage() {
  return (
    <div className="animate-fadeIn">
      <h1>Welcome to the HomePage</h1>
    </div>
  );
}

export default function App() {
  const { user } = useStore();

  console.log('Current user:', user); // Log the current user state
  return (
    <div className="min-h-screen bg-[#fdf8f1] text-maroon-900 flex flex-col justify-between font-sans selection:bg-gold-200 selection:text-maroon-900">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/admin-login" element={<AdminLoginPage />} />

          <Route
            path="/admin"
            element={
              user.loggedIn && user.role === 'admin' ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/admin-login" replace />
              )
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
