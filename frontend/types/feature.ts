export interface Feature {
  id: number;
  name: string;
  description?: string;
  category?: FeatureCategory;
  createdAt: string;
  updatedAt: string;
}

export interface FeatureCategory {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
} 