
export type User = {
  _id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'guest';
  loggedIn: boolean;
  token: string;
};


export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
  message: string;
  type: ToastType;
};

export interface StoreContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;

  toast: Toast | null;  
  showToast: (msg: string, type?: ToastType) => void;
}
