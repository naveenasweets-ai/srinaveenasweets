
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


export type CategoryConfig = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  type?: 'category' | 'subcategory';
  isActive?: boolean;
  order?: number;
};

export interface StoreContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;

  toast: Toast | null;
  showToast: (msg: string, type?: ToastType) => void;


  siteContent: {
    categories: CategoryConfig[];
  }
  setSiteContent: React.Dispatch<
    React.SetStateAction<{
      categories: CategoryConfig[];
    }>
  >;


  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
}
