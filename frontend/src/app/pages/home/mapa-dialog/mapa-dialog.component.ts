import { Component, Inject, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-mapa-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Rota para {{ data.studentName }}</h2>
    <div mat-dialog-content>
      <div id="map" style="height: 500px; width: 100%;"></div>
    </div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close>Fechar</button>
    </div>
  `
})
export class MapaDialogComponent implements AfterViewInit {
  private map!: L.Map;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: {
      studentCoords: [number, number];
      studentName: string;
      startCoords: [number, number];
    },
    private http: HttpClient
  ) {}

  ngAfterViewInit(): void {
    this.initMap();
    this.loadRealRoute();
  }

  private initMap(): void {
    const centerLat = (this.data.startCoords[0] + this.data.studentCoords[0]) / 2;
    const centerLng = (this.data.startCoords[1] + this.data.studentCoords[1]) / 2;
    
    this.map = L.map('map').setView([centerLat, centerLng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
  }

  private async loadRealRoute(): Promise<void> {
    try {
      // 1. Obter rota da API OSRM (OpenStreetMap)
      const response: any = await this.http.get(
        `https://router.project-osrm.org/route/v1/driving/` +
        `${this.data.startCoords[1]},${this.data.startCoords[0]};` +
        `${this.data.studentCoords[1]},${this.data.studentCoords[0]}?overview=full&geometries=geojson`
      ).toPromise();

      // 2. Desenhar rota
      const coordinates = response.routes[0].geometry.coordinates
        .map((coord: [number, number]) => [coord[1], coord[0]]);
      
      L.polyline(coordinates as [number, number][], {
        color: '#3388ff',
        weight: 5
      }).addTo(this.map);

      // 3. Adicionar marcadores
      this.addMarkers();

    } catch (error) {
      console.error('Erro ao carregar rota, usando fallback:', error);
      this.drawFallbackRoute();
    }
  }

  private addMarkers(): void {
    L.marker(this.data.startCoords)
      .bindPopup("<b>Partida</b>")
      .addTo(this.map);

    L.marker(this.data.studentCoords)
      .bindPopup(`<b>${this.data.studentName}</b>`)
      .addTo(this.map);
  }

  private drawFallbackRoute(): void {
    // Linha reta como fallback
    L.polyline([this.data.startCoords, this.data.studentCoords], {
      color: 'red',
      weight: 3,
      dashArray: '5,5'
    }).addTo(this.map);
  }
}