import type { CategoryConfig, HeroContent } from "./appContentTypes";

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

export type Product = {
  _id: string;
  name: string;
  category: string;
  description: string;
  subcategory?: string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  badge?: string;
  inStock?: boolean;
  inventoryType?: 'weight' | 'unit';
  availableWeight?: {
    value: number;
    unit: string;
  };
  updatedAt?: string;
};

export type FeatureItem = {
  _id?: string;
  title: string;
  description: string;
  icon: {
    name: string;
    svg: React.ReactNode;
  };
};

export interface StoreContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;

  toast: Toast | null;
  showToast: (msg: string, type?: ToastType) => void;


  siteContent: {
    categories: CategoryConfig[];
    heroContent: HeroContent | null;
    categoriesInfo: {
      title: string;
      description: string;
      selectedCategories: {
        name: string,
        slug: string,
        selectedProducts: [string],
      }[];
    };
    features: FeatureItem[];
  }
  setSiteContent: React.Dispatch<
    React.SetStateAction<{
      categories: CategoryConfig[];
      heroContent: HeroContent | null;
      categoriesInfo: {
        title: string;
        description: string;
        selectedCategories: {
          name: string;
          slug: string;
          selectedProducts: [string];
        }[];
      };
      features: FeatureItem[];
    }>
  >;


  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;

  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  handpickedCats: string[];
}
