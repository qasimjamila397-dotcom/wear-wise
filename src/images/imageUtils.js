// Photo helpers: check a chosen file, then shrink it so it uses little storage.
export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Returns "" if the file is fine, otherwise a friendly message.
export function checkImageFile(file) {
  if (!file) return "No photo was chosen.";
  if (!ALLOWED_TYPES.includes(file.type)) return "Please choose a JPEG, PNG or WebP photo. (HEIC photos are not supported yet.)";
  if (file.size > MAX_FILE_BYTES) return "That photo is larger than 10 MB. Please choose a smaller one.";
  return "";
}

async function decode(file) {
  if (typeof createImageBitmap === "function") {
    try { return await createImageBitmap(file, { imageOrientation: "from-image" }); }
    catch (e) { try { return await createImageBitmap(file); } catch (e2) { /* fall through */ } }
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode"));
      img.src = url;
    });
  } finally { URL.revokeObjectURL(url); }
}

// Shrinks the longest side to maxSide pixels and saves as JPEG. Returns a Blob.
export async function resizeImage(file, maxSide = 800, quality = 0.8) {
  let img;
  try { img = await decode(file); } catch (e) { throw new Error("That file could not be read as a photo. Please try another one."); }
  const w = img.width, h = img.height;
  const scale = Math.min(1, maxSide / Math.max(w, h));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * scale));
  canvas.height = Math.max(1, Math.round(h * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not prepare the photo.");
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  if (img.close) img.close();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) throw new Error("Your browser could not prepare the photo.");
  return blob;
}
