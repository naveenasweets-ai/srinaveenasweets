import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import type { User } from '../types/contextTypes';

const apiUrl =
  (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';

const Auth = () => {
  const navigate = useNavigate();
  const { setUser, showToast } = useStore();

  const login = (user: User) => {
    const { _id, name, role, email, token } = user;
    const displayName =
      name ||
      (role === 'admin' ? 'Sri Naveena Sweets Admin' : email.split('@')[0]);

    const newUser = {
      _id,
      name: displayName,
      email,
      role,
      loggedIn: true,
      token,
    } as User;

    setUser(newUser);
    try {
      localStorage.setItem('sns_user', JSON.stringify(newUser));
    } catch (e) {
      // ignore storage errors
    }
    showToast(`Welcome back, ${displayName}!`, 'success');
    navigate(role === 'admin' ? '/admin' : '/');
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${apiUrl}/api/auth/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await response.json();

      if (json.success) {
        const _id = json.user._id ?? '';
        const name =
          json.user.fullName ?? json.user.email?.split('@')[0] ?? 'Admin';
        const token = json.user.token ?? '';

        login({ ...json.user, _id, name, token });
        showToast(`Welcome back, ${name}!`, 'success');
      } else {
        showToast(
          json.message || json.error || 'Invalid email or password',
          'error',
        );
      }
    } catch (err) {
      console.error('Admin login failed', err);
      showToast('Login failed. Please check your credentials.', 'error');
    }
  };

  return { adminLogin };
};

export default Auth;
