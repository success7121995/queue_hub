export interface Address {
  id: number;
  street: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: number;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
} 