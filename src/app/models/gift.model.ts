export interface Gift {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  isPurchased: boolean;
  purchasedByUserId?: number;
  purchasedBy?: string; // Full name of purchaser
  createdAt: string;
}

export interface CreateGift {
  name: string;
  description: string;
  imageUrl: string;
}

export interface MarkPurchased {
  userId: number;
}

