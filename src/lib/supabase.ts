// src/lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// 1️⃣ connect using your project keys
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 2️⃣ upload image and return its public URL
export async function uploadToSupabase(file: File): Promise<string> {
  if (file.size > 1_000_000) throw new Error("Image too large (>1 MB)");
  if (!/^image\/(jpeg|jpg|png|webp)$/i.test(file.type))
    throw new Error("Unsupported image type");

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${file.name.split(".").pop()}`;
  const { data, error } = await supabase.storage
    .from("images")
    .upload(fileName, file, { upsert: false });

  if (error) throw error;

  // make a public link
  const { data: publicData } = supabase.storage.from("images").getPublicUrl(fileName);
  return publicData.publicUrl;
}
