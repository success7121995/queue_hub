export interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PaymentMethod {
  id: number;
  methodType: string;
  details: string;
  createdAt: string;
  updatedAt: string;
} 