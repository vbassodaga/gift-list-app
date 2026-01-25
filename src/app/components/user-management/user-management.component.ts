import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';
import { MessageService, ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  loading = false;
  currentUser: User | null = null;
  actionLoading: { [key: number]: boolean } = {}; // Para controlar loading por usuário

  constructor(
    private userService: UserService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (!user) {
        this.router.navigate(['/auth']);
        return;
      }
      if (!user.isAdmin) {
        this.messageService.add({
          severity: 'error',
          summary: 'Acesso Negado',
          detail: 'Apenas administradores podem acessar esta página.'
        });
        this.router.navigate(['/gifts']);
        return;
      }
      this.loadUsers();
    });
  }

  loadUsers(): void {
    if (!this.currentUser) return;

    this.loading = true;
    this.userService.getAllUsers(this.currentUser.id).subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao carregar usuários. Tente novamente.'
        });
        this.loading = false;
      }
    });
  }

  toggleAdminRole(user: User): void {
    if (!this.currentUser) return;

    const newRole = user.isAdmin ? 0 : 1; // 0 = SimpleUser, 1 = Admin
    const action = user.isAdmin ? 'remover' : 'conceder';
    const roleText = user.isAdmin ? 'administrador' : 'administrador';

    this.confirmationService.confirm({
      message: `Tem certeza que deseja ${action} o cargo de ${roleText} para ${user.fullName}?`,
      header: 'Confirmar Alteração',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.updateUserRole(user, newRole);
      }
    });
  }

  updateUserRole(user: User, role: number): void {
    if (!this.currentUser) return;

    if (this.actionLoading[user.id]) return; // Prevenir múltiplos cliques

    this.actionLoading[user.id] = true;
    this.userService.updateUserRole(this.currentUser.id, user.id, role).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Cargo de ${updatedUser.isAdmin ? 'administrador' : 'usuário'} ${updatedUser.isAdmin ? 'concedido' : 'removido'} com sucesso!`
        });
        this.actionLoading[user.id] = false;
      },
      error: (error) => {
        console.error('Error updating user role:', error);
        const errorMessage = error.error?.message || error.error || 'Erro ao atualizar cargo do usuário. Tente novamente.';
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorMessage
        });
        this.actionLoading[user.id] = false;
      }
    });
  }

  isUserActionLoading(userId: number): boolean {
    return this.actionLoading[userId] === true;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
