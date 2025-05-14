import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as L from 'leaflet';
import { RouteService } from '../../../services/route.service';

@Component({
  selector: 'app-mapa-dialog',
  template: `
    <h2 mat-dialog-title>Rota para {{ data.studentName }}</h2>
    <div mat-dialog-content>
      <div id="map" style="height: 450px; width: 100%;"></div>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Fechar</button>
    </div>
  `
})
export class MapaDialogComponent implements AfterViewInit {
  private map: any;
  private driverMarker: any;
  private route: any;
  private watchId!: number;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { 
      studentCoords: [number, number];
      studentName: string;
    },
    private routeService: RouteService
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.watchDriverPosition();
  }

  ngOnDestroy(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  private initMap(): void {
    this.map = L.map('map').setView(this.data.studentCoords, 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Marcador do aluno
    L.marker(this.data.studentCoords)
      .addTo(this.map)
      .bindPopup(`<b>${this.data.studentName}</b><br>Local de embarque`)
      .openPopup();
  }

  private watchDriverPosition(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation não suportada');
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.updateDriverPosition(position),
      (err) => console.error('Erro na geolocalização:', err),
      { enableHighAccuracy: true }
    );
  }

  private updateDriverPosition(position: GeolocationPosition): void {
    const driverCoords: [number, number] = [
      position.coords.latitude,
      position.coords.longitude
    ];

    // Atualiza ou cria o marcador do motorista
    if (this.driverMarker) {
      this.driverMarker.setLatLng(driverCoords);
    } else {
      this.driverMarker = L.marker(driverCoords, {
        icon: L.divIcon({ className: 'driver-icon' })
      }).addTo(this.map);
    }

    // Centraliza o mapa no motorista
    this.map.setView(driverCoords);

    // Atualiza a rota
    this.updateRoute(driverCoords, this.data.studentCoords);
  }

  private updateRoute(start: [number, number], end: [number, number]): void {
    this.routeService.getRoute(start, end).subscribe({
      next: (data: any) => {
        // Remove a rota anterior se existir
        if (this.route) {
          this.map.removeLayer(this.route);
        }

        // Converte as coordenadas para o formato [lat, lng]
        const routeCoords = data.features[0].geometry.coordinates
          .map((coord: [number, number]) => [coord[1], coord[0]]);

        // Adiciona a nova rota
        this.route = L.polyline(routeCoords, { color: 'blue' }).addTo(this.map);
      },
      error: (err) => console.error('Erro ao obter rota:', err)
    });
  }
}