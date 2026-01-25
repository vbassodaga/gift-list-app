import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { CartService } from '../../services/cart.service';
import { Observable } from 'rxjs';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  activeRoute: string = '';
  cartCount$: Observable<number>;

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

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.activeRoute === route;
  }
}

