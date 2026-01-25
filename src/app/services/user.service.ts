import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { User, RegisterUser, LoginUser } from '../models/user.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;
  private currentUserSubject = new BehaviorSubject<User | null>(this.getStoredUser());
  public currentUser$ = this.currentUserSubject.asObservable();
  private inactivityTimer: any;
  private readonly INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutos em milissegundos
  private activityListeners: (() => void)[] = [];

  constructor(private http: HttpClient) {
    // Load user from localStorage on service initialization
    const storedUser = this.getStoredUser();
    if (storedUser) {
      this.currentUserSubject.next(storedUser);
      this.startInactivityTimer();
    }
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  register(user: RegisterUser): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  login(credentials: LoginUser): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login`, credentials);
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  getAllUsers(userId: number): Observable<User[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<User[]>(this.apiUrl, { params });
  }

  updateUserRole(userId: number, targetUserId: number, role: number): Observable<User> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.put<User>(`${this.apiUrl}/${targetUserId}`, { role }, { params });
  }

  setCurrentUser(user: User): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.startInactivityTimer();
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.clearInactivityTimer();
  }

  private startInactivityTimer(): void {
    this.clearInactivityTimer();
    
    // Reset timer on user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    const resetTimer = () => {
      if (this.inactivityTimer) {
        clearTimeout(this.inactivityTimer);
      }
      this.inactivityTimer = setTimeout(() => {
        this.logout();
      }, this.INACTIVITY_TIMEOUT);
    };

    const removeListeners: (() => void)[] = [];
    events.forEach(event => {
      const handler = resetTimer;
      document.addEventListener(event, handler, { passive: true });
      removeListeners.push(() => document.removeEventListener(event, handler));
    });
    this.activityListeners = removeListeners;

    // Start initial timer
    this.inactivityTimer = setTimeout(() => {
      this.logout();
    }, this.INACTIVITY_TIMEOUT);
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
    // Remove event listeners
    this.activityListeners.forEach(remove => remove());
    this.activityListeners = [];
  }

  private getStoredUser(): User | null {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : null;
  }

  isLoggedIn(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.isAdmin === true;
  }

  canManageGifts(): boolean {
    return this.isAdmin();
  }

  canPurchaseGifts(): boolean {
    return this.isLoggedIn() && !this.isAdmin();
  }
}

