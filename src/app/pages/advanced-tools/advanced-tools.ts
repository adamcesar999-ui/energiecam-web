import { Component, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import * as L from 'leaflet';
import { AppTranslateService } from '../../services/translate';

interface CityData {
  name: string;
  lat: number;
  lon: number;
  sun: number;
  wind: number;
  temp: number;
  humidity: number;
  desc: string;
  icon: string;
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

  cities: CityData[] = [
    { name: 'Yaoundé', lat: 3.848, lon: 11.502, sun: 5.1, wind: 2.5, temp: 24, humidity: 78, desc: 'Partiellement nuageux', icon: '⛅' },
    { name: 'Douala', lat: 4.061, lon: 9.737, sun: 4.8, wind: 3.2, temp: 27, humidity: 85, desc: 'Chaud et humide', icon: '🌤️' },
    { name: 'Garoua', lat: 9.301, lon: 13.397, sun: 6.1, wind: 4.1, temp: 34, humidity: 35, desc: 'Ensoleillé et chaud', icon: '☀️' },
    { name: 'Maroua', lat: 10.591, lon: 14.316, sun: 6.4, wind: 4.5, temp: 36, humidity: 28, desc: 'Très ensoleillé', icon: '☀️' },
    { name: 'Bafoussam', lat: 5.478, lon: 10.417, sun: 5.3, wind: 3.0, temp: 21, humidity: 72, desc: 'Frais et nuageux', icon: '🌥️' },
    { name: 'Bamenda', lat: 5.959, lon: 10.146, sun: 5.0, wind: 3.5, temp: 20, humidity: 80, desc: 'Brumeux le matin', icon: '🌫️' },
    { name: 'Ngaoundéré', lat: 7.322, lon: 13.584, sun: 5.8, wind: 4.8, temp: 22, humidity: 65, desc: 'Doux, bon vent', icon: '🌬️' },
    { name: 'Bertoua', lat: 4.578, lon: 13.686, sun: 4.9, wind: 2.2, temp: 26, humidity: 82, desc: 'Humide', icon: '🌦️' },
    { name: 'Ebolowa', lat: 2.900, lon: 11.150, sun: 4.7, wind: 2.0, temp: 25, humidity: 88, desc: 'Tropical', icon: '🌡️' },
    { name: 'Buea', lat: 4.154, lon: 9.242, sun: 4.5, wind: 3.8, temp: 18, humidity: 92, desc: 'Frais, brumeux', icon: '🌫️' },
  ];

  customCities: CityData[] = [];
  selectedCity: CityData | null = null;

  // Add city form
  newCityName = '';
  newCityLat: number | null = null;
  newCityLon: number | null = null;
  newCitySun: number | null = null;
  newCityWind: number | null = null;
  addCityStatus: 'missing' | 'added' | '' = '';
  addedCityName = '';

  constructor(
  public translateService: AppTranslateService,
  private route: ActivatedRoute
) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  get addCityMessage(): string {
    if (this.addCityStatus === 'missing') {
      return this.t('⚠️ Remplissez au moins le nom, la latitude et la longitude.', '⚠️ Fill in at least the name, latitude and longitude.');
    }
    if (this.addCityStatus === 'added') {
      return this.t(
        `✅ Ville "${this.addedCityName}" ajoutée ! Elle apparaît en orange sur la carte.`,
        `✅ City "${this.addedCityName}" added! It appears in orange on the map.`
      );
    }
    return '';
  }

  ngAfterViewInit() {
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

    this.cities.forEach(c => {
      const marker = L.circleMarker([c.lat, c.lon], {
        radius: 8, fillColor: '#2980B9', color: '#fff', weight: 2, fillOpacity: 0.9
      }).addTo(this.map!);

      marker.bindPopup(`
        <strong>${c.name}</strong><br>
        ☀️ ${this.t('Ensoleillement', 'Sunshine')} : <strong>${c.sun} kWh/m²/j</strong><br>
        💨 ${this.t('Vent moyen', 'Average wind')} : <strong>${c.wind} m/s</strong>
      `);

      marker.on('click', () => {
        this.selectedCity = c;
        this.activeTab = 'weather';
      });
    });

    this.customCities.forEach(c => this.addMarkerForCity(c, '#F5A623'));
  }

  addMarkerForCity(c: CityData, color: string) {
    if (!this.map) return;
    const marker = L.circleMarker([c.lat, c.lon], {
      radius: 8, fillColor: color, color: '#fff', weight: 2, fillOpacity: 0.9
    }).addTo(this.map);

    marker.bindPopup(`
      <strong>${c.name}</strong> (${this.t('ajoutée', 'added')})<br>
      ☀️ ${c.sun} kWh/m²/j<br>
      💨 ${c.wind} m/s
    `);

    marker.on('click', () => {
      this.selectedCity = c;
      this.activeTab = 'weather';
    });
  }

  selectCity(c: CityData) {
    this.selectedCity = c;
  }

  addCity() {
    if (!this.newCityName || this.newCityLat === null || this.newCityLon === null) {
      this.addCityStatus = 'missing';
      return;
    }

    const newCity: CityData = {
      name: this.newCityName,
      lat: this.newCityLat,
      lon: this.newCityLon,
      sun: this.newCitySun ?? 5.0,
      wind: this.newCityWind ?? 3.0,
      temp: 25,
      humidity: 70,
      desc: this.t('Ville ajoutée par utilisateur', 'City added by user'),
      icon: '📍'
    };

    this.customCities.push(newCity);
    this.cities.push(newCity);
    this.addMarkerForCity(newCity, '#F5A623');

    this.addedCityName = newCity.name;
    this.addCityStatus = 'added';
    this.newCityName = '';
    this.newCityLat = null;
    this.newCityLon = null;
    this.newCitySun = null;
    this.newCityWind = null;
  }

  evaluation(c: CityData): { solar: string; wind: string } {
    return {
      solar: c.sun >= 5.5
        ? this.t('✅ Excellent potentiel solaire', '✅ Excellent solar potential')
        : c.sun >= 5.0
          ? this.t('👍 Bon potentiel solaire', '👍 Good solar potential')
          : this.t('⚠️ Potentiel solaire modéré', '⚠️ Moderate solar potential'),
      wind: c.wind >= 4
        ? this.t('✅ Bon potentiel éolien', '✅ Good wind potential')
        : c.wind >= 3
          ? this.t('👍 Potentiel éolien acceptable', '👍 Acceptable wind potential')
          : this.t('⚠️ Vent faible pour l\'éolien', '⚠️ Weak wind for wind power')
    };
  }
}
