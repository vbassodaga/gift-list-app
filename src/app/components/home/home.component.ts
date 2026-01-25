import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  currentUser$: Observable<User | null>;
  cartCount$: Observable<number>;

  menuItems = [
    { route: '/', label: 'Home', icon: 'pi-home' },
    { route: '/gifts', label: 'Presentes', icon: 'pi-gift' },
    { route: '/cart', label: 'Carrinho', icon: 'pi-shopping-cart' }
  ];

  constructor(
    private router: Router,
    private userService: UserService,
    private cartService: CartService
  ) {
    this.currentUser$ = this.userService.currentUser$;
    this.cartCount$ = new Observable(observer => {
      this.cartService.cartItems$.subscribe(items => {
        observer.next(items.length);
      });
    });
  }

  ngOnInit(): void {
    // Adicionar item de Usuários se for admin
    this.currentUser$.subscribe(user => {
      if (user?.isAdmin) {
        const hasUsersItem = this.menuItems.some(item => item.route === '/users');
        if (!hasUsersItem) {
          this.menuItems.push({ route: '/users', label: 'Usuários', icon: 'pi-users' });
        }
      } else {
        // Remover item de Usuários se não for admin
        this.menuItems = this.menuItems.filter(item => item.route !== '/users');
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}

