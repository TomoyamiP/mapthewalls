export async function fileToDataURLWithHeicSupport(file: File): Promise<string> {
  // If not HEIC/HEIF, read directly
  if (!/image\/(heic|heif)/i.test(file.type)) {
    return readAsDataURL(file);
  }

  // Dynamic import and normalize default export shape across builds
  const mod = await import("heic2any");
  const heic2any = (mod as any)?.default ?? (mod as any);

  const converted = (await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  })) as Blob | Blob[];

  const blob = Array.isArray(converted) ? converted[0] : converted;
  return readAsDataURL(blob);
}

function readAsDataURL(input: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(input);
  });
}

// Compress any (data URL) image into a JPEG data URL with max size/quality.
// Typical result: much smaller than the original; good enough for thumbnails/popups.
export async function compressToJpegDataURL(
  dataUrl: string,
  maxW = 1600,
  maxH = 1600,
  quality = 0.82
): Promise<string> {
  // Load into an <img>
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Failed to load image for compression"));
    el.src = dataUrl;
  });

  // Compute target size
  let { width, height } = img;
  const scale = Math.min(maxW / width, maxH / height, 1); // only shrink
  const tw = Math.round(width * scale);
  const th = Math.round(height * scale);

  // Draw onto a canvas
  const canvas = document.createElement("canvas");
  canvas.width = tw;
  canvas.height = th;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2D context for canvas");
  ctx.drawImage(img, 0, 0, tw, th);

  // Export as JPEG
  const out = canvas.toDataURL("image/jpeg", quality);
  return out;
}
