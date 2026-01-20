import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-auth-select',
  templateUrl: './auth-select.component.html',
  styleUrls: ['./auth-select.component.scss']
})
export class AuthSelectComponent implements OnInit {
  showModal = true;

  constructor(
    private router: Router,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // If already logged in, redirect to home
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  closeModal(): void {
    this.router.navigate(['/']);
  }
}

