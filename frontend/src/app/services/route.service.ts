import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  private readonly ROUTE_URL = 'https://graphhopper.com/api/1/route';

  constructor(private http: HttpClient) { }

  getRoute(start: [number, number], end: [number, number]): Observable<any> {
    const params = {
      point: [`${start[0]},${start[1]}`, `${end[0]},${end[1]}`],
      vehicle: 'car',
      locale: 'pt',
      key: '716f2bd4-50e4-467a-81a9-c461c900afd4',
      points_encoded: 'true',
      instructions: 'false',
      elevation: 'false'
    };

    return this.http.get(this.ROUTE_URL, { params });
  }

  
}

