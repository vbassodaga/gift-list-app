import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss']
})
export class SidebarMenuComponent implements OnInit {
  sidebarVisible = false;
  currentUser$: Observable<User | null>;
  cartCount$: Observable<number>;
  activeRoute: string = '';

  constructor(
    private userService: UserService,
    private cartService: CartService,
    private router: Router
  ) {
    this.currentUser$ = this.userService.currentUser$;
    this.cartCount$ = new Observable(observer => {
      this.cartService.cartItems$.subscribe(items => {
        observer.next(items.length);
      });
    });
  }

  ngOnInit(): void {
    this.updateActiveRoute();
    this.router.events.subscribe(() => {
      this.updateActiveRoute();
    });
  }

  updateActiveRoute(): void {
    this.activeRoute = this.router.url;
  }

  isActive(route: string): boolean {
    return this.activeRoute === route;
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebar(): void {
    this.sidebarVisible = false;
  }

  navigateTo(route: string): void {
    this.closeSidebar();
    this.router.navigate([route]);
  }

  goToLogin(): void {
    this.closeSidebar();
    this.router.navigate(['/auth']);
  }

  goToMyGifts(): void {
    this.closeSidebar();
    this.router.navigate(['/my-gifts']);
  }

  logout(): void {
    this.userService.logout();
    this.closeSidebar();
    this.router.navigate(['/']);
  }
}

