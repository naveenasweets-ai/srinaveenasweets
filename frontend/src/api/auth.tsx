import { useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import type { User } from '../types/contextTypes';
import {
  getFirebaseAuthErrorMessage,
  signInWithGooglePopup,
} from '../firebase';

const apiUrl =
  (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:4001';

const AuthApi = () => {
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

  const logout = () => {
    const guest = {
      name: 'Guest Patron',
      email: '',
      phone: '',
      role: 'customer',
      loggedIn: false,
      token: '',
      _id: '',
    } as User;
    setUser(guest);
    try {
      localStorage.removeItem('sns_user');
    } catch (e) {
      // ignore
    }
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  const loginWithGoogle = async () => {
    try {
      const { user } = await signInWithGooglePopup();
      const name = user.displayName ?? user.email?.split('@')[0] ?? 'Patron';
      const email = user.email ?? '';

      const response = await fetch(`${apiUrl}/api/auth/google/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          uid: user.uid,
        }),
      });
      const json = await response.json();

      if (json.success) {
        login({
          email,
          role: 'customer',
          name,
          _id: user.uid ?? '',
          token: json.token,
          loggedIn: true,
        });
      } else {
        showToast('Google sign-in failed. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Google sign-in failed', err);
      const message = getFirebaseAuthErrorMessage(err);
      showToast(message, 'error');
    }
  };

  return { adminLogin, loginWithGoogle, logout };
};

export default AuthApi;
