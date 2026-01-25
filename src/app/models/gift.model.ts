export interface Gift {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  averagePrice?: number; // Valor médio em centavos
  isPurchased: boolean;
  purchasedByUserId?: number;
  purchasedBy?: string; // Full name of purchaser
  createdAt: string;
}

export interface CreateGift {
  name: string;
  description: string;
  imageUrl: string;
  averagePrice?: number; // Valor médio em centavos
}

export interface MarkPurchased {
  userId: number;
}

