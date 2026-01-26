import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.scss']
})
export class UserLoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private messageService: MessageService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // If already logged in, redirect to home
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.loginForm = this.fb.group({
      phoneNumber: ['', [Validators.required, Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      password: ['', [Validators.required]]
    });
  }

  formatPhoneNumber(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length <= 11) {
      if (value.length <= 2) {
        value = value;
      } else if (value.length <= 6) {
        value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
      } else if (value.length <= 10) {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 6)}-${value.slice(6)}`;
      } else {
        value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7, 11)}`;
      }
      this.loginForm.patchValue({ phoneNumber: value }, { emitEvent: false });
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading = true;
    const formValue = this.loginForm.value;
    
    // Remove formatting from phone number for API
    const phoneNumber = formValue.phoneNumber.replace(/\D/g, '');

    const loginData = {
      phoneNumber: phoneNumber,
      password: formValue.password
    };

    this.userService.login(loginData).subscribe({
      next: (user) => {
        this.userService.setCurrentUser(user);
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso!',
          detail: 'Login realizado com sucesso!'
        });
        this.loading = false;
        this.router.navigate(['/']);
      },
      error: (error) => {
        console.error('Login error:', error);
        const errorMessage = error.error?.message || error.error || 'Telefone ou senha inválidos. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.loading = false;
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  goBack(): void {
    this.router.navigate(['/auth']);
  }

  get phoneNumber() { return this.loginForm.get('phoneNumber'); }
  get password() { return this.loginForm.get('password'); }
}

