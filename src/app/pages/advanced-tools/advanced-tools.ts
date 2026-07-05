import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { HttpClient } from '@angular/common/http';
import { AppTranslateService } from '../../services/translate';
import { CustomCityService, CustomCity } from '../../services/custom-city';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface CityData {
  name: string;
  lat: number;
  lon: number;
  sun?: number;
  wind?: number;
  temp?: number;
  humidity?: number;
  desc?: string;
  icon?: string;
  loading?: boolean;
  loaded?: boolean;
  customId?: number;
}

@Component({
  selector: 'app-advanced-tools',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './advanced-tools.html',
  styleUrl: './advanced-tools.css'
})
export class AdvancedTools implements AfterViewInit {

  activeTab: 'map' | 'weather' | 'info' = 'map';
  showAddCityForm = false;
  map: L.Map | null = null;
  customMarkers = new Map<number, L.CircleMarker>();

  private apiBase = 'http://127.0.0.1:8000/api';

  cities: CityData[] = [
    // CENTRE
    { name: 'Yaoundé', lat: 3.848, lon: 11.502 },
    { name: 'Mbalmayo', lat: 3.517, lon: 11.500 },
    { name: 'Obala', lat: 4.167, lon: 11.533 },
    { name: 'Mfou', lat: 3.717, lon: 11.633 },
    { name: 'Akonolinga', lat: 3.767, lon: 12.250 },
    { name: 'Eséka', lat: 3.650, lon: 10.767 },
    // LITTORAL
    { name: 'Douala', lat: 4.061, lon: 9.737 },
    { name: 'Edéa', lat: 3.800, lon: 10.133 },
    { name: 'Nkongsamba', lat: 4.954, lon: 9.940 },
    { name: 'Manjo', lat: 4.838, lon: 9.821 },
    { name: 'Loum', lat: 4.719, lon: 9.733 },
    // OUEST
    { name: 'Bafoussam', lat: 5.478, lon: 10.417 },
    { name: 'Dschang', lat: 5.450, lon: 10.050 },
    { name: 'Mbouda', lat: 5.625, lon: 10.250 },
    { name: 'Foumban', lat: 5.729, lon: 10.917 },
    { name: 'Bafang', lat: 5.159, lon: 10.184 },
    { name: 'Bandjoun', lat: 5.350, lon: 10.417 },
    // NORD-OUEST
    { name: 'Bamenda', lat: 5.959, lon: 10.146 },
    { name: 'Kumbo', lat: 6.200, lon: 10.667 },
    { name: 'Wum', lat: 6.383, lon: 10.067 },
    { name: 'Nkambe', lat: 6.583, lon: 10.667 },
    // SUD-OUEST
    { name: 'Buea', lat: 4.154, lon: 9.242 },
    { name: 'Limbe', lat: 4.022, lon: 9.205 },
    { name: 'Kumba', lat: 4.636, lon: 9.448 },
    { name: 'Mamfe', lat: 5.767, lon: 9.317 },
    { name: 'Tiko', lat: 4.075, lon: 9.360 },
    // NORD
    { name: 'Garoua', lat: 9.301, lon: 13.397 },
    { name: 'Guider', lat: 9.933, lon: 13.950 },
    { name: 'Poli', lat: 8.483, lon: 13.250 },
    { name: 'Tcholliré', lat: 8.400, lon: 14.167 },
    { name: 'Pitoa', lat: 9.383, lon: 13.533 },
    // EXTREME-NORD
    { name: 'Maroua', lat: 10.591, lon: 14.316 },
    { name: 'Kousséri', lat: 12.078, lon: 15.030 },
    { name: 'Mokolo', lat: 10.736, lon: 13.802 },
    { name: 'Yagoua', lat: 10.339, lon: 15.234 },
    { name: 'Kaélé', lat: 10.107, lon: 14.448 },
    { name: 'Mora', lat: 11.045, lon: 14.140 },
    // ADAMAOUA
    { name: 'Ngaoundéré', lat: 7.322, lon: 13.584 },
    { name: 'Meiganga', lat: 6.517, lon: 14.300 },
    { name: 'Tibati', lat: 6.467, lon: 12.633 },
    { name: 'Tignère', lat: 7.367, lon: 12.650 },
    // EST
    { name: 'Bertoua', lat: 4.578, lon: 13.686 },
    { name: 'Batouri', lat: 4.433, lon: 14.367 },
    { name: 'Yokadouma', lat: 3.517, lon: 15.050 },
    { name: 'Abong-Mbang', lat: 3.983, lon: 13.183 },
    // SUD
    { name: 'Ebolowa', lat: 2.900, lon: 11.150 },
    { name: 'Sangmélima', lat: 2.933, lon: 11.983 },
    { name: 'Kribi', lat: 2.938, lon: 9.910 },
    { name: 'Ambam', lat: 2.383, lon: 11.283 },
  ];

  customCities: CityData[] = [];
  selectedCity: CityData | null = null;

  newCityName = '';
  newCityLat: number | null = null;
  newCityLon: number | null = null;
  addCityStatus: 'missing' | 'added' | '' = '';
  addedCityName = '';

  constructor(
    public translateService: AppTranslateService,
    private route: ActivatedRoute,
    private http: HttpClient,
    private customCityService: CustomCityService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  get addCityMessage(): string {
    if (this.addCityStatus === 'missing') {
      return this.t('⚠️ Remplissez au moins le nom, la latitude et la longitude.', '⚠️ Fill in at least the name, latitude and longitude.');
    }
    if (this.addCityStatus === 'added') {
      return this.t(`✅ Ville "${this.addedCityName}" ajoutée !`, `✅ City "${this.addedCityName}" added!`);
    }
    return '';
  }

  ngAfterViewInit() {
    this.loadCustomCities();

    this.route.queryParams.subscribe(params => {
      if (params['tab'] === 'info') {
        this.activeTab = 'info';
      } else if (params['tab'] === 'weather') {
        this.activeTab = 'weather';
      } else {
        setTimeout(() => this.initMap(), 200);
      }
    });
  }

  loadCustomCities() {
    this.customCityService.getAll().subscribe({
      next: (list) => {
        list.forEach(c => {
          if (this.cities.some(existing => existing.name === c.name)) return;

          const city: CityData = {
            name: c.name,
            lat: c.latitude,
            lon: c.longitude,
            icon: '📍',
            customId: c.id
          };
          this.customCities.push(city);
          this.cities.push(city);

          if (this.map) {
            this.addMarkerForCity(city, '#F5A623', c.id);
          }
        });
      }
    });
  }

  switchTab(tab: 'map' | 'weather' | 'info') {
    this.activeTab = tab;
    if (tab === 'map') {
      setTimeout(() => {
        if (this.map) {
          this.map.invalidateSize();
        } else {
          this.initMap();
        }
      }, 150);
    }
  }

  initMap() {
    if (this.map) return;
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    this.map = L.map('map').setView([5.5, 12.3], 6);
    setTimeout(() => this.map?.invalidateSize(), 300);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18
    }).addTo(this.map);

    this.cities.filter(c => !c.customId).forEach(c => {
      const marker = L.circleMarker([c.lat, c.lon], {
        radius: 8, fillColor: '#2980B9', color: '#fff', weight: 2, fillOpacity: 0.9
      }).addTo(this.map!);

      marker.bindPopup(`<strong>${c.name}</strong><br><em>${this.t('Cliquez pour voir les données', 'Click to see data')}</em>`);

      marker.on('click', () => {
        this.selectCity(c);
        this.activeTab = 'weather';
      });
    });

    this.customCities.forEach(c => this.addMarkerForCity(c, '#F5A623', c.customId));
  }

  addMarkerForCity(c: CityData, color: string, customId?: number) {
    if (!this.map) return;
    const marker = L.circleMarker([c.lat, c.lon], {
      radius: 9, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9
    }).addTo(this.map);

    marker.bindPopup(`<strong>${c.name}</strong> ⭐ (${this.t('ville ajoutée', 'added city')})`);
    marker.on('click', () => {
      this.selectCity(c);
      this.activeTab = 'weather';
    });

    if (customId) {
      this.customMarkers.set(customId, marker);
    }
  }

  selectCity(c: CityData) {
    this.selectedCity = c;

    if (c.loaded) return;

    c.loading = true;
    c.loaded = false;

    const pvgis$ = this.http.get<any>(`${this.apiBase}/pvgis/solar?lat=${c.lat}&lon=${c.lon}`)
      .pipe(catchError(() => of(null)));

    const weather$ = this.http.get<any>(`${this.apiBase}/weather/current?lat=${c.lat}&lon=${c.lon}`)
      .pipe(catchError(() => of(null)));

    forkJoin({ pvgis: pvgis$, weather: weather$ }).subscribe(({ pvgis, weather }) => {
      if (pvgis) {
        c.sun = pvgis.sun_hours_per_day ?? c.sun;
      }
      if (weather) {
        c.temp = weather.temp;
        c.humidity = weather.humidity;
        c.wind = weather.wind_speed;
        c.desc = weather.desc;
        c.icon = weather.icon ?? '🌡️';
      }
      c.loading = false;
      c.loaded = true;
    });
  }

  addCity() {
    if (!this.newCityName || this.newCityLat === null || this.newCityLon === null) {
      this.addCityStatus = 'missing';
      return;
    }

    this.customCityService.create({
      name: this.newCityName,
      latitude: this.newCityLat,
      longitude: this.newCityLon
    }).subscribe({
      next: (saved) => {
        const newCity: CityData = {
          name: saved.name,
          lat: saved.latitude,
          lon: saved.longitude,
          icon: '📍',
          customId: saved.id
        };

        this.customCities.push(newCity);
        this.cities.push(newCity);
        this.addMarkerForCity(newCity, '#F5A623', saved.id);

        this.addedCityName = newCity.name;
        this.addCityStatus = 'added';
        this.newCityName = '';
        this.newCityLat = null;
        this.newCityLon = null;
      },
      error: () => alert(this.t('Erreur lors de l\'enregistrement.', 'Error saving.'))
    });
  }

  deleteCity(c: CityData) {
    if (!c.customId) return;

    if (!confirm(this.t(`Supprimer définitivement "${c.name}" ? Elle sera retirée de tous les modules.`, `Permanently delete "${c.name}"? It will be removed from all modules.`))) return;

    this.customCityService.delete(c.customId).subscribe({
      next: () => {
        const marker = this.customMarkers.get(c.customId!);
        if (marker && this.map) this.map.removeLayer(marker);
        this.customMarkers.delete(c.customId!);

        this.customCities = this.customCities.filter(city => city.customId !== c.customId);
        this.cities = this.cities.filter(city => city.customId !== c.customId);

        if (this.selectedCity?.customId === c.customId) this.selectedCity = null;
      },
      error: () => alert(this.t('Erreur lors de la suppression.', 'Error deleting.'))
    });
  }

  evaluation(c: CityData): { solar: string; wind: string } {
    const sun = c.sun ?? 0;
    const wind = c.wind ?? 0;
    return {
      solar: sun >= 5.5
        ? this.t('✅ Excellent potentiel solaire', '✅ Excellent solar potential')
        : sun >= 5.0
          ? this.t('👍 Bon potentiel solaire', '👍 Good solar potential')
          : this.t('⚠️ Potentiel solaire modéré', '⚠️ Moderate solar potential'),
      wind: wind >= 4
        ? this.t('✅ Bon potentiel éolien', '✅ Good wind potential')
        : wind >= 3
          ? this.t('👍 Potentiel éolien acceptable', '👍 Acceptable wind potential')
          : this.t('⚠️ Vent faible pour l\'éolien', '⚠️ Weak wind for wind power')
    };
  }
}