import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Gift } from '../models/gift.model';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItemsSubject = new BehaviorSubject<Gift[]>([]);
  public cartItems$: Observable<Gift[]> = this.cartItemsSubject.asObservable();

  constructor() {
    // Carregar carrinho do localStorage ao inicializar
    this.loadCartFromStorage();
  }

  private loadCartFromStorage(): void {
    const stored = localStorage.getItem('cart');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        this.cartItemsSubject.next(items);
      } catch (e) {
        console.error('Erro ao carregar carrinho do localStorage:', e);
        this.cartItemsSubject.next([]);
      }
    }
  }

  private saveCartToStorage(): void {
    const items = this.cartItemsSubject.value;
    localStorage.setItem('cart', JSON.stringify(items));
  }

  addToCart(gift: Gift): void {
    const currentItems = this.cartItemsSubject.value;
    // Verificar se o presente já está no carrinho
    if (!currentItems.find(item => item.id === gift.id)) {
      const updatedItems = [...currentItems, gift];
      this.cartItemsSubject.next(updatedItems);
      this.saveCartToStorage();
    }
  }

  removeFromCart(giftId: number): void {
    const currentItems = this.cartItemsSubject.value;
    const updatedItems = currentItems.filter(item => item.id !== giftId);
    this.cartItemsSubject.next(updatedItems);
    this.saveCartToStorage();
  }

  clearCart(): void {
    this.cartItemsSubject.next([]);
    this.saveCartToStorage();
  }

  getCartItems(): Gift[] {
    return this.cartItemsSubject.value;
  }

  getCartCount(): number {
    return this.cartItemsSubject.value.length;
  }

  isInCart(giftId: number): boolean {
    return this.cartItemsSubject.value.some(item => item.id === giftId);
  }
}
