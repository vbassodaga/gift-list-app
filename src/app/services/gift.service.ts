import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Gift, CreateGift, MarkPurchased } from '../models/gift.model';
import { environment } from '../../environments/environment';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class GiftService {
  private apiUrl = `${environment.apiUrl}/gifts`;
  private readonly CACHE_KEY_GIFTS = 'gifts_list';

  constructor(
    private http: HttpClient,
    private cacheService: CacheService
  ) { }

  getGifts(useCache: boolean = true): Observable<Gift[]> {
    if (useCache) {
      return this.cacheService.cacheObservable(
        this.CACHE_KEY_GIFTS,
        this.http.get<Gift[]>(this.apiUrl)
      );
    }
    return this.http.get<Gift[]>(this.apiUrl);
  }

  getGift(id: number): Observable<Gift> {
    return this.http.get<Gift>(`${this.apiUrl}/${id}`);
  }

  createGift(gift: CreateGift, userId: number): Observable<Gift> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<Gift>(this.apiUrl, gift, { params }).pipe(
      tap(() => this.cacheService.clear(this.CACHE_KEY_GIFTS))
    );
  }

  updateGift(id: number, gift: { name?: string; description?: string; imageUrl?: string; averagePrice?: number; linkUrl?: string; deliveryAddress?: string; isIllustrativeImage?: boolean }, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.put<void>(`${this.apiUrl}/${id}`, gift, { params }).pipe(
      tap(() => this.cacheService.clear(this.CACHE_KEY_GIFTS))
    );
  }

  markAsPurchased(id: number, userId: number, paymentMethod?: string, deliveryAddress?: string): Observable<void> {
    const body: any = { userId };
    if (paymentMethod) {
      body.paymentMethod = paymentMethod;
    }
    if (deliveryAddress) {
      body.deliveryAddress = deliveryAddress;
    }
    return this.http.post<void>(`${this.apiUrl}/${id}/purchase`, body).pipe(
      tap(() => this.cacheService.clear(this.CACHE_KEY_GIFTS))
    );
  }

  markAsUnpurchased(id: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.post<void>(`${this.apiUrl}/${id}/unpurchase`, {}, { params }).pipe(
      tap(() => this.cacheService.clear(this.CACHE_KEY_GIFTS))
    );
  }

  deleteGift(id: number, userId: number): Observable<void> {
    const params = new HttpParams().set('userId', userId.toString());
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { params }).pipe(
      tap(() => this.cacheService.clear(this.CACHE_KEY_GIFTS))
    );
  }
}

