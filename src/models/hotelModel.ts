export interface Room {
  roomSlug: string;
  roomImage: string;
  roomTitle: string;
  bedroomCount: number;
}

export interface Hotel {
  hotelId: string;
  slug: string;
  images: string[];
  title: string;
  description: string;
  guestCount: number;
  bedroomCount: number;
  bathroomCount: number;
  amenities: string[];
  hostInfo: string;
  address: string;
  latitude: number;
  longitude: number;
  rooms: Room[];
}
