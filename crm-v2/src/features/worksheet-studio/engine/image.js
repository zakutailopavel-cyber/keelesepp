/* global Image */
// Photo intake: any upload is downscaled and recompressed so worksheets stay light,
// then shown in a fixed-aspect slot with object-fit: cover and an author-chosen focal point.

export async function fileToImage(file, maxSide = 1600, quality = 0.86) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = reject;
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    // prototype keeps the image inline; in CRM v2 this becomes a Storage upload returning a URL
    return { src: canvas.toDataURL('image/jpeg', quality), width: w, height: h, focus: { x: 50, y: 50 } };
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Same downscale, but as a JPEG Blob for uploading to storage.
export async function fileToJpegBlob(file, maxSide = 1600, quality = 0.86) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('Pilti ei saanud avada.'));
      i.src = url;
    });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (!blob) throw new Error('Pilti ei saanud teisendada.');
    return { blob, width: w, height: h };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const objectPosition = (img) => `${img?.focus?.x ?? 50}% ${img?.focus?.y ?? 50}%`;
