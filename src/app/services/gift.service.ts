import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gift, CreateGift, MarkPurchased } from '../models/gift.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GiftService {
  private apiUrl = `${environment.apiUrl}/gifts`;

  constructor(private http: HttpClient) { }

  getGifts(): Observable<Gift[]> {
    return this.http.get<Gift[]>(this.apiUrl);
  }

  getGift(id: number): Observable<Gift> {
    return this.http.get<Gift>(`${this.apiUrl}/${id}`);
  }

  createGift(gift: CreateGift, userId: number): Observable<Gift> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<Gift>(this.apiUrl, gift, { params });
  }

  updateGift(id: number, gift: { name?: string; description?: string; imageUrl?: string }, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.put<void>(`${this.apiUrl}/${id}`, gift, { params });
  }

  markAsPurchased(id: number, userId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/purchase`, { userId });
  }

  markAsUnpurchased(id: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<void>(`${this.apiUrl}/${id}/unpurchase`, {}, { params });
  }

  deleteGift(id: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params });
  }
}

