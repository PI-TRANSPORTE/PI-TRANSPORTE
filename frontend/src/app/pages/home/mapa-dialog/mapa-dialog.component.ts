import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-mapa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="map-dialog-container">
      <div class="dialog-header">
        <h2 mat-dialog-title class="dialog-title">
          <mat-icon class="route-icon">directions</mat-icon>
          <span class="title-text">Rota para {{ data.studentName }}</span>
        </h2>
        <button mat-icon-button class="close-button" (click)="onClose()" aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      
      <mat-divider></mat-divider>
      
      <div mat-dialog-content class="map-content" #mapContent>
        <div *ngIf="isLoading" class="loading-overlay">
          <mat-spinner [diameter]="mobileView ? 30 : 40"></mat-spinner>
          <p>Calculando rota...</p>
        </div>
        <div id="map" class="map-container"></div>
      </div>
      
      <mat-divider></mat-divider>
      
      <div mat-dialog-actions class="dialog-footer">
        <button mat-stroked-button color="primary" (click)="onClose()" class="action-button">
          <mat-icon>arrow_back</mat-icon>
          <span class="button-text">Voltar</span>
        </button>
        <div class="route-info" *ngIf="routeDistance">
          <mat-icon class="info-icon">directions_car</mat-icon>
          <span class="info-text">{{ routeDistance }} km</span>
          <mat-icon class="info-icon">schedule</mat-icon>
          <span class="info-text">{{ routeTime }} min</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import 'leaflet/dist/leaflet.css';
    
    .map-dialog-container {
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 5px 30px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 800px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }
    
    .dialog-header h2 {
      color: #fff;
      font-size: 1.2rem;
      font-weight: 500; 
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: #3f51b5;
      color: white;
      flex-shrink: 0;
    }
    
    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      font-size: 1rem;
      overflow: hidden;
    }
    
    .title-text {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .route-icon {
      color: #FFD740;
      flex-shrink: 0;
    }
    
    .close-button {
      color: white;
      flex-shrink: 0;
    }
    
    .map-content {
      padding: 0;
      position: relative;
      height: calc(90vh - 120px);
      flex-grow: 1;
      overflow: hidden;
      touch-action: pan-y pan-x;
    }
    
    .map-container {
      height: 100%;
      width: 100%;
      z-index: 1;
    }
    
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 2;
      gap: 12px;
    }
    
    .loading-overlay p {
      color: #3f51b5;
      font-weight: 500;
      margin: 0;
      font-size: 0.9rem;
    }
    
    .dialog-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background-color: #f5f5f5;
      flex-shrink: 0;
    }
    
    .action-button {
      min-width: auto;
      padding: 0 12px;
    }
    
    .button-text {
      margin-left: 4px;
    }
    
    .route-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #555;
      font-size: 0.9rem;
    }
    
    .info-icon {
      font-size: 18px;
      color: #3f51b5;
    }
    
    .info-text {
      margin: 0 4px;
    }
    
    .driver-icon {
      background-color: #4285F4;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      border: 3px solid white;
      box-shadow: 0 0 8px rgba(0,0,0,0.3);
    }
    
    .leaflet-routing-container {
      display: none;
    }
    
    .leaflet-control-attribution {
      font-size: 9px;
    }
    
    /* Estilos para mobile */
    @media (max-width: 600px) {
      .map-dialog-container {
        max-height: 100vh;
        border-radius: 0;
        height: 100vh;
        width: 100vw;
        max-width: 100%;
      }
      
      .map-content {
        height: calc(100vh - 112px);
      }
      
      .dialog-header, .dialog-footer {
        padding: 8px 12px;
      }
      
      .dialog-title {
        font-size: 0.9rem;
      }
      
      .route-info {
        gap: 6px;
      }
      
      .info-icon {
        font-size: 16px;
      }
    }
  `]
})



export class MapaDialogComponent implements AfterViewInit {
  private map!: L.Map;
  isLoading = true;
  routeDistance: string | null = null;
  routeTime: string | null = null;
  mobileView = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      studentCoords: [number, number];
      studentName: string;
      startCoords: [number, number];
    },
    private http: HttpClient,
    private dialogRef: MatDialogRef<MapaDialogComponent>
  ) {
    this.checkMobileView();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkMobileView();
    this.updateMapSize();
  }

  private checkMobileView() {
    this.mobileView = window.innerWidth <= 600;
  }

  ngAfterViewInit(): void {
    this.initMap();
    this.loadRealRoute();
    this.setupMapInteractions();
  }

  private initMap(): void {
    const centerLat = (this.data.startCoords[0] + this.data.studentCoords[0]) / 2;
    const centerLng = (this.data.startCoords[1] + this.data.studentCoords[1]) / 2;

    this.map = L.map('map', {
      dragging: true, 
      touchZoom: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      zoomControl: true,
      minZoom: 10,
      maxZoom: 18,
    }).setView([centerLat, centerLng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }).addTo(this.map);
  }

  private setupMapInteractions(): void {
  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    // Permite interações touch normais
    mapContainer.style.touchAction = 'auto';
    
    // Adiciona um pequeno delay para garantir que o mapa está pronto
    setTimeout(() => {
      this.map.dragging.enable();
      this.map.touchZoom.enable();
    }, 100);
  }
}

  private updateMapSize(): void {
    setTimeout(() => this.map.invalidateSize(), 100);
  }

  private async loadRealRoute(): Promise<void> {
    try {
      const response: any = await this.http.get(
        `https://router.project-osrm.org/route/v1/driving/` +
        `${this.data.startCoords[1]},${this.data.startCoords[0]};` +
        `${this.data.studentCoords[1]},${this.data.studentCoords[0]}?overview=full&geometries=geojson`
      ).toPromise();

      const coordinates = response.routes[0].geometry.coordinates
        .map((coord: [number, number]) => [coord[1], coord[0]]);

      L.polyline(coordinates as [number, number][], {
        color: '#3388ff',
        weight: 5
      }).addTo(this.map);

      this.addMarkers();

      this.routeDistance = (response.routes[0].distance / 1000).toFixed(1);
      this.routeTime = Math.ceil(response.routes[0].duration / 60).toString();
      this.isLoading = false;

      // Ajusta o zoom para mostrar toda a rota
      this.map.fitBounds([
        this.data.startCoords,
        this.data.studentCoords
      ], { padding: [30, 30] });

    } catch (error) {
      this.drawFallbackRoute();
      this.isLoading = false;
    }
  }

  private addMarkers(): void {
    const driverIcon = L.divIcon({
      className: 'driver-icon',
      iconSize: [24, 24]
    });

    L.marker(this.data.startCoords, { icon: driverIcon })
      .bindPopup("<b>Partida</b>")
      .addTo(this.map);

    L.marker(this.data.studentCoords)
      .bindPopup(`<b>${this.data.studentName}</b>`)
      .addTo(this.map);
  }

  private drawFallbackRoute(): void {
    L.polyline([this.data.startCoords, this.data.studentCoords], {
      color: 'red',
      weight: 3,
      dashArray: '5,5'
    }).addTo(this.map);

    this.routeDistance = this.calculateFallbackDistance().toFixed(1);
    this.routeTime = Math.ceil(parseFloat(this.routeDistance) * 3).toString();
  }

  private calculateFallbackDistance(): number {
    const lat1 = this.data.startCoords[0];
    const lon1 = this.data.startCoords[1];
    const lat2 = this.data.studentCoords[0];
    const lon2 = this.data.studentCoords[1];

    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
