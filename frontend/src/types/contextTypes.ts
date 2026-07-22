import type {
  CategoryConfig,
  CategoryInfoType,
  FeatureItem,
  HeroContent,
  ChargesConfig,
  LegalPage,
  DeliverablePincodesConfig,
} from "./appContentTypes";

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

export type ProductWeightPrice = {
  value: number;
  unit: string;
  price: number;
  originalPrice?: number;
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
  availableWeight?: ProductWeightPrice[] | ProductWeightPrice | null;
  gstIncluded?: boolean;
  updatedAt?: string;
};


export type CartItem = {
  product: Product;
  quantity: number;
  weight: string;
};


export interface StoreContextType {
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;

  toast: Toast | null;
  showToast: (msg: string, type?: ToastType) => void;


  siteContent: {
    categories: CategoryConfig[];
    heroContent: HeroContent | null;
    categoriesInfo: CategoryInfoType;
    features: FeatureItem[];
    charges: ChargesConfig;
    legalPages: LegalPage[];
    deliverablePincodes: DeliverablePincodesConfig;
  }
  setSiteContent: React.Dispatch<
    React.SetStateAction<{
      categories: CategoryConfig[];
      heroContent: HeroContent | null;
      categoriesInfo: CategoryInfoType;
      features: FeatureItem[];
      charges: ChargesConfig;
      legalPages: LegalPage[];
      deliverablePincodes: DeliverablePincodesConfig;
    }>
  >;


  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;

  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;

  handpickedCats: string[];

  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;


  cartTotal: number;
  cartCount: number;

  wishlist: string[];
  setWishlist: React.Dispatch<React.SetStateAction<string[]>>;

  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}
