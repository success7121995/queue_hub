export interface Gallery {
  id: number;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  images?: GalleryImage[];
}

export interface GalleryImage {
  id: number;
  imageUrl: string;
  caption?: string;
  createdAt: string;
  updatedAt: string;
} 