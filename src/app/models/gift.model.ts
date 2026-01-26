export interface Gift {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  averagePrice?: number; // Valor médio em centavos
  linkUrl?: string; // Link para acessar o produto em outro site
  isPurchased: boolean;
  purchasedByUserId?: number;
  purchasedBy?: string; // Full name of purchaser
  paymentMethod?: string; // Método de pagamento escolhido
  deliveryAddress?: string; // Endereço de entrega (se aplicável)
  createdAt: string;
}

export interface CreateGift {
  name: string;
  description: string;
  imageUrl: string;
  averagePrice?: number; // Valor médio em centavos
  linkUrl?: string; // Link para acessar o produto em outro site
}

export interface MarkPurchased {
  userId: number;
  paymentMethod?: string;
  deliveryAddress?: string;
}

