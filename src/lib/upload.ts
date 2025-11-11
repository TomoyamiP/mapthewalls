// src/lib/upload.ts
import { supabase } from "./supabase";

// Uploads an image file (<1 MB) to the "images" bucket
export async function uploadToSupabase(file: File): Promise<string> {
  if (file.size > 3_000_000) throw new Error("Image too large (>3 MB)");
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type))
    throw new Error("Unsupported image type");

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;

  const { error } = await supabase.storage.from("images").upload(fileName, file, {
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("images").getPublicUrl(fileName);
  return data.publicUrl;
}
