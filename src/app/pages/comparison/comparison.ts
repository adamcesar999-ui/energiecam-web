import { Component, effect, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AiService } from '../../services/ai';
import { PvgisService } from '../../services/pvgis';
import { ProjectService } from '../../services/project';
import { CustomCityService, CustomCity } from '../../services/custom-city';
import { AppTranslateService } from '../../services/translate';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface City {
  name: string;
  lat: number;
  lon: number;
  wind: number;
  isCustom?: boolean;
  customId?: number;
}

interface PVgisData {
  sun_hours_per_day: number;
  wind?: number;
  source?: string;
}

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './comparison.html',
  styleUrl: './comparison.css'
})
export class Comparison implements OnInit {

  cities: City[] = [
    // CENTRE
    { name: 'Yaoundé', lat: 3.848, lon: 11.502, wind: 2.5 },
    { name: 'Mbalmayo', lat: 3.517, lon: 11.500, wind: 2.1 },
    { name: 'Obala', lat: 4.167, lon: 11.533, wind: 2.3 },
    { name: 'Mfou', lat: 3.717, lon: 11.633, wind: 2.2 },
    { name: 'Akonolinga', lat: 3.767, lon: 12.250, wind: 2.0 },
    { name: 'Eséka', lat: 3.650, lon: 10.767, wind: 2.1 },
    // LITTORAL
    { name: 'Douala', lat: 4.061, lon: 9.737, wind: 3.2 },
    { name: 'Edéa', lat: 3.800, lon: 10.133, wind: 2.8 },
    { name: 'Nkongsamba', lat: 4.954, lon: 9.940, wind: 2.9 },
    { name: 'Manjo', lat: 4.838, lon: 9.821, wind: 2.7 },
    { name: 'Loum', lat: 4.719, lon: 9.733, wind: 2.6 },
    // OUEST
    { name: 'Bafoussam', lat: 5.478, lon: 10.417, wind: 3.0 },
    { name: 'Dschang', lat: 5.450, lon: 10.050, wind: 3.3 },
    { name: 'Mbouda', lat: 5.625, lon: 10.250, wind: 3.4 },
    { name: 'Foumban', lat: 5.729, lon: 10.917, wind: 3.1 },
    { name: 'Bafang', lat: 5.159, lon: 10.184, wind: 3.0 },
    { name: 'Bandjoun', lat: 5.350, lon: 10.417, wind: 3.2 },
    // NORD-OUEST
    { name: 'Bamenda', lat: 5.959, lon: 10.146, wind: 3.5 },
    { name: 'Kumbo', lat: 6.200, lon: 10.667, wind: 3.8 },
    { name: 'Wum', lat: 6.383, lon: 10.067, wind: 3.6 },
    { name: 'Nkambe', lat: 6.583, lon: 10.667, wind: 4.0 },
    // SUD-OUEST
    { name: 'Buea', lat: 4.154, lon: 9.242, wind: 3.8 },
    { name: 'Limbe', lat: 4.022, lon: 9.205, wind: 4.2 },
    { name: 'Kumba', lat: 4.636, lon: 9.448, wind: 2.9 },
    { name: 'Mamfe', lat: 5.767, lon: 9.317, wind: 2.7 },
    { name: 'Tiko', lat: 4.075, lon: 9.360, wind: 3.9 },
    // NORD
    { name: 'Garoua', lat: 9.301, lon: 13.397, wind: 4.1 },
    { name: 'Guider', lat: 9.933, lon: 13.950, wind: 4.0 },
    { name: 'Poli', lat: 8.483, lon: 13.250, wind: 3.9 },
    { name: 'Tcholliré', lat: 8.400, lon: 14.167, wind: 4.2 },
    { name: 'Pitoa', lat: 9.383, lon: 13.533, wind: 4.0 },
    // EXTREME-NORD
    { name: 'Maroua', lat: 10.591, lon: 14.316, wind: 4.5 },
    { name: 'Kousséri', lat: 12.078, lon: 15.030, wind: 4.7 },
    { name: 'Mokolo', lat: 10.736, lon: 13.802, wind: 4.6 },
    { name: 'Yagoua', lat: 10.339, lon: 15.234, wind: 4.4 },
    { name: 'Kaélé', lat: 10.107, lon: 14.448, wind: 4.3 },
    { name: 'Mora', lat: 11.045, lon: 14.140, wind: 4.8 },
    // ADAMAOUA
    { name: 'Ngaoundéré', lat: 7.322, lon: 13.584, wind: 4.8 },
    { name: 'Meiganga', lat: 6.517, lon: 14.300, wind: 4.5 },
    { name: 'Tibati', lat: 6.467, lon: 12.633, wind: 4.0 },
    { name: 'Tignère', lat: 7.367, lon: 12.650, wind: 4.9 },
    // EST
    { name: 'Bertoua', lat: 4.578, lon: 13.686, wind: 2.2 },
    { name: 'Batouri', lat: 4.433, lon: 14.367, wind: 2.0 },
    { name: 'Yokadouma', lat: 3.517, lon: 15.050, wind: 1.9 },
    { name: 'Abong-Mbang', lat: 3.983, lon: 13.183, wind: 2.0 },
    // SUD
    { name: 'Ebolowa', lat: 2.900, lon: 11.150, wind: 2.0 },
    { name: 'Sangmélima', lat: 2.933, lon: 11.983, wind: 1.8 },
    { name: 'Kribi', lat: 2.938, lon: 9.910, wind: 3.6 },
    { name: 'Ambam', lat: 2.383, lon: 11.283, wind: 1.9 },
  ];

  regionGroups: { name: string; cities: string[] }[] = [
    { name: 'Centre', cities: ['Yaoundé','Mbalmayo','Obala','Mfou','Akonolinga','Eséka'] },
    { name: 'Littoral', cities: ['Douala','Edéa','Nkongsamba','Manjo','Loum'] },
    { name: 'Ouest', cities: ['Bafoussam','Dschang','Mbouda','Foumban','Bafang','Bandjoun'] },
    { name: 'Nord-Ouest', cities: ['Bamenda','Kumbo','Wum','Nkambe'] },
    { name: 'Sud-Ouest', cities: ['Buea','Limbe','Kumba','Mamfe','Tiko'] },
    { name: 'Nord', cities: ['Garoua','Guider','Poli','Tcholliré','Pitoa'] },
    { name: 'Extrême-Nord', cities: ['Maroua','Kousséri','Mokolo','Yagoua','Kaélé','Mora'] },
    { name: 'Adamaoua', cities: ['Ngaoundéré','Meiganga','Tibati','Tignère'] },
    { name: 'Est', cities: ['Bertoua','Batouri','Yokadouma','Abong-Mbang'] },
    { name: 'Sud', cities: ['Ebolowa','Sangmélima','Kribi','Ambam'] },
  ];

  selectedRegionName: string | null = null;
  selectedCity: City | null = null;

  get filteredCities(): City[] {
    if (!this.selectedRegionName) return [];
    const group = this.regionGroups.find(g => g.name === this.selectedRegionName);
    if (!group) return [];
    return this.cities.filter(c => group.cities.includes(c.name));
  }

  onRegionGroupChange() {
    this.selectedCity = null;
    this.sunHours = null;
    this.windSpeed = null;
  }

  consumption: number | null = null;
  sunHours: number | null = null;
  windSpeed: number | null = null;
  budget: number | null = null;

  loadingPvgis = false;
  pvgisStatus: 'official' | 'fallback' | 'error' | '' = '';

  get pvgisSource(): string {
    if (this.pvgisStatus === 'official') {
      return this.t('✅ Données PVGIS officielles (Commission Européenne)', '✅ Official PVGIS data (European Commission)');
    }
    if (this.pvgisStatus === 'fallback') {
      return this.t('⚠️ Estimation locale (PVGIS indisponible)', '⚠️ Local estimate (PVGIS unavailable)');
    }
    if (this.pvgisStatus === 'error') {
      return this.t('⚠️ Impossible de récupérer PVGIS, valeur par défaut utilisée.', '⚠️ Unable to fetch PVGIS, default value used.');
    }
    return '';
  }

  // ===== Ajout ville personnalisée =====
  showAddCityForm = false;
  newCityName = '';
  newCityLat: number | null = null;
  newCityLon: number | null = null;
  newCityRegion: string | null = null;
  addCityStatus: 'missing' | 'added' | 'loading' | '' = '';
  addedCityName = '';

  get addCityMessage(): string {
    if (this.addCityStatus === 'missing')
      return this.t('⚠️ Remplissez le nom, la région, la latitude et la longitude.', '⚠️ Fill in the name, region, latitude and longitude.');
    if (this.addCityStatus === 'loading')
      return this.t('⏳ Récupération des données PVGIS...', '⏳ Fetching PVGIS data...');
    if (this.addCityStatus === 'added')
      return this.t(`✅ Ville "${this.addedCityName}" ajoutée et sélectionnée !`, `✅ City "${this.addedCityName}" added and selected!`);
    return '';
  }

  addCustomCity() {
    if (!this.newCityName || !this.newCityRegion || this.newCityLat === null || this.newCityLon === null) {
      this.addCityStatus = 'missing';
      return;
    }

    const regionGroup = this.regionGroups.find(g => g.name === this.newCityRegion);
    if (!regionGroup) {
      this.addCityStatus = 'missing';
      return;
    }

    if (regionGroup.cities.includes(this.newCityName)) {
      this.addCityStatus = 'missing';
      return;
    }

    this.addCityStatus = 'loading';
    this.loadingPvgis = true;

    this.pvgis.getSolarData(this.newCityLat, this.newCityLon).subscribe({
      next: (data: PVgisData) => this.finalizeAddCity(regionGroup, data.sun_hours_per_day, (data as any).wind, data.source === 'PVGIS' ? 'official' : 'fallback'),
      error: () => this.finalizeAddCity(regionGroup, 5.0, 3.0, 'error')
    });
  }

  private finalizeAddCity(regionGroup: { name: string; cities: string[] }, sunHours: number, windGuess: number | undefined, status: 'official' | 'fallback' | 'error') {
    this.customCityService.create({
      name: this.newCityName,
      region: this.newCityRegion,
      latitude: this.newCityLat!,
      longitude: this.newCityLon!,
      sun_hours: sunHours,
      wind_speed: windGuess ?? 3.0
    }).subscribe({
      next: (saved) => {
        const newCity: City = {
          name: saved.name,
          lat: saved.latitude,
          lon: saved.longitude,
          wind: saved.wind_speed ?? 3.0,
          isCustom: true,
          customId: saved.id
        };

        this.cities.push(newCity);
        regionGroup.cities.push(newCity.name);

        this.selectedRegionName = this.newCityRegion;
        this.selectedCity = newCity;
        this.addedCityName = newCity.name;
        this.sunHours = saved.sun_hours ?? sunHours;
        this.windSpeed = newCity.wind;
        this.pvgisStatus = status;
        this.loadingPvgis = false;
        this.addCityStatus = 'added';

        this.newCityName = '';
        this.newCityRegion = null;
        this.newCityLat = null;
        this.newCityLon = null;
        this.showAddCityForm = false;
      },
      error: () => {
        this.loadingPvgis = false;
        this.addCityStatus = 'missing';
        alert(this.t('Erreur lors de l\'enregistrement de la ville.', 'Error saving the city.'));
      }
    });
  }

  deleteCustomCity(city: City) {
    if (!city.isCustom || !city.customId) return;

    if (!confirm(this.t(`Supprimer définitivement la ville "${city.name}" ? Elle sera retirée de tous les modules.`, `Permanently delete "${city.name}"? It will be removed from all modules.`))) {
      return;
    }

    this.customCityService.delete(city.customId).subscribe({
      next: () => {
        this.cities = this.cities.filter(c => c.customId !== city.customId);
        this.regionGroups.forEach(g => {
          g.cities = g.cities.filter(name => name !== city.name);
        });
        if (this.selectedCity?.customId === city.customId) {
          this.selectedCity = null;
        }
      },
      error: () => alert(this.t('Erreur lors de la suppression.', 'Error deleting the city.'))
    });
  }

  solarResult: any = null;
  windResult: any = null;
  hybridResult: any = null;
  aiRecommendation = '';
  aiLoading = false;
  calculated = false;
  compChart: Chart | null = null;

  constructor(
    private aiService: AiService,
    private pvgis: PvgisService,
    private projectService: ProjectService,
    private customCityService: CustomCityService,
    public translateService: AppTranslateService
  ) {
    effect(() => {
      this.translateService.lang();
      if (this.calculated) {
        setTimeout(() => this.renderChart(), 0);
      }
    });
  }

  ngOnInit() {
    this.loadCustomCities();
  }

  loadCustomCities() {
    this.customCityService.getAll().subscribe({
      next: (list) => {
        list.forEach(c => {
          if (this.cities.some(existing => existing.name === c.name)) return;

          const city: City = {
            name: c.name,
            lat: c.latitude,
            lon: c.longitude,
            wind: c.wind_speed ?? 3.0,
            isCustom: true,
            customId: c.id
          };
          this.cities.push(city);

          const group = this.regionGroups.find(g => g.name === c.region);
          if (group && !group.cities.includes(c.name)) {
            group.cities.push(c.name);
          }
        });
      }
    });
  }

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  translateValue(value: string): string {
    const values: Record<string, string> = {
      excellent: this.t('Excellente', 'Excellent'),
      good: this.t('Bonne', 'Good'),
      average: this.t('Moyenne', 'Average'),
      low: this.t('Faible', 'Low'),
      high: this.t('Élevée', 'High'),
      '25-years': this.t('25 ans', '25 years'),
      '20-years': this.t('20 ans', '20 years')
    };
    return values[value] || value;
  }

  isFormValid(): boolean {
    return this.consumption !== null && this.consumption > 0 &&
           this.selectedRegionName !== null &&
           this.selectedCity !== null &&
           this.sunHours !== null && this.sunHours > 0 &&
           this.windSpeed !== null && this.windSpeed > 0;
  }

  onCityChange() {
    if (!this.selectedCity) return;
    this.loadingPvgis = true;
    this.pvgis.getSolarData(this.selectedCity.lat, this.selectedCity.lon).subscribe({
      next: (data: PVgisData) => {
        this.sunHours = data.sun_hours_per_day;
        this.windSpeed = (data as any).wind || (data as any).windSpeed || this.selectedCity?.wind || 3.0;
        this.pvgisStatus = data.source === 'PVGIS' ? 'official' : 'fallback';
        this.loadingPvgis = false;
      },
      error: () => {
        this.loadingPvgis = false;
        this.pvgisStatus = 'error';
        this.sunHours = 5.0;
        this.windSpeed = this.selectedCity?.wind || 3.0;
      }
    });
  }

  cityCompare(c1: City | null, c2: City | null): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2;
  }

  compare() {
    if (!this.isFormValid()) {
      alert(this.t('Veuillez remplir tous les champs avant de comparer.', 'Please fill all fields before comparing.'));
      return;
    }

    const daily = this.consumption!;
    const sun = this.sunHours!;
    const wind = this.windSpeed!;

    const loss = 1.25;
    const DOD = 0.8;
    const voltage = 24;
    const panelPower = 300;
    const autonomy = 2;

    const peakPower = (daily * loss) / sun;
    const nPanels = Math.ceil(peakPower / panelPower);
    const battAh = (daily * autonomy) / (DOD * voltage);
    const nBatt = Math.ceil(battAh / 200);
    const costSolarPanels = nPanels * 85000;
    const costSolarBatt = nBatt * 75000;
    const costSolarReg = 35000;
    const costSolarInv = 75000;
    const costSolarInstall = (costSolarPanels + costSolarBatt + costSolarReg + costSolarInv) * 0.15;
    const totalSolar = Math.round(costSolarPanels + costSolarBatt + costSolarReg + costSolarInv + costSolarInstall);

    this.solarResult = {
      nPanels, panelPower, battAh: Math.round(battAh), nBatt,
      totalCost: totalSolar,
      roi: Math.round(totalSolar / (daily * 365 / 1000 * 100)),
      reliability: sun >= 5.5 ? 'excellent' : sun >= 4.5 ? 'good' : 'average',
      maintenance: 'low',
      lifespan: '25-years',
      score: Math.round((sun / 6.5) * 100)
    };

    const Cp = 0.35;
    const rho = 1.225;
    const v = wind;
    const P = daily / 24;
    const A = P / (0.5 * rho * Math.pow(v, 3) * Cp);
    const nTurb = Math.max(1, Math.ceil(A / 10));
    const costWind = nTurb * 1500000 * 1.2;

    this.windResult = {
      nTurb, windSpeed: v,
      totalCost: Math.round(costWind),
      roi: Math.round(costWind / (daily * 365 / 1000 * 100)),
      reliability: v >= 4 ? 'excellent' : v >= 3 ? 'good' : 'low',
      maintenance: 'high',
      lifespan: '20-years',
      score: Math.round((v / 6) * 100)
    };

    const hybridCost = Math.round((totalSolar + costWind) * 0.65);
    this.hybridResult = {
      totalCost: hybridCost,
      roi: Math.round(hybridCost / (daily * 365 / 1000 * 120)),
      reliability: 'excellent',
      maintenance: 'average',
      lifespan: '25-years',
      score: Math.round((this.solarResult.score + this.windResult.score) / 2 * 1.1)
    };

    const all = [
      { ...this.solarResult, name: '☀️ Solaire' },
      { ...this.windResult, name: '💨 Éolien' },
      { ...this.hybridResult, name: '⚡ Hybride' }
    ];
    const best = all.reduce((a, b) => a.score > b.score ? a : b);
    if (best.name === '☀️ Solaire') this.solarResult.recommended = true;
    else if (best.name === '💨 Éolien') this.windResult.recommended = true;
    else this.hybridResult.recommended = true;

    this.calculated = true;
    setTimeout(() => this.renderChart(), 300);
    this.getAiRecommendation();
  }

  renderChart() {
    this.compChart?.destroy();
    const ctx = document.getElementById('compChart') as HTMLCanvasElement;
    if (!ctx) return;

    this.compChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [
          '☀️ ' + this.t('Solaire', 'Solar'),
          '💨 ' + this.t('Éolien', 'Wind'),
          '⚡ ' + this.t('Hybride', 'Hybrid')
        ],
        datasets: [
          {
            label: this.t('Coût total (FCFA)', 'Total cost (FCFA)'),
            data: [this.solarResult.totalCost, this.windResult.totalCost, this.hybridResult.totalCost],
            backgroundColor: ['rgba(245,166,35,0.8)', 'rgba(41,128,185,0.8)', 'rgba(39,174,96,0.8)'],
            borderWidth: 1,
            yAxisID: 'y'
          },
          {
            label: this.t('Score global (/100)', 'Overall score (/100)'),
            data: [this.solarResult.score, this.windResult.score, Math.min(this.hybridResult.score, 100)],
            backgroundColor: ['rgba(245,166,35,0.3)', 'rgba(41,128,185,0.3)', 'rgba(39,174,96,0.3)'],
            borderColor: ['#F5A623', '#2980B9', '#27AE60'],
            borderWidth: 2,
            type: 'line' as any,
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: { display: true, text: this.t('Comparaison des 3 systèmes énergétiques', 'Comparison of the 3 energy systems') },
          legend: { position: 'bottom' }
        },
        scales: {
          y: { title: { display: true, text: this.t('Coût (FCFA)', 'Cost (FCFA)') }, position: 'left' },
          y2: { title: { display: true, text: this.t('Score (/100)', 'Score (/100)') }, position: 'right', min: 0, max: 100, grid: { drawOnChartArea: false } }
        }
      }
    });
  }

  getAiRecommendation() {
    this.aiLoading = true;
    this.aiService.recommend({
      consumption: this.consumption!,
      city: this.selectedCity?.name || '',
      sun_hours: this.sunHours!,
      wind_speed: this.windSpeed!,
      budget: this.budget ?? undefined
    }).subscribe({
      next: (res) => { this.aiRecommendation = res.recommendation; this.aiLoading = false; },
      error: () => { this.aiRecommendation = this.t('⚠️ IA indisponible.', '⚠️ AI unavailable.'); this.aiLoading = false; }
    });
  }

  getBestSystem(): string {
    if (!this.solarResult) return '';
    const best = this.solarResult.recommended ? '☀️ Solaire' :
                 this.windResult.recommended ? '💨 Éolien' :
                 '⚡ Hybride';
    return best;
  }

  resetComparison() {
    this.calculated = false;
    this.solarResult = null;
    this.windResult = null;
    this.hybridResult = null;
    this.aiRecommendation = '';
    this.compChart?.destroy();
    this.consumption = null;
    this.selectedRegionName = null;
    this.selectedCity = null;
    this.sunHours = null;
    this.windSpeed = null;
    this.budget = null;
  }
}