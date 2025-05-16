import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  // Usando Nominatim (OpenStreetMap) - gratuito
  private readonly GEOCODING_URL = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) { }

  // geocoding.service.ts
async addressToCoords(address: string): Promise<[number, number]> {
  const response = await this.http.get<{ lat: string; lon: string }[]>(this.GEOCODING_URL, {
    params: { q: address, format: 'json', limit: '1' }
  }).toPromise();

  if (response && response[0]) {
    return [
      parseFloat(response[0].lat), // Latitude
      parseFloat(response[0].lon)  // Longitude
    ];
  }
  throw new Error('Endereço não encontrado');
}
}