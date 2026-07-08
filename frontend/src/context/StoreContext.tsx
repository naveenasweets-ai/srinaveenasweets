import React, { createContext, useContext, useEffect, useState } from 'react';
import type { StoreContextType, Toast, ToastType, User } from '../types/contextTypes';

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
          role: parsed.role === 'admin' ? 'admin' : parsed.role === 'customer' ? 'customer' : 'guest',
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

  
  const [toast, setToast] = useState<Toast | null>(null);

    const showToast = (msg: string, type: ToastType = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        setUser,

        toast,
        showToast
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
