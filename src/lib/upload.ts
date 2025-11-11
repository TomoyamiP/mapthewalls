// src/lib/upload.ts
import { supabase } from "./supabase";

// Uploads an image file to the "images" bucket.
// Returns both the public URL and the storage path (needed for future delete).
export async function uploadToSupabase(file: File): Promise<{ publicUrl: string; path: string }> {
  if (file.size > 1_000_000) throw new Error("Image too large (>1 MB)");
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type)) {
    throw new Error("Unsupported image type");
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from("images").upload(path, file, { upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from("images").getPublicUrl(path);
  return { publicUrl: data.publicUrl, path };
}
