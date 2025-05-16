import { Component, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import * as L from 'leaflet';
import { RouteService } from '../../../services/route.service';
import { GeocodingService } from '../../../services/geocoding.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-mapa-dialog',
    standalone: true,
   imports: [
    CommonModule,
    MatDialogModule,
    MatProgressSpinnerModule, // Para o mat-spinner
    MatIconModule, // Para o mat-icon
    MatButtonModule // Caso use botões do Material
  ],
  template: `
    <h2 mat-dialog-title>Rota para {{ data.studentName }}</h2>
    <div mat-dialog-content>
      <div *ngIf="loading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>Processando rota...</p>
      </div>
      <div *ngIf="error" class="error-message">
        <mat-icon>error_outline</mat-icon>
        <p>{{ error }}</p>
      </div>
      <div id="map" style="height: 500px; width: 100%;" 
           [hidden]="loading || error"></div>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Fechar</button>
    </div>
  `,
  styles: [`
    .loading-container, .error-message {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 500px;
      gap: 16px;
    }
    .error-message {
      color: #d32f2f;
    }
    .driver-icon {
      background-color: #4285F4;
      border-radius: 50%;
      width: 16px;
      height: 16px;
      border: 2px solid white;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    }
  `]
})
export class MapaDialogComponent implements AfterViewInit, OnDestroy {
  private map!: L.Map;
  private driverMarker?: L.Marker;
  private route?: L.Polyline;
  private watchId!: number;
  loading = true;
  error: string | null = null;

  // Ícones personalizados
  private readonly driverIcon = L.divIcon({ className: 'driver-icon' });
private readonly studentIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png', // Ícone de pessoa
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      studentAddress: string; // Agora recebe o endereço como texto
      studentName: string;
    },
    private routeService: RouteService,
    private geocodingService: GeocodingService
  ) {}

  async ngAfterViewInit(): Promise<void> {

  
    try {
      // 1. Converter endereço para coordenadas
      const studentCoords = await this.geocodingService.addressToCoords(
        this.data.studentAddress
      );
      
      // 2. Inicializar mapa
      this.initMap(studentCoords);
      
      // 3. Adicionar marcador do aluno
      this.addStudentMarker(studentCoords);
      
      // 4. Iniciar monitoramento da localização do motorista
      this.watchDriverPosition(studentCoords);
      
      this.loading = false;
      setTimeout(() => this.map.invalidateSize(), 0);
    } catch (error) {
      this.handleError('Não foi possível processar o endereço');
    }

    // Adicione temporariamente no ngAfterViewInit:
navigator.geolocation.getCurrentPosition(
  pos => console.log('Sua localização REAL:', pos.coords),
  err => console.error('Erro:', err)
);
  }

  ngOnDestroy(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  private initMap(studentCoords: [number, number]): void {
    // Posição padrão (caso a geolocalização falhe)
    const defaultPosition: [number, number] = [-22.742074, -47.365739];
    
    // Centraliza o mapa entre a posição padrão e o aluno
    const centerPos: [number, number] = [
      (studentCoords[0] + defaultPosition[0]) / 2,
      (studentCoords[1] + defaultPosition[1]) / 2
    ];

    // Cria o mapa
    this.map = L.map('map').setView(centerPos, 13);

    // Adiciona o tile layer (mapa base)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);
  }

  private addStudentMarker(coords: [number, number]): void {
    L.marker(coords, { icon: this.studentIcon })
      .addTo(this.map)
      .bindPopup(`
        <b>${this.data.studentName}</b><br>
        <small>${this.data.studentAddress}</small>
      `)
      .openPopup();
  }

  private watchDriverPosition(studentCoords: [number, number]) {
  if (!navigator.geolocation) {
    this.useFallbackPosition(studentCoords);
    return;
  }

  this.watchId = navigator.geolocation.watchPosition(
    (position) => {
      // Verifica se as coordenadas são realisticamente brasileiras
      if (this.isValidBrazilPosition(position.coords)) {
        this.updateDriverPosition(position, studentCoords);
      } else {
        console.warn('Localização inválida:', position.coords);
        this.useFallbackPosition(studentCoords);
      }
    },
    (error) => this.handleGeolocationError(error, studentCoords),
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

/**
 * Trata erros de geolocalização e utiliza fallback.
 */
private handleGeolocationError(error: GeolocationPositionError, studentCoords: [number, number]) {
  console.error('Erro de geolocalização:', error);
  this.useFallbackPosition(studentCoords);
}

private isValidBrazilPosition(coords: GeolocationCoordinates): boolean {
  // Verifica se está dentro do território brasileiro aproximado
  return (
    coords.latitude > -33.5 && coords.latitude < 5.5 &&
    coords.longitude > -74.0 && coords.longitude < -34.0
  );
}

private useFallbackPosition(studentCoords: [number, number]) {
  const defaultPosition: [number, number] = [-22.7256, -47.6497]; // Piracicaba
  this.updateDriverPosition({
    coords: {
      latitude: defaultPosition[0],
      longitude: defaultPosition[1],
      accuracy: 0,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null
    },
    timestamp: Date.now()
  } as GeolocationPosition, studentCoords);
}
  private updateDriverPosition(
    position: GeolocationPosition,
    studentCoords: [number, number]
  ): void {
    const driverCoords: [number, number] = [
      position.coords.latitude,
      position.coords.longitude
    ];

    // Atualiza ou cria o marcador do motorista
    if (this.driverMarker) {
      this.driverMarker.setLatLng(driverCoords);
    } else {
      this.driverMarker = L.marker(driverCoords, { 
        icon: this.driverIcon,
        zIndexOffset: 1000
      }).addTo(this.map)
        .bindPopup('<b>Você está aqui</b>');
    }

    // Atualiza a rota
    this.updateRoute(driverCoords, studentCoords);
  }

private updateRoute(start: [number, number], end: [number, number]): void {
  this.routeService.getRoute(start, end).subscribe({
    next: (response: any) => {
      // GraphHopper retorna coordenadas no formato [lat, lng]
      const coordinates = response.routes[0].geometry.coordinates;
      
      // Converte para [lng, lat] que o Leaflet usa
      const leafletCoords = coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
      
      this.drawRoute(leafletCoords);
    },
    error: (err) => {
      console.error('Erro ao obter rota:', err);
      // Fallback: linha reta (já convertendo para [lng, lat])
      this.drawRoute([
        [start[1], start[0]],
        [end[1], end[0]]
      ]);
    }
  });
}

private drawRoute(coordinates: [number, number][]) {
  if (this.route) this.map.removeLayer(this.route);
  
  this.route = L.polyline(coordinates, {
    color: coordinates.length === 2 ? '#FF0000' : '#4285F4',
    weight: 5,
    opacity: 0.7,
    dashArray: coordinates.length === 2 ? '5,5' : undefined
  }).addTo(this.map);

  this.map.fitBounds(L.latLngBounds(coordinates));
}

  private decodePolyline(encoded: string): [number, number][] {
    const points: [number, number][] = [];
    let index = 0, lat = 0, lng = 0;

    while (index < encoded.length) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = (result & 1) ? ~(result >> 1) : (result >> 1);
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = (result & 1) ? ~(result >> 1) : (result >> 1);
      lng += dlng;

      points.push([lat * 1e-5, lng * 1e-5]);
    }

    return points;
  }

  private handleError(message: string): void {
    this.error = message;
    this.loading = false;
    console.error(message);
  }
}