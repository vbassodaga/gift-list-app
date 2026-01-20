import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
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

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  ngOnInit(): void {
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebar(): void {
    this.sidebarVisible = false;
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

