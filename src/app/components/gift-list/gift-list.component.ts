import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GiftService } from '../../services/gift.service';
import { UserService } from '../../services/user.service';
import { Gift } from '../../models/gift.model';
import { User } from '../../models/user.model';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-gift-list',
  templateUrl: './gift-list.component.html',
  styleUrls: ['./gift-list.component.scss']
})
export class GiftListComponent implements OnInit {
  gifts: Gift[] = [];
  loading = false;
  showAddDialog = false;
  newGift = {
    name: '',
    description: '',
    imageUrl: '',
    averagePrice: undefined as number | undefined,
    linkUrl: undefined as string | undefined,
    deliveryAddress: undefined as string | undefined
  };
  purchaseDialogVisible = false;
  selectedGift: Gift | null = null;
  currentUser: User | null = null;
  actionLoading: { [key: string]: boolean } = {}; // Para controlar loading de ações específicas

  constructor(
    private giftService: GiftService,
    private userService: UserService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    this.loadGifts();
  }

  loadGifts(forceRefresh: boolean = false): void {
    // Evitar recarregar se já está carregando
    if (this.loading && !forceRefresh) return;

    this.loading = true;
    this.giftService.getGifts(!forceRefresh).subscribe({
      next: (gifts) => {
        this.gifts = gifts;
        this.loading = false;
        // Recarregar carrinho do backend após carregar presentes
        if (this.currentUser) {
          // O CartService já sincroniza automaticamente, mas forçamos uma atualização
          // quando os presentes são recarregados
        }
      },
      error: (error) => {
        console.error('Error loading gifts:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load gifts. Please try again.'
        });
        this.loading = false;
      }
    });
  }

  openPurchaseDialog(gift: Gift): void {
    if (!this.currentUser) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Você precisa estar cadastrado para comprar um presente.'
      });
      this.router.navigate(['/register']);
      return;
    }

    // Admins cannot purchase gifts
    if (this.userService.isAdmin()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Administradores não podem marcar presentes como comprados.'
      });
      return;
    }

    if (gift.isPurchased) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Já Comprado',
        detail: 'Este presente já foi comprado.'
      });
      return;
    }

    this.selectedGift = gift;
    this.purchaseDialogVisible = true;
  }

  confirmPurchase(): void {
    if (!this.selectedGift || !this.currentUser) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Erro',
        detail: 'Erro ao processar compra.'
      });
      return;
    }

    const actionKey = `purchase-${this.selectedGift.id}`;
    if (this.actionLoading[actionKey]) return; // Prevenir múltiplos cliques

    this.actionLoading[actionKey] = true;
    this.giftService.markAsPurchased(this.selectedGift.id, this.currentUser.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso!',
          detail: 'Presente marcado como comprado!'
        });
        this.purchaseDialogVisible = false;
        this.loadGifts(true); // Force refresh após compra
        this.actionLoading[actionKey] = false;
      },
      error: (error) => {
        console.error('Error marking gift as purchased:', error);
        const errorMessage = error.error?.message || error.error || 'Erro ao marcar presente como comprado. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.actionLoading[actionKey] = false;
      }
    });
  }

  cancelPurchase(): void {
    this.purchaseDialogVisible = false;
    this.selectedGift = null;
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/register']);
  }

  addGift(): void {
    if (!this.currentUser || !this.userService.canManageGifts()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Apenas administradores podem criar presentes.'
      });
      return;
    }

    if (!this.newGift.name.trim() || !this.newGift.imageUrl.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Erro de Validação',
        detail: 'Preencha todos os campos obrigatórios.'
      });
      return;
    }

    if (this.actionLoading['addGift']) return; // Prevenir múltiplos cliques

    // Converter preço de reais para centavos se fornecido
    const giftToCreate = {
      ...this.newGift,
      averagePrice: this.newGift.averagePrice ? Math.round(this.newGift.averagePrice * 100) : undefined
    };

    this.actionLoading['addGift'] = true;
    this.giftService.createGift(giftToCreate, this.currentUser.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Presente adicionado com sucesso!'
        });
        this.showAddDialog = false;
        this.newGift = { name: '', description: '', imageUrl: '', averagePrice: undefined, linkUrl: undefined, deliveryAddress: undefined };
        this.loadGifts(true); // Force refresh após adicionar
        this.actionLoading['addGift'] = false;
      },
      error: (error) => {
        console.error('Error adding gift:', error);
        const errorMessage = error.error?.message || error.error || 'Erro ao adicionar presente. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.actionLoading['addGift'] = false;
      }
    });
  }

  cancelAdd(): void {
    this.showAddDialog = false;
    this.newGift = { name: '', description: '', imageUrl: '', averagePrice: undefined, linkUrl: undefined, deliveryAddress: undefined };
  }

  showEditDialog = false;
  editingGift: Gift | null = null;
  editGift = {
    name: '',
    description: '',
    imageUrl: '',
    averagePrice: undefined as number | undefined,
    linkUrl: undefined as string | undefined,
    deliveryAddress: undefined as string | undefined
  };

  openEditDialog(gift: Gift): void {
    if (!this.currentUser || !this.userService.canManageGifts()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Apenas administradores podem editar presentes.'
      });
      return;
    }

    this.editingGift = gift;
    this.editGift = {
      name: gift.name,
      description: gift.description,
      imageUrl: gift.imageUrl,
      averagePrice: gift.averagePrice ? gift.averagePrice / 100 : undefined,
      linkUrl: gift.linkUrl || undefined,
      deliveryAddress: gift.deliveryAddress || undefined
    };
    this.showEditDialog = true;
  }

  saveEdit(): void {
    if (!this.editingGift || !this.currentUser) {
      return;
    }

    if (!this.editingGift) return;
    
    const actionKey = `edit-${this.editingGift.id}`;
    if (this.actionLoading[actionKey]) return; // Prevenir múltiplos cliques

    // Converter preço de reais para centavos se fornecido
    const giftToUpdate = {
      ...this.editGift,
      averagePrice: this.editGift.averagePrice ? Math.round(this.editGift.averagePrice * 100) : undefined
    };

    this.actionLoading[actionKey] = true;
    this.giftService.updateGift(this.editingGift.id, giftToUpdate, this.currentUser.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Presente atualizado com sucesso!'
        });
        this.showEditDialog = false;
        this.editingGift = null;
        this.editGift = { name: '', description: '', imageUrl: '', averagePrice: undefined, linkUrl: undefined, deliveryAddress: undefined };
        this.newGift = { name: '', description: '', imageUrl: '', averagePrice: undefined, linkUrl: undefined, deliveryAddress: undefined };
        this.loadGifts(true); // Force refresh após editar
        this.actionLoading[actionKey] = false;
      },
      error: (error) => {
        console.error('Error updating gift:', error);
        const errorMessage = error.error?.message || error.error || 'Erro ao atualizar presente. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.actionLoading[actionKey] = false;
      }
    });
  }

  cancelEdit(): void {
    this.showEditDialog = false;
    this.editingGift = null;
    this.editGift = { name: '', description: '', imageUrl: '', averagePrice: undefined, linkUrl: undefined, deliveryAddress: undefined };
  }

  confirmDelete(gift: Gift): void {
    if (!this.currentUser || !this.userService.canManageGifts()) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Apenas administradores podem deletar presentes.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja deletar o presente "${gift.name}"?`,
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.deleteGift(gift.id);
      }
    });
  }

  deleteGift(id: number): void {
    if (!this.currentUser) return;

    const actionKey = `delete-${id}`;
    if (this.actionLoading[actionKey]) return; // Prevenir múltiplos cliques

    this.actionLoading[actionKey] = true;
    this.giftService.deleteGift(id, this.currentUser.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Presente deletado com sucesso!'
        });
        this.loadGifts(true); // Force refresh após deletar
        this.actionLoading[actionKey] = false;
      },
      error: (error) => {
        console.error('Error deleting gift:', error);
        const errorMessage = error.error?.message || error.error || 'Erro ao deletar presente. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.actionLoading[actionKey] = false;
      }
    });
  }

  confirmUnpurchase(gift: Gift): void {
    if (!this.currentUser) {
      return;
    }

    // Check if user can unpurchase
    const canUnpurchase = this.userService.isAdmin() || 
                         (gift.isPurchased && gift.purchasedByUserId === this.currentUser.id);

    if (!canUnpurchase) {
      this.messageService.add({
        severity: 'error',
        summary: 'Erro',
        detail: 'Você só pode remover marcações de presentes que você comprou.'
      });
      return;
    }

    this.confirmationService.confirm({
      message: `Tem certeza que deseja remover a marcação do presente "${gift.name}"?`,
      header: 'Confirmar Remoção',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.unpurchaseGift(gift.id);
      }
    });
  }

  unpurchaseGift(id: number): void {
    if (!this.currentUser) return;

    const actionKey = `unpurchase-${id}`;
    if (this.actionLoading[actionKey]) return; // Prevenir múltiplos cliques

    this.actionLoading[actionKey] = true;
    this.giftService.markAsUnpurchased(id, this.currentUser.id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Marcação removida com sucesso!'
        });
        this.loadGifts(true); // Force refresh após remover marcação
        this.actionLoading[actionKey] = false;
      },
      error: (error) => {
        console.error('Error unpurchasing gift:', error);
        const errorMessage = error.error?.message || error.error || 'Erro ao remover marcação. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.actionLoading[actionKey] = false;
      }
    });
  }

  isActionLoading(actionKey: string): boolean {
    return this.actionLoading[actionKey] === true;
  }
}

