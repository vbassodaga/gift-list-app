import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Gift } from '../../models/gift.model';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
import { User } from '../../models/user.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-gift-card',
  templateUrl: './gift-card.component.html',
  styleUrls: ['./gift-card.component.scss']
})
export class GiftCardComponent {
  @Input() gift!: Gift;
  @Input() currentUser: User | null = null;
  @Input() isUnpurchasingLoading: boolean = false; // Estado de loading vindo do componente pai
  @Output() purchase = new EventEmitter<Gift>();
  @Output() edit = new EventEmitter<Gift>();
  @Output() delete = new EventEmitter<Gift>();
  @Output() unpurchase = new EventEmitter<Gift>();

  constructor(
    public userService: UserService,
    public cartService: CartService,
    private messageService: MessageService
  ) { }

  async onPurchase(): Promise<void> {
    // Se o presente já está comprado, não fazer nada
    if (this.gift.isPurchased) {
      return;
    }

    // Se já está no carrinho, não adicionar novamente
    if (this.cartService.isInCart(this.gift.id)) {
      this.messageService.add({
        severity: 'info',
        summary: 'Já no carrinho',
        detail: 'Este presente já está no seu carrinho.'
      });
      return;
    }

    // Verificar se já está carregando
    if (this.isAddingToCart()) {
      return;
    }

    // Adicionar ao carrinho (já mostra mensagem se outros usuários têm o item)
    await this.cartService.addToCart(this.gift);
    this.messageService.add({
      severity: 'success',
      summary: 'Adicionado ao carrinho',
      detail: `${this.gift.name} foi adicionado ao carrinho.`
    });
  }

  isAddingToCart(): boolean {
    return this.cartService.isActionLoading(`add-${this.gift.id}`);
  }

  isUnpurchasing(): boolean {
    return this.isUnpurchasingLoading;
  }

  isInCart(): boolean {
    return this.cartService.isInCart(this.gift.id);
  }

  onEdit(): void {
    this.edit.emit(this.gift);
  }

  onDelete(): void {
    this.delete.emit(this.gift);
  }

  onUnpurchase(): void {
    this.unpurchase.emit(this.gift);
  }

  canUnpurchase(): boolean {
    if (!this.currentUser) return false;
    // Só pode remover marcação se estiver no carrinho
    // Admin pode remover se comprou ou se está no carrinho
    const isInCart = this.cartService.isInCart(this.gift.id);
    if (this.userService.isAdmin()) {
      return (this.gift.isPurchased && this.gift.purchasedByUserId === this.currentUser.id) || isInCart;
    }
    // Usuário comum só pode remover se estiver no carrinho
    return isInCart && this.gift.isPurchased && this.gift.purchasedByUserId === this.currentUser.id;
  }

  isUnavailable(): boolean {
    // Item indisponível se foi comprado por outra pessoa
    if (!this.currentUser || !this.gift.isPurchased) {
      return false;
    }
    return this.gift.purchasedByUserId !== undefined && 
           this.gift.purchasedByUserId !== null &&
           this.gift.purchasedByUserId !== this.currentUser.id;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://via.placeholder.com/400x300?text=No+Image';
    }
  }
}

