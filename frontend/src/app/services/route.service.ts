import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private apiKey = 'SUA_CHAVE_API_OPENROUTESERVICE'; // add chave
  private baseUrl = 'https://api.openrouteservice.org/v2/directions/driving-car';

  constructor(private http: HttpClient) {}

  getRoute(start: [number, number], end: [number, number]) {
    const startStr = `${start[1]},${start[0]}`; 
    const endStr = `${end[1]},${end[0]}`;
    
    return this.http.get(`${this.baseUrl}?api_key=${this.apiKey}&start=${startStr}&end=${endStr}`);
  }
}