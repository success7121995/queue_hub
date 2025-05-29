export interface Review {
  id: number;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  replies?: ReviewReply[];
}

export interface ReviewReply {
  id: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
} 