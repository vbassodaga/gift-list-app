import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { Gift } from '../models/gift.model';
import { UserService } from './user.service';
import { CartApiService } from './cart-api.service';
import { GiftService } from './gift.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<Gift[]>([]);
  public cartItems$: Observable<Gift[]> = this.cartItemsSubject.asObservable();
  private cartGiftIdsSubject = new BehaviorSubject<Set<number>>(new Set());
  public cartGiftIds$: Observable<Set<number>> = this.cartGiftIdsSubject.asObservable();

  constructor(
    private userService: UserService,
    private cartApiService: CartApiService,
    private giftService: GiftService,
    private messageService: MessageService
  ) {
    // Carregar carrinho do localStorage ao inicializar
    this.loadCartFromStorage();
    
    // Sincronizar com backend quando usuário estiver logado
    this.userService.currentUser$.subscribe(user => {
      if (user) {
        this.syncWithBackend(user.id);
      } else {
        this.clearCart();
      }
    });
  }

  private loadCartFromStorage(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items: Gift[] = JSON.parse(stored);
        this.cartItemsSubject.next(items);
        const giftIds = new Set<number>(items.map((item: Gift) => item.id));
        this.cartGiftIdsSubject.next(giftIds);
      } catch (e) {
        console.error('Erro ao carregar carrinho do localStorage:', e);
        this.cartItemsSubject.next([]);
        this.cartGiftIdsSubject.next(new Set());
      }
    }
  }

  private saveCartToStorage(): void {
    const items = this.cartItemsSubject.value;
    localStorage.setItem('cart', JSON.stringify(items));
  }

  private async syncWithBackend(userId: number): Promise<void> {
    try {
      const cartItems = await firstValueFrom(this.cartApiService.getCartItems(userId));
      if (cartItems) {
        const giftIds = new Set(cartItems.map(item => item.giftId));
        this.cartGiftIdsSubject.next(giftIds);
        
        // Carregar dados completos dos presentes
        this.giftService.getGifts(false).subscribe(gifts => {
          const cartGifts = gifts.filter(g => giftIds.has(g.id));
          this.cartItemsSubject.next(cartGifts);
          this.saveCartToStorage();
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar carrinho com backend:', error);
    }
  }

  async addToCart(gift: Gift): Promise<void> {
    const currentUser = this.userService.currentUser;
    if (!currentUser) return;

    const currentItems = this.cartItemsSubject.value;
    // Verificar se o presente já está no carrinho
    if (currentItems.find(item => item.id === gift.id)) {
      return;
    }

    try {
      const response = await firstValueFrom(this.cartApiService.addToCart(currentUser.id, gift.id));
      
      if (response) {
        const updatedItems = [...currentItems, gift];
        this.cartItemsSubject.next(updatedItems);
        this.saveCartToStorage();
        
        const giftIds = new Set(updatedItems.map(item => item.id));
        this.cartGiftIdsSubject.next(giftIds);

        // Mostrar mensagem se outros usuários têm o item
        if (response.otherUsersCount > 0) {
          this.messageService.add({
            severity: 'info',
            summary: 'Atenção',
            detail: `Alguém também adicionou esse item no carrinho.`
          });
        }
      }
    } catch (error) {
      console.error('Erro ao adicionar ao carrinho:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao adicionar item ao carrinho. Tente novamente.'
      });
    }
  }

  async removeFromCart(giftId: number): Promise<void> {
    const currentUser = this.userService.currentUser;
    if (!currentUser) return;

    try {
      await firstValueFrom(this.cartApiService.removeFromCart(currentUser.id, giftId));
      
      const currentItems = this.cartItemsSubject.value;
      const updatedItems = currentItems.filter(item => item.id !== giftId);
      this.cartItemsSubject.next(updatedItems);
      this.saveCartToStorage();
      
      const giftIds = new Set(updatedItems.map(item => item.id));
      this.cartGiftIdsSubject.next(giftIds);
    } catch (error) {
      console.error('Erro ao remover do carrinho:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Erro ao remover item do carrinho. Tente novamente.'
      });
    }
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.cartGiftIdsSubject.next(new Set());
    this.saveCartToStorage();
  }

  getCartItems(): Gift[] {
    return this.cartItemsSubject.value;
  }

  getCartCount(): number {
    return this.cartItemsSubject.value.length;
  }

  isInCart(giftId: number): boolean {
    return this.cartGiftIdsSubject.value.has(giftId);
  }

  async checkUnavailableItems(): Promise<number[]> {
    const currentUser = this.userService.currentUser;
    if (!currentUser) return [];

    const cartItems = this.cartItemsSubject.value;
    const giftIds = cartItems.map(item => item.id);

    try {
      const response = await firstValueFrom(this.cartApiService.checkCartItems(currentUser.id, giftIds));
      return response ? response.purchasedItems : [];
    } catch (error) {
      console.error('Erro ao verificar itens indisponíveis:', error);
      return [];
    }
  }
}
