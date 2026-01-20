import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { Observable } from 'rxjs';
import { User } from './models/user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Housewarming Gift Registry';
  currentUser$: Observable<User | null>;

  constructor(
    private userService: UserService,
    private router: Router
  ) {
    this.currentUser$ = this.userService.currentUser$;
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/register']);
  }
}

