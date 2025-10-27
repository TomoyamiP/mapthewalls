// src/lib/exif.ts
import exifr from "exifr";

export type LatLng = { lat: number; lng: number };

/**
 * Try to read GPS from the image's EXIF metadata.
 * Returns { lat, lng } or null if not present/parseable.
 */
export async function readGpsFromFile(file: File): Promise<LatLng | null> {
  try {
    // exifr will return { latitude, longitude } in decimal degrees when gps: true
    const data = await exifr.parse(file, { gps: true });
    const lat = (data as any)?.latitude;
    const lng = (data as any)?.longitude;
    if (typeof lat === "number" && typeof lng === "number") {
      return { lat, lng };
    }
    return null;
  } catch {
    return null;
  }
}
