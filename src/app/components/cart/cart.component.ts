import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { GiftService } from '../../services/gift.service';
import { UserService } from '../../services/user.service';
import { CartApiService } from '../../services/cart-api.service';
import { Gift } from '../../models/gift.model';
import { User } from '../../models/user.model';
import { MessageService } from 'primeng/api';
import { forkJoin, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: Gift[] = [];
  currentUser: User | null = null;
  loading = false;
  selectedPaymentMethod: string | null = null;
  deliveryAddress: string = '';
  pixKey: string = 'sua-chave-pix@exemplo.com'; // Você pode configurar isso depois
  unavailableItems: Set<number> = new Set();
  othersCartCount: { [giftId: number]: number } = {}; // Mapa de giftId -> quantidade de outros usuários

  constructor(
    private cartService: CartService,
    private giftService: GiftService,
    private userService: UserService,
    private cartApiService: CartApiService,
    public router: Router,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/auth']);
        return;
      }
    });

    this.cartService.cartItems$.subscribe(async items => {
      this.cartItems = items;
      // Verificar itens indisponíveis sempre que o carrinho mudar
      if (items.length > 0 && this.currentUser) {
        const unavailable = await this.cartService.checkUnavailableItems();
        this.unavailableItems = new Set(unavailable);
        
        // Verificar quantos outros usuários têm cada item no carrinho
        const giftIds = items.map(item => item.id);
        try {
          const othersCount = await firstValueFrom(
            this.cartApiService.getOthersCartCount(this.currentUser.id, giftIds)
          );
          this.othersCartCount = othersCount || {};
        } catch (error) {
          console.error('Erro ao verificar outros usuários no carrinho:', error);
          this.othersCartCount = {};
        }
      } else {
        this.unavailableItems = new Set();
        this.othersCartCount = {};
      }
    });
  }

  getOthersCount(giftId: number): number {
    return this.othersCartCount[giftId] || 0;
  }

  hasOthersInCart(giftId: number): boolean {
    return this.getOthersCount(giftId) > 0;
  }

  isUnavailable(giftId: number): boolean {
    return this.unavailableItems.has(giftId);
  }

  async removeFromCart(gift: Gift): Promise<void> {
    // Verificar se já está carregando
    if (this.isRemovingFromCart(gift.id)) {
      return;
    }

    await this.cartService.removeFromCart(gift.id);
    this.messageService.add({
      severity: 'info',
      summary: 'Item removido',
      detail: `${gift.name} foi removido do carrinho.`
    });
  }

  isRemovingFromCart(giftId: number): boolean {
    return this.cartService.isActionLoading(`remove-${giftId}`);
  }

  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
  }

  copyPixKey(): void {
    navigator.clipboard.writeText(this.pixKey).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: 'Chave PIX copiada!',
        detail: 'A chave PIX foi copiada para a área de transferência.'
      });
    }).catch(() => {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Não foi possível copiar a chave PIX.'
      });
    });
  }

  async confirmPurchase(): Promise<void> {
    if (!this.currentUser || !this.selectedPaymentMethod) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um método de pagamento.'
      });
      return;
    }

    // Validar endereço se necessário
    if (this.selectedPaymentMethod === 'buy-and-send' && !this.deliveryAddress.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, informe o endereço de entrega.'
      });
      return;
    }

    if (this.cartItems.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Carrinho vazio',
        detail: 'Adicione itens ao carrinho antes de finalizar.'
      });
      return;
    }

    // Prevenir múltiplos cliques
    if (this.loading) return;

    // Verificar se há itens indisponíveis (comprados por outros)
    const unavailableItems = await this.cartService.checkUnavailableItems();
    if (unavailableItems.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Itens indisponíveis',
        detail: `Alguns itens foram comprados por outras pessoas. Remova-os do carrinho antes de finalizar.`
      });
      // Recarregar itens para atualizar status
      this.cartService.cartItems$.subscribe(items => {
        this.cartItems = items;
      });
      return;
    }

    this.loading = true;

    // Marcar todos os presentes como comprados com informações de pagamento
    const purchaseObservables = this.cartItems.map(gift => 
      this.giftService.markAsPurchased(
        gift.id, 
        this.currentUser!.id,
        this.selectedPaymentMethod || undefined,
        this.selectedPaymentMethod === 'buy-and-send' ? this.deliveryAddress : undefined
      )
    );

    forkJoin(purchaseObservables).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Compra confirmada!',
          detail: `Seus ${this.cartItems.length} presente(s) foram marcados como comprados.`
        });
        this.cartService.clearCart();
        this.selectedPaymentMethod = null;
        this.router.navigate(['/my-gifts']);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao confirmar compra:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Ocorreu um erro ao confirmar a compra. Tente novamente.'
        });
        this.loading = false;
      }
    });
  }

  getPaymentMethodLabel(method: string): string {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'buy-and-send':
        return 'Comprar e Enviar para Nossa Casa';
      case 'buy-and-deliver':
        return 'Comprar e Entregar no Dia';
      default:
        return '';
    }
  }

  getPaymentMethodDescription(method: string): string {
    switch (method) {
      case 'pix':
        return 'Você fará o pagamento via PIX usando a chave abaixo. Após o pagamento, o presente será marcado como comprado.';
      case 'buy-and-send':
        return 'Você comprará o presente e enviará para o endereço que será fornecido. O presente será marcado como comprado após a confirmação.';
      case 'buy-and-deliver':
        return 'Você comprará o presente e entregará no dia do evento. O presente será marcado como comprado após a confirmação.';
      default:
        return '';
    }
  }

  getTotalPrice(): number {
    return this.cartItems.reduce((total, item) => {
      return total + (item.averagePrice || 0);
    }, 0);
  }
}
