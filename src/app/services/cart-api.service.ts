import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CartItem {
  giftId: number;
  userId: number;
  addedAt: string;
}

export interface AddToCartResponse {
  success: boolean;
  otherUsersCount: number;
}

export interface CheckCartResponse {
  purchasedItems: number[];
  hasUnavailableItems: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class CartApiService {
  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) { }

  getCartItems(userId: number): Observable<CartItem[]> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.get<CartItem[]>(this.apiUrl, { params });
  }

  addToCart(userId: number, giftId: number): Observable<AddToCartResponse> {
    return this.http.post<AddToCartResponse>(this.apiUrl, { userId, giftId });
  }

  removeFromCart(userId: number, giftId: number): Observable<{ success: boolean }> {
    const params = new HttpParams()
      .set('userId', userId.toString())
      .set('giftId', giftId.toString());
    return this.http.delete<{ success: boolean }>(this.apiUrl, { params });
  }

  checkCartItems(userId: number, giftIds: number[]): Observable<CheckCartResponse> {
    return this.http.post<CheckCartResponse>(`${this.apiUrl}/check`, { userId, giftIds });
  }

  getOthersCartCount(userId: number, giftIds: number[]): Observable<{ [giftId: number]: number }> {
    return this.http.post<{ [giftId: number]: number }>(`${this.apiUrl}/others`, { userId, giftIds });
  }
}
