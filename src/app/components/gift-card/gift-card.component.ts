import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Gift } from '../../models/gift.model';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-gift-card',
  templateUrl: './gift-card.component.html',
  styleUrls: ['./gift-card.component.scss']
})
export class GiftCardComponent {
  @Input() gift!: Gift;
  @Input() currentUser: User | null = null;
  @Output() purchase = new EventEmitter<Gift>();
  @Output() edit = new EventEmitter<Gift>();
  @Output() delete = new EventEmitter<Gift>();
  @Output() unpurchase = new EventEmitter<Gift>();

  constructor(public userService: UserService) { }

  onPurchase(): void {
    this.purchase.emit(this.gift);
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
    // User can unpurchase if they purchased it, or if they're admin
    return this.userService.isAdmin() || 
           (this.gift.isPurchased && this.gift.purchasedByUserId === this.currentUser.id);
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = 'https://via.placeholder.com/400x300?text=No+Image';
    }
  }
}

