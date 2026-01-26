import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GiftService } from '../../services/gift.service';
import { UserService } from '../../services/user.service';
import { Gift } from '../../models/gift.model';
import { User } from '../../models/user.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-my-gifts',
  templateUrl: './my-gifts.component.html',
  styleUrls: ['./my-gifts.component.scss']
})
export class MyGiftsComponent implements OnInit {
  gifts: Gift[] = [];
  myGifts: Gift[] = [];
  currentUser: User | null = null;
  loading = false;

  constructor(
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
      // Redirect admin users - they shouldn't see "My Gifts"
      if (user.isAdmin) {
        this.router.navigate(['/gifts']);
        return;
      }
      this.loadGifts();
    });
  }

  loadGifts(): void {
    if (!this.currentUser) return;

    // Evitar recarregar se já está carregando
    if (this.loading) return;

    this.loading = true;
    this.giftService.getGifts().subscribe({
      next: (gifts) => {
        this.gifts = gifts;
        this.myGifts = gifts.filter(g => 
          g.isPurchased && g.purchasedByUserId === this.currentUser?.id
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading gifts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar presentes. Tente novamente.'
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
        return method;
    }
  }
}

