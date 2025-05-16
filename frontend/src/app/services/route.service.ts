// route.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { throwError, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiKey = ''; // Obtenha em graphhopper.com
  private baseUrl = 'https://graphhopper.com/api/1/route';

  constructor(private http: HttpClient) { }

  getRoute(start: [number, number], end: [number, number]) {
    const params = new HttpParams()
      .set('point', `${start[0]},${start[1]}`)
      .append('point', `${end[0]},${end[1]}`)
      .set('vehicle', 'car')
      .set('key', this.apiKey)
      .set('instructions', 'false')
      .set('points_encoded', 'false');

    return this.http.get(this.baseUrl, { params }).pipe(
      catchError(error => {
        if (error.status === 400) {
          console.error('Erro 400 - Verifique:', {
            start,
            end,
            request: `${this.baseUrl}?point=${start[0]},${start[1]}&point=${end[0]},${end[1]}`
          });
          return throwError(() => new Error('Verifique as coordenadas (formato: latitude, longitude)'));
        }
        return throwError(() => new Error('Falha na API'));
      })
    );
  }
  private calculateDistance(coord1: [number, number], coord2: [number, number]): number {
    const [lat1, lon1] = coord1;
    const [lat2, lon2] = coord2;
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

}