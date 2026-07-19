import type { FeatureItem, LegalPage } from '../types/appContentTypes';
import { ICON_SET } from './constants';

// Fixed legal / policy pages. These 4 slugs are fixed and cannot be
// added to or removed. Only their content can be edited by the admin.
// `content` is rich HTML rendered on the public page.
export const getDefaultLegalPages = (): LegalPage[] => [
  {
    slug: 'terms-and-conditions',
    title: 'Terms and Conditions',
    description:
      'The terms and conditions governing the use of our website and services.',
    content:
      '<p>Welcome to <strong>Sri Naveena Sweets</strong>. By accessing or using our website and placing an order, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.</p><p>All products are subject to availability, and prices are subject to change without prior notice.</p>',
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal information.',
    content:
      '<p>At <strong>Sri Naveena Sweets</strong>, we value your privacy and are committed to protecting your personal information. We collect only the information necessary to process your orders and improve your experience.</p><p>Your data is never sold to third parties and is handled in accordance with applicable data protection laws.</p>',
  },
  {
    slug: 'return-cancellations',
    title: 'Returns / Cancellations',
    description: 'Our policy on returns, cancellations, and refunds.',
    content:
      '<p>As our products are perishable food items, returns are generally not accepted once the order has been delivered. Cancellations are only possible before the order has been dispatched.</p><p>If you receive a damaged or incorrect item, please contact us within <strong>24 hours</strong> of delivery and we will do our best to resolve the issue.</p>',
  },
  {
    slug: 'shipping-policy',
    title: 'Shipping Policy',
    description:
      'Information about our shipping methods, timelines, and charges.',
    content:
      '<p>We carefully package and dispatch all orders to ensure freshness upon arrival. Delivery timelines vary based on your location and the selected shipping option.</p><p>Shipping charges, if applicable, are calculated at checkout. You will receive updates regarding the status of your order until it reaches your doorstep.</p>',
  },
];

// Merges saved legal pages onto the fixed defaults, always keeping the 4
// fixed slugs and their order intact.
export const normalizeLegalPages = (saved?: LegalPage[] | null): LegalPage[] => {
  const savedBySlug = new Map(
    (Array.isArray(saved) ? saved : []).map((page) => [page.slug, page]),
  );
  return getDefaultLegalPages().map((preset) => {
    const match = savedBySlug.get(preset.slug);
    return {
      slug: preset.slug,
      title: match?.title?.trim() || preset.title,
      description: match?.description ?? preset.description,
      content: match?.content ?? preset.content,
    };
  });
};

export function generateSlug(id: string, name: string): string {
  const slugifiedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${id}-${slugifiedName}`.toLowerCase();
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

type ImageConversionOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxBytes?: number;
};

const defaultImageOptions: Required<ImageConversionOptions> = {
  maxWidth: 1400,
  maxHeight: 1400,
  quality: 0.82,
  maxBytes: 8 * 1024 * 1024,
};

const readFileAsDataUrl = (file: File | Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
};

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = src;
  });
};

const getBase64Size = (dataUrl: string) => {
  const [, body = ''] = dataUrl.split(',');
  if (!body) return 0;
  return (
    Math.ceil((body.length * 3) / 4) -
    (body.endsWith('==') ? 2 : body.endsWith('=') ? 1 : 0)
  );
};

export const fileToBase64 = async (
  file: File | Blob,
  options: ImageConversionOptions = {},
): Promise<string> => {
  const { maxWidth, maxHeight, quality, maxBytes } = {
    ...defaultImageOptions,
    ...options,
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return readFileAsDataUrl(file);
  }

  if (!file.type.startsWith('image/')) {
    return readFileAsDataUrl(file);
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(dataUrl);

    const canvas = document.createElement('canvas');
    const scale = Math.min(
      1,
      maxWidth / image.naturalWidth,
      maxHeight / image.naturalHeight,
    );
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      return dataUrl;
    }

    context.drawImage(image, 0, 0, width, height);

    let outputUrl = canvas.toDataURL('image/jpeg', quality);
    let currentQuality = quality;
    let currentWidth = width;
    let currentHeight = height;

    while (getBase64Size(outputUrl) > maxBytes && currentQuality > 0.55) {
      currentQuality -= 0.1;
      outputUrl = canvas.toDataURL('image/jpeg', currentQuality);
    }

    while (
      getBase64Size(outputUrl) > maxBytes &&
      (currentWidth > 200 || currentHeight > 200)
    ) {
      currentWidth = Math.max(200, Math.round(currentWidth * 0.9));
      currentHeight = Math.max(200, Math.round(currentHeight * 0.9));

      canvas.width = currentWidth;
      canvas.height = currentHeight;
      const resizedContext = canvas.getContext('2d');
      if (!resizedContext) break;

      resizedContext.clearRect(0, 0, currentWidth, currentHeight);
      resizedContext.drawImage(image, 0, 0, currentWidth, currentHeight);
      outputUrl = canvas.toDataURL('image/jpeg', currentQuality);
    }

    return outputUrl;
  } catch {
    return readFileAsDataUrl(file);
  }
};

const compressImageFile = async (
  file: File | Blob,
  options: ImageConversionOptions = {},
): Promise<File> => {
  const { maxWidth, maxHeight, quality, maxBytes } = {
    ...defaultImageOptions,
    ...options,
  };

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return file as File;
  }

  if (!file.type.startsWith('image/')) {
    return file as File;
  }

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(dataUrl);

    const canvas = document.createElement('canvas');
    const originalWidth = image.naturalWidth;
    const originalHeight = image.naturalHeight;
    const scale = Math.min(
      1,
      maxWidth / originalWidth,
      maxHeight / originalHeight,
    );

    let width = Math.max(1, Math.round(originalWidth * scale));
    let height = Math.max(1, Math.round(originalHeight * scale));
    let qualityValue = quality;

    for (let attempt = 0; attempt < 8; attempt += 1) {
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');
      if (!context) break;

      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const compressedBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', qualityValue);
      });

      if (compressedBlob && compressedBlob.size <= maxBytes) {
        const fileName = file instanceof File ? file.name : 'image.jpg';
        return new File(
          [compressedBlob],
          fileName.replace(/\.[^.]+$/, '.jpg'),
          {
            type: 'image/jpeg',
          },
        );
      }

      qualityValue = Math.max(0.55, qualityValue - 0.1);
      width = Math.max(200, Math.round(width * 0.9));
      height = Math.max(200, Math.round(height * 0.9));
    }
  } catch {
    // fall back to the original file if compression fails
  }

  return file as File;
};

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary is not configured');
  }

  const uploadableFile = await compressImageFile(file, {
    maxWidth: 1400,
    maxHeight: 1400,
    quality: 0.82,
    maxBytes: 8 * 1024 * 1024,
  });

  const formData = new FormData();
  formData.append('file', uploadableFile);
  formData.append('upload_preset', uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok || !data.secure_url) {
    throw new Error(data.error?.message || 'Image upload failed');
  }

  return data.secure_url as string;
};

export const uploadImagesToCloudinary = async (
  files: FileList | File[] | null,
): Promise<string[]> => {
  if (!files) return [];

  return Promise.all(
    Array.from(files).map((file) => uploadImageToCloudinary(file)),
  );
};

export const fileListToBase64 = async (
  files: FileList | null,
  options: ImageConversionOptions = {},
): Promise<string[]> => {
  if (!files) return [];

  return Promise.all(
    Array.from(files).map((file) => fileToBase64(file, options)),
  );
};

export const FEATURE_SLOTS: FeatureItem[] = ICON_SET.map((icon) => ({
  title: icon.name,
  description: '',
  icon,
}));

export const getDefaultFeatures = (): FeatureItem[] =>
  FEATURE_SLOTS.map((feature) => ({
    title: feature.title,
    description: feature.description,
    icon: feature.icon,
  }));

export const formatPrice = (value: number) =>
  `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

export const calculateCheckoutSummary = ({
  subtotal,
  deliveryFee = 0,
  packagingFee = 0,
  platformFee = 0,
  gstRate = 0,
}: {
  subtotal: number;
  deliveryFee?: number;
  packagingFee?: number;
  platformFee?: number;
  gstRate?: number;
  paymentMethod?: 'cod' | 'razorpay';
}) => {
  const safeSubtotal = Number(subtotal) || 0;
  const safeDeliveryFee = Number(deliveryFee) || 0;
  const safePackagingFee = Number(packagingFee) || 0;
  const safePlatformFee = Number(platformFee) || 0;
  const safeGstRate = Number(gstRate) || 0;

  const gstAmount = Number((safeSubtotal * (safeGstRate / 100)).toFixed(2));
  const grandTotal = Number(
    (
      safeSubtotal +
      safeDeliveryFee +
      safePackagingFee +
      safePlatformFee +
      gstAmount
    ).toFixed(2),
  );

  return {
    subtotal: safeSubtotal,
    deliveryFee: safeDeliveryFee,
    packagingFee: safePackagingFee,
    platformFee: safePlatformFee,
    gstRate: safeGstRate,
    gstAmount,
    grandTotal,
  };
};

export function findProductBySlug<T extends { _id: string; name: string }>(
  products: T[],
  slug: string,
): T | undefined {
  return products.find(
    (p) => generateSlug(p._id, p.name) === slug.toLowerCase(),
  );
}

// Whitelist of tags and per-tag attributes allowed in admin-authored rich
// text (policy pages). Anything else is stripped to keep rendering safe.
const ALLOWED_TAGS = new Set([
  'P',
  'BR',
  'B',
  'STRONG',
  'I',
  'EM',
  'U',
  'S',
  'STRIKE',
  'DEL',
  'H1',
  'H2',
  'H3',
  'H4',
  'UL',
  'OL',
  'LI',
  'BLOCKQUOTE',
  'A',
  'SPAN',
  'DIV',
]);

const ALLOWED_ATTRS: Record<string, string[]> = {
  A: ['href', 'target', 'rel'],
};

const SAFE_URL = /^(https?:|mailto:|tel:|\/|#)/i;

// Sanitizes an HTML string so only whitelisted tags/attributes remain.
// Returns a string safe to pass to dangerouslySetInnerHTML.
export function sanitizeRichHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  if (typeof window === 'undefined' || !window.DOMParser) return '';

  const doc = new DOMParser().parseFromString(html, 'text/html');

  const clean = (node: Node) => {
    // Iterate over a static copy because we mutate the tree.
    const children = Array.from(node.childNodes);
    for (const child of children) {
      if (child.nodeType === Node.COMMENT_NODE) {
        child.parentNode?.removeChild(child);
        continue;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) continue;

      const el = child as HTMLElement;
      const tag = el.tagName.toUpperCase();

      if (!ALLOWED_TAGS.has(tag)) {
        // Unwrap disallowed elements: keep their (cleaned) children.
        clean(el);
        while (el.firstChild) {
          el.parentNode?.insertBefore(el.firstChild, el);
        }
        el.parentNode?.removeChild(el);
        continue;
      }

      const allowedAttrs = ALLOWED_ATTRS[tag] || [];
      for (const attr of Array.from(el.attributes)) {
        const name = attr.name.toLowerCase();
        if (!allowedAttrs.includes(name)) {
          el.removeAttribute(attr.name);
          continue;
        }
        if (name === 'href' && !SAFE_URL.test(attr.value.trim())) {
          el.removeAttribute(attr.name);
        }
      }

      // Force safe external links.
      if (tag === 'A' && el.getAttribute('href')) {
        el.setAttribute('target', '_blank');
        el.setAttribute('rel', 'noreferrer noopener');
      }

      clean(el);
    }
  };

  clean(doc.body);
  return doc.body.innerHTML;
}

// Returns true when the HTML contains only whitespace/empty markup.
export function isRichHtmlEmpty(html: string): boolean {
  if (!html) return true;
  const text = html
    .replace(/<br\s*\/?>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .trim();
  return text.length === 0;
}

// Strips all HTML tags and returns plain text. Useful for compact list
// contexts (cards, cart rows) where rendering rich markup is undesirable.
export function stripHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
