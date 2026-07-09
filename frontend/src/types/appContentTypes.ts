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