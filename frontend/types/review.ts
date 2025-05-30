import { User } from "./user";
import { Merchant } from "./merchant";

export interface Review {
  id: number;
  user: User;
  merchant: Merchant;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  replies?: ReviewReply[];
}

export interface ReviewReply {
  id: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
} 