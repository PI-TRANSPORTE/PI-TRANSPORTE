import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private readonly GEOCODING_URL = 'https://graphhopper.com/api/1/geocode';
  private readonly ROUTING_URL = 'https://graphhopper.com/api/1/route';

  constructor(private http: HttpClient) { }

  async addressToCoords(address: string): Promise<[number, number]> {
    // Adiciona ", Brasil" para forçar localização no Brasil
    const enderecoBrasil = `${address}, Brasil`;
    
    const params = {
      q: enderecoBrasil,
      limit: '1',
      locale: 'pt',
      country: 'BR',
      key: 'ed07e75e-9f6d-4794-abe3-a14dfd2dff14'
    };

    try {
      const response: any = await this.http.get(this.GEOCODING_URL, { params }).toPromise();
      
      if (response?.hits?.length > 0) {
        const result = response.hits[0];
        
        if (!this.isInBrazil(result.point.lat, result.point.lng)) {
          console.warn('Endereço fora do Brasil:', result);
          throw new Error('O endereço está fora do território brasileiro');
        }
        
        return [result.point.lat, result.point.lng];
      }
      throw new Error('Endereço não encontrado');
    } catch (error) {
      console.error('Erro na geocodificação:', error);
      throw new Error('Não foi possível validar o endereço. Verifique se todos os campos estão corretos.');
    }
  }

  async getRoute(start: [number, number], end: [number, number]): Promise<any> {
    const params = {
      point: [`${start[0]},${start[1]}`, `${end[0]},${end[1]}`],
      vehicle: 'car',
      locale: 'pt',
      key: 'ed07e75e-9f6d-4794-abe3-a14dfd2dff14',
      points_encoded: 'false',
      instructions: 'false',
      elevation: 'false'
    };

    try {
      const response = await this.http.get(this.ROUTING_URL, { params }).toPromise();
      return response;
    } catch (error) {
      console.error('Erro ao calcular rota:', error);
      throw new Error('Falha ao calcular a rota');
    }
  }

  private isInBrazil(lat: number, lng: number): boolean {
    // Coordenadas aproximadas do território brasileiro com margem de segurança
    const brazilBounds = {
      minLat: -34.0,   // Margem sul aumentada
      maxLat: 6.0,     // Margem norte aumentada
      minLng: -74.0,   // Margem oeste aumentada
      maxLng: -34.0    // Margem leste aumentada
    };

    return (
      lat >= brazilBounds.minLat && 
      lat <= brazilBounds.maxLat && 
      lng >= brazilBounds.minLng && 
      lng <= brazilBounds.maxLng
    );
  }
}