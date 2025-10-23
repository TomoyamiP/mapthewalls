export type LatLng = { lat: number; lng: number };

const FALLBACK: LatLng = { lat: 35.681236, lng: 139.767125 }; // Tokyo Station

export function getPosition(timeoutMs = 5000): Promise<LatLng> {
  if (!("geolocation" in navigator)) return Promise.resolve(FALLBACK);
  return new Promise((resolve) => {
    const id = setTimeout(() => resolve(FALLBACK), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(id);
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        clearTimeout(id);
        resolve(FALLBACK);
      },
      { enableHighAccuracy: true, timeout: timeoutMs }
    );
  });
}
