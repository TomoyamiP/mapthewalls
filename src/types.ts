export type GraffitiSpot = {
  id: string;
  title: string;
  description?: string;
  photoUrl?: string;   // we'll store an object URL in MVP
  lat: number;
  lng: number;
  createdAt: string;   // ISO string
};
