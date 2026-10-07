/** Prepare an image for JSON/base64 upload (keeps payloads under Vercel’s ~4.5MB body limit). */

export type PrepareImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  /** Soft target for the data-URL string length (base64 grows ~33%). */
  maxDataUrlBytes?: number;
  /** Keep exact pixel size (only recompress). Used for banner uploads. */
  preserveDimensions?: boolean;
};

const DEFAULT_MAX_DATA_URL = 3.2 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read the selected image.'));
    };
    img.src = url;
  });
}

function canvasToDataUrl(
  canvas: HTMLCanvasElement,
  mime: string,
  quality: number
): string {
  return canvas.toDataURL(mime, quality);
}

/**
 * Convert a File to a compressed data URL suitable for `/api/*-images` uploads.
 * GIFs are passed through unchanged (canvas would flatten animation).
 */
export async function prepareImageDataUrl(
  file: File,
  options: PrepareImageOptions = {}
): Promise<{ dataUrl: string; filename: string }> {
  const {
    maxWidth = 2000,
    maxHeight = 2000,
    quality = 0.82,
    maxDataUrlBytes = DEFAULT_MAX_DATA_URL,
    preserveDimensions = false,
  } = options;

  if (file.type === 'image/gif') {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        typeof reader.result === 'string'
          ? resolve(reader.result)
          : reject(new Error('Could not read the selected image.'));
      reader.onerror = () => reject(new Error('Could not read the selected image.'));
      reader.readAsDataURL(file);
    });
    if (dataUrl.length > maxDataUrlBytes) {
      throw new Error('GIF is too large for upload. Please use JPG, PNG, or WEBP under 2MB.');
    }
    return { dataUrl, filename: file.name };
  }

  const img = await loadImage(file);
  let width = img.naturalWidth || img.width;
  let height = img.naturalHeight || img.height;

  if (!preserveDimensions) {
    const scale = Math.min(1, maxWidth / width, maxHeight / height);
    width = Math.max(1, Math.round(width * scale));
    height = Math.max(1, Math.round(height * scale));
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process the selected image.');
  ctx.drawImage(img, 0, 0, width, height);

  const preferJpeg = !file.type.includes('png') || file.size > 1.5 * 1024 * 1024;
  const mime = preferJpeg ? 'image/jpeg' : 'image/png';
  let q = quality;
  let dataUrl = canvasToDataUrl(canvas, mime, q);

  while (dataUrl.length > maxDataUrlBytes && q > 0.45 && mime === 'image/jpeg') {
    q -= 0.08;
    dataUrl = canvasToDataUrl(canvas, mime, q);
  }

  if (dataUrl.length > maxDataUrlBytes && mime === 'image/png') {
    q = 0.78;
    dataUrl = canvasToDataUrl(canvas, 'image/jpeg', q);
    while (dataUrl.length > maxDataUrlBytes && q > 0.45) {
      q -= 0.08;
      dataUrl = canvasToDataUrl(canvas, 'image/jpeg', q);
    }
  }

  if (dataUrl.length > maxDataUrlBytes) {
    throw new Error('Image is still too large after compression. Please choose a smaller file.');
  }

  const base = file.name.replace(/\.[^.]+$/, '') || 'image';
  const filename = mime === 'image/jpeg' ? `${base}.jpg` : `${base}.png`;
  return { dataUrl, filename };
}
