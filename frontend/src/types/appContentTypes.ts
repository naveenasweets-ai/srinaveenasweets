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


export type HeroContent = {
  eyebrow?: string;
  titleLine1?: string;
  titleLine2?: string;
  subtitle?: string;
  description?: string;
  primaryButtonLabel?: string;
  primaryButtonTarget?: string;
  featuredTitle?: string;
  featuredPrice?: string;
  image?: string;
  featuredProductId?: string;
};

export type CategoryInfoType = {
  title: string;
  description: string;
  selectedCategories: {
    name: string;
    slug: string;
    selectedProducts: [string];
  }[];
}

export type FeatureItem = {
  _id?: string;
  title: string;
  description: string;
  icon: {
    name: string;
    svg: React.ReactNode;
  };
};

export type ChargesConfig = {
  deliveryFee: number;
  freeDeliveryThreshold: number;
  platformFee: number;
  packagingFee: number;
  gstRate: number;
};

export type LegalPageSlug =
  | 'terms-and-conditions'
  | 'privacy-policy'
  | 'return-cancellations'
  | 'shipping-policy';

export type LegalPage = {
  _id?: string;
  slug: LegalPageSlug;
  title: string;
  description: string;
  content: string;
};

export type OutletCoordinate = {
  _id?: string;
  name?: string;
  address?: string;
  lat: number;
  lng: number;
};

export type OutletCoordinatesConfig = OutletCoordinate[];