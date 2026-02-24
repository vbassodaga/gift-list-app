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
  showForgotPasswordDialog = false;
  forgotPasswordPhone = '';
  showNewPasswordForm = false;
  newPassword = '';
  confirmNewPassword = '';
  verifyingPhone = false;
  resettingPassword = false;

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
        let errorMessage = 'Telefone ou senha inválidos. Tente novamente.';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Traduz a mensagem de erro
        errorMessage = this.translateErrorMessage(errorMessage);
        
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

  openForgotPasswordDialog(): void {
    this.showForgotPasswordDialog = true;
    this.showNewPasswordForm = false;
    this.forgotPasswordPhone = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  closeForgotPasswordDialog(): void {
    this.showForgotPasswordDialog = false;
    this.showNewPasswordForm = false;
    this.forgotPasswordPhone = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  formatForgotPasswordPhone(event: any): void {
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
      this.forgotPasswordPhone = value;
    }
  }

  verifyPhoneForPasswordReset(): void {
    if (!this.forgotPasswordPhone || this.verifyingPhone) {
      return;
    }

    const phoneNumber = this.forgotPasswordPhone.replace(/\D/g, '');
    if (phoneNumber.length < 10) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Digite um telefone válido.'
      });
      return;
    }

    this.verifyingPhone = true;
    this.userService.verifyPhoneForPasswordReset(phoneNumber).subscribe({
      next: () => {
        this.showNewPasswordForm = true;
        this.verifyingPhone = false;
        this.messageService.add({
          severity: 'info',
          summary: 'Próximo passo',
          detail: 'Agora você pode definir uma nova senha.'
        });
      },
      error: (error) => {
        console.error('Verify phone error:', error);
        let errorMessage = 'Erro ao verificar telefone. Tente novamente.';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Traduz a mensagem de erro
        errorMessage = this.translateErrorMessage(errorMessage);
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.verifyingPhone = false;
      }
    });
  }

  resetPassword(): void {
    if (!this.newPassword || !this.confirmNewPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha todos os campos.'
      });
      return;
    }

    if (this.newPassword.length < 6) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'A senha deve ter pelo menos 6 caracteres.'
      });
      return;
    }

    if (this.newPassword !== this.confirmNewPassword) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'As senhas não coincidem.'
      });
      return;
    }

    const phoneNumber = this.forgotPasswordPhone.replace(/\D/g, '');
    this.resettingPassword = true;
    this.userService.resetPassword(phoneNumber, this.newPassword).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso!',
          detail: 'Senha redefinida com sucesso! Você já pode fazer login.'
        });
        this.closeForgotPasswordDialog();
        this.resettingPassword = false;
      },
      error: (error) => {
        console.error('Reset password error:', error);
        let errorMessage = 'Erro ao redefinir senha. Tente novamente.';
        
        if (error.error) {
          if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error.error) {
            errorMessage = error.error.error;
          } else if (error.error.message) {
            errorMessage = error.error.message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        // Traduz a mensagem de erro
        errorMessage = this.translateErrorMessage(errorMessage);
        
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.resettingPassword = false;
      }
    });
  }

  private translateErrorMessage(errorMessage: string): string {
    const translations: { [key: string]: string } = {
      'Phone number and password are required': 'Telefone e senha são obrigatórios.',
      'Invalid phone number or password': 'Telefone ou senha inválidos. Tente novamente.',
      'Failed to login': 'Erro ao fazer login. Tente novamente.',
      'User not found': 'Usuário não encontrado.',
      'Password must be at least 6 characters long': 'A senha deve ter pelo menos 6 caracteres.',
      'Failed to reset password': 'Erro ao redefinir senha. Tente novamente.',
      'Failed to process request': 'Erro ao processar solicitação. Tente novamente.'
    };

    // Verifica se há tradução exata
    if (translations[errorMessage]) {
      return translations[errorMessage];
    }

    // Verifica se a mensagem contém alguma chave conhecida
    for (const [key, value] of Object.entries(translations)) {
      if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Retorna a mensagem original se não houver tradução
    return errorMessage;
  }

  get phoneNumber() { return this.loginForm.get('phoneNumber'); }
  get password() { return this.loginForm.get('password'); }
}

