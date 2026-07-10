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
  maxBytes: 700 * 1024,
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

export const fileListToBase64 = async (
  files: FileList | null,
  options: ImageConversionOptions = {},
): Promise<string[]> => {
  if (!files) return [];

  return Promise.all(
    Array.from(files).map((file) => fileToBase64(file, options)),
  );
};
