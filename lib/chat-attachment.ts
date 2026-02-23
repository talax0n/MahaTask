const ATTACHMENT_PREFIX = '__CHAT_ATTACHMENT__';
export const MAX_CHAT_ATTACHMENT_BYTES = 50 * 1024;

export interface ChatAttachmentPayload {
  type: 'attachment';
  fileName: string;
  mimeType: string;
  size: number;
  isImage: boolean;
  dataUrl?: string;
  url?: string;
}

function sanitizeFileName(name: string): string {
  return name.replace(/[^\w.\-() ]/g, '_').slice(0, 120) || 'file';
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsDataURL(file);
  });
}

function getDataUrlByteSize(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex < 0) return 0;
  const base64 = dataUrl.slice(commaIndex + 1);
  const padding = (base64.match(/=+$/)?.[0].length ?? 0);
  return Math.floor((base64.length * 3) / 4) - padding;
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Gagal memuat gambar'));
    image.src = dataUrl;
  });
}

function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number): string {
  return canvas.toDataURL('image/jpeg', quality);
}

async function compressImageToTarget(file: File, maxBytes: number): Promise<string | null> {
  const originalDataUrl = await readAsDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return null;

  let width = image.naturalWidth || image.width;
  let height = image.naturalHeight || image.height;
  let quality = 0.82;
  let attempt = 0;

  while (attempt < 12) {
    canvas.width = Math.max(1, Math.round(width));
    canvas.height = Math.max(1, Math.round(height));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const output = canvasToDataUrl(canvas, quality);
    if (getDataUrlByteSize(output) <= maxBytes) return output;

    if (quality > 0.45) {
      quality -= 0.08;
    } else {
      width *= 0.86;
      height *= 0.86;
      quality = 0.74;
    }
    attempt += 1;
  }

  return null;
}

export function encodeChatAttachment(payload: ChatAttachmentPayload): string {
  return `${ATTACHMENT_PREFIX}${JSON.stringify(payload)}`;
}

export function decodeChatAttachment(content: string): ChatAttachmentPayload | null {
  if (!content.startsWith(ATTACHMENT_PREFIX)) return null;
  try {
    const parsed = JSON.parse(content.slice(ATTACHMENT_PREFIX.length)) as Partial<ChatAttachmentPayload>;
    if (
      parsed.type !== 'attachment' ||
      typeof parsed.fileName !== 'string' ||
      typeof parsed.mimeType !== 'string' ||
      typeof parsed.size !== 'number' ||
      typeof parsed.isImage !== 'boolean' ||
      (typeof parsed.dataUrl !== 'string' && typeof parsed.url !== 'string')
    ) {
      return null;
    }
    return {
      type: 'attachment',
      fileName: parsed.fileName,
      mimeType: parsed.mimeType,
      size: parsed.size,
      isImage: parsed.isImage,
      dataUrl: typeof parsed.dataUrl === 'string' ? parsed.dataUrl : undefined,
      url: typeof parsed.url === 'string' ? parsed.url : undefined,
    };
  } catch {
    return null;
  }
}

interface BuildAttachmentOptions {
  uploader?: (file: File) => Promise<string>;
}

function withJpegExtension(name: string): string {
  return name.replace(/\.[^.]+$/, '') + '.jpg';
}

async function dataUrlToFile(dataUrl: string, fileName: string, mimeType: string): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
}

export async function buildAttachmentMessage(file: File, options?: BuildAttachmentOptions): Promise<string> {
  if (!file || file.size <= 0) {
    throw new Error('File tidak valid');
  }

  const safeName = sanitizeFileName(file.name);
  const isImage = file.type.startsWith('image/');
  let dataUrl = '';

  let uploadFile = file;

  if (isImage) {
    const compressed = await compressImageToTarget(file, MAX_CHAT_ATTACHMENT_BYTES);
    if (!compressed) {
      throw new Error('Gambar terlalu besar. Maksimal 50 KB setelah kompresi.');
    }
    dataUrl = compressed;
    uploadFile = await dataUrlToFile(dataUrl, withJpegExtension(safeName), 'image/jpeg');
  } else {
    if (file.size > MAX_CHAT_ATTACHMENT_BYTES) {
      throw new Error('Ukuran file maksimal 50 KB.');
    }
    dataUrl = await readAsDataUrl(file);
  }

  const dataSize = getDataUrlByteSize(dataUrl);
  if (dataSize > MAX_CHAT_ATTACHMENT_BYTES) {
    throw new Error('Ukuran file maksimal 50 KB.');
  }

  let uploadedUrl: string | undefined;
  if (options?.uploader) {
    uploadedUrl = await options.uploader(uploadFile);
  }

  return encodeChatAttachment({
    type: 'attachment',
    fileName: safeName,
    mimeType: isImage ? 'image/jpeg' : file.type || 'application/octet-stream',
    size: dataSize,
    isImage,
    dataUrl: uploadedUrl ? undefined : dataUrl,
    url: uploadedUrl,
  });
}

export function formatAttachmentSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}
