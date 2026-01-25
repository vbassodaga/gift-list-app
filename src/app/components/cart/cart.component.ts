import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { GiftService } from '../../services/gift.service';
import { UserService } from '../../services/user.service';
import { Gift } from '../../models/gift.model';
import { User } from '../../models/user.model';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

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
  pixKey: string = 'sua-chave-pix@exemplo.com'; // Você pode configurar isso depois

  constructor(
    private cartService: CartService,
    private giftService: GiftService,
    private userService: UserService,
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

    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
    });
  }

  removeFromCart(gift: Gift): void {
    this.cartService.removeFromCart(gift.id);
    this.messageService.add({
      severity: 'info',
      summary: 'Item removido',
      detail: `${gift.name} foi removido do carrinho.`
    });
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

  confirmPurchase(): void {
    if (!this.currentUser || !this.selectedPaymentMethod) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Selecione um método de pagamento.'
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

    this.loading = true;

    // Marcar todos os presentes como comprados
    const purchaseObservables = this.cartItems.map(gift => 
      this.giftService.markAsPurchased(gift.id, this.currentUser!.id)
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
