import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project';
import { CustomCityService, CustomCity } from '../../services/custom-city';
import { AppTranslateService } from '../../services/translate';

interface Region {
  name: string;
  wind: number;
  lat?: number;
  lon?: number;
  isCustom?: boolean;
  customId?: number;
}

@Component({
  selector: 'app-wind-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './wind-calculator.html',
  styleUrl: './wind-calculator.css'
})
export class WindCalculator implements OnInit {
  windChart: Chart | null = null;
  powerChart: Chart | null = null;

  // ===== Données =====
  regions: Region[] = [
    // CENTRE
    { name: 'Yaoundé', wind: 2.5 },
    { name: 'Mbalmayo', wind: 2.1 },
    { name: 'Obala', wind: 2.3 },
    { name: 'Mfou', wind: 2.2 },
    { name: 'Akonolinga', wind: 2.0 },
    { name: 'Eséka', wind: 2.1 },
    // LITTORAL
    { name: 'Douala', wind: 3.2 },
    { name: 'Edéa', wind: 2.8 },
    { name: 'Nkongsamba', wind: 2.9 },
    { name: 'Manjo', wind: 2.7 },
    { name: 'Loum', wind: 2.6 },
    // OUEST
    { name: 'Bafoussam', wind: 3.0 },
    { name: 'Dschang', wind: 3.3 },
    { name: 'Mbouda', wind: 3.4 },
    { name: 'Foumban', wind: 3.1 },
    { name: 'Bafang', wind: 3.0 },
    { name: 'Bandjoun', wind: 3.2 },
    // NORD-OUEST
    { name: 'Bamenda', wind: 3.5 },
    { name: 'Kumbo', wind: 3.8 },
    { name: 'Wum', wind: 3.6 },
    { name: 'Nkambe', wind: 4.0 },
    // SUD-OUEST
    { name: 'Buea', wind: 3.8 },
    { name: 'Limbe', wind: 4.2 },
    { name: 'Kumba', wind: 2.9 },
    { name: 'Mamfe', wind: 2.7 },
    { name: 'Tiko', wind: 3.9 },
    // NORD
    { name: 'Garoua', wind: 4.1 },
    { name: 'Guider', wind: 4.0 },
    { name: 'Poli', wind: 3.9 },
    { name: 'Tcholliré', wind: 4.2 },
    { name: 'Pitoa', wind: 4.0 },
    // EXTREME-NORD
    { name: 'Maroua', wind: 4.5 },
    { name: 'Kousséri', wind: 4.7 },
    { name: 'Mokolo', wind: 4.6 },
    { name: 'Yagoua', wind: 4.4 },
    { name: 'Kaélé', wind: 4.3 },
    { name: 'Mora', wind: 4.8 },
    // ADAMAOUA
    { name: 'Ngaoundéré', wind: 4.8 },
    { name: 'Meiganga', wind: 4.5 },
    { name: 'Tibati', wind: 4.0 },
    { name: 'Tignère', wind: 4.9 },
    // EST
    { name: 'Bertoua', wind: 2.2 },
    { name: 'Batouri', wind: 2.0 },
    { name: 'Yokadouma', wind: 1.9 },
    { name: 'Abong-Mbang', wind: 2.0 },
    // SUD
    { name: 'Ebolowa', wind: 2.0 },
    { name: 'Sangmélima', wind: 1.8 },
    { name: 'Kribi', wind: 3.6 },
    { name: 'Ambam', wind: 1.9 },
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
  selectedRegion: Region | null = null;

  get filteredRegions(): Region[] {
    if (!this.selectedRegionName) return [];
    const group = this.regionGroups.find(g => g.name === this.selectedRegionName);
    if (!group) return [];
    return this.regions.filter(r => group.cities.includes(r.name));
  }

  onRegionGroupChange() {
    this.selectedRegion = null;
  }

  // ===== Champs du formulaire =====
  requiredPower: number | null = null;
  windSpeed: number | null = null;
  efficiency: number | null = null;
  airDensity: number | null = null;

  results: any = null;
  saving = false;
  saveStatus: 'success' | 'error' | '' = '';

  // ===== Ajout ville personnalisée =====
  showAddCityForm = false;
  newCityName = '';
  newCityLat: number | null = null;
  newCityLon: number | null = null;
  newCityRegion: string | null = null;
  newCityWind: number | null = null;
  addCityStatus: 'missing' | 'added' | '' = '';
  addedCityName = '';

  get addCityMessage(): string {
    if (this.addCityStatus === 'missing')
      return this.t('⚠️ Remplissez le nom, la région, la latitude et la longitude.', '⚠️ Fill in the name, region, latitude and longitude.');
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

    let windSpeed = this.newCityWind;
    if (windSpeed === null || windSpeed === undefined || isNaN(windSpeed) || windSpeed <= 0) {
      const existingCities = this.regions.filter(r => regionGroup.cities.includes(r.name));
      const avgWind = existingCities.reduce((sum, r) => sum + r.wind, 0) / (existingCities.length || 1);
      windSpeed = Math.round(avgWind * 10) / 10;
    }

    this.customCityService.create({
      name: this.newCityName,
      region: this.newCityRegion,
      latitude: this.newCityLat,
      longitude: this.newCityLon,
      wind_speed: windSpeed
    }).subscribe({
      next: (saved) => {
        const newRegion: Region = {
          name: saved.name,
          wind: saved.wind_speed ?? 3.0,
          lat: saved.latitude,
          lon: saved.longitude,
          isCustom: true,
          customId: saved.id
        };

        regionGroup.cities.push(newRegion.name);
        this.regions.push(newRegion);

        this.selectedRegion = newRegion;
        this.windSpeed = newRegion.wind;
        this.selectedRegionName = this.newCityRegion;
        this.addedCityName = newRegion.name;
        this.addCityStatus = 'added';

        this.newCityName = '';
        this.newCityRegion = null;
        this.newCityWind = null;
        this.newCityLat = null;
        this.newCityLon = null;
        this.showAddCityForm = false;
      },
      error: () => {
        this.addCityStatus = 'missing';
        alert(this.t('Erreur lors de l\'enregistrement de la ville.', 'Error saving the city.'));
      }
    });
  }

  deleteCustomCity(region: Region) {
    if (!region.isCustom || !region.customId) return;

    if (!confirm(this.t(`Supprimer définitivement "${region.name}" ? Elle sera retirée de tous les modules.`, `Permanently delete "${region.name}"? It will be removed from all modules.`))) return;

    this.customCityService.delete(region.customId).subscribe({
      next: () => {
        this.regions = this.regions.filter(r => r.customId !== region.customId);
        this.regionGroups.forEach(g => g.cities = g.cities.filter(name => name !== region.name));
        if (this.selectedRegion?.customId === region.customId) this.selectedRegion = null;
      },
      error: () => alert(this.t('Erreur lors de la suppression.', 'Error deleting the city.'))
    });
  }

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private customCityService: CustomCityService,
    public translateService: AppTranslateService
  ) {
    effect(() => {
      this.translateService.lang();
      if (this.results) {
        setTimeout(() => this.renderWindCharts(), 0);
      }
    });
  }

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  get saveMessage(): string {
    if (this.saveStatus === 'success') {
      return this.t('✅ Projet sauvegardé automatiquement dans "Mes Projets"', '✅ Project automatically saved in "My Projects"');
    }
    if (this.saveStatus === 'error') {
      return this.t('⚠️ Erreur lors de la sauvegarde.', '⚠️ Error while saving.');
    }
    return '';
  }

  isFormValid(): boolean {
    return this.selectedRegion !== null &&
           this.requiredPower !== null && this.requiredPower > 0 &&
           this.windSpeed !== null && this.windSpeed > 0 &&
           this.efficiency !== null && this.efficiency > 0 && this.efficiency <= 100 &&
           this.airDensity !== null && this.airDensity > 0;
  }

  ngOnInit() {
    this.loadCustomCities();

    this.route.queryParams.subscribe(params => {
      if (params['load']) {
        const saved = ProjectService.selectedProject;
        if (saved && saved.type === 'eolien') {
          this.requiredPower = saved.input_data.requiredPower || null;
          this.windSpeed = saved.input_data.windSpeed || null;
          this.efficiency = saved.input_data.efficiency || null;
          this.airDensity = saved.input_data.airDensity || null;
          this.results = saved.result_data;
          setTimeout(() => this.renderWindCharts(), 500);
        }
      }
    });
  }

  loadCustomCities() {
    this.customCityService.getAll().subscribe({
      next: (list) => {
        list.forEach(c => {
          if (this.regions.some(r => r.name === c.name)) return;

          const region: Region = {
            name: c.name,
            wind: c.wind_speed ?? 3.0,
            lat: c.latitude,
            lon: c.longitude,
            isCustom: true,
            customId: c.id
          };
          this.regions.push(region);

          const group = this.regionGroups.find(g => g.name === c.region);
          if (group && !group.cities.includes(c.name)) {
            group.cities.push(c.name);
          }
        });
      }
    });
  }

  onRegionChange() {
    if (this.selectedRegion) {
      this.windSpeed = this.selectedRegion.wind;
    }
  }

  regionCompare(r1: Region | null, r2: Region | null): boolean {
    return r1 && r2 ? r1.name === r2.name : r1 === r2;
  }

  // ===== Calcul =====
  calculateWind() {
    if (!this.isFormValid()) {
      alert(this.t('Veuillez remplir tous les champs correctement.', 'Please fill all fields correctly.'));
      return;
    }

    const Cp = this.efficiency! / 100;
    const rho = this.airDensity!;
    const v = this.windSpeed!;
    const P = this.requiredPower!;

    const A = P / (0.5 * rho * Math.pow(v, 3) * Cp);
    const R = Math.sqrt(A / Math.PI);
    const D = 2 * R;
    const mast = D <= 3 ? 12 : D <= 6 ? 18 : 24;

    const turbines = [
      { name: 'Éolienne 500W – mât 6m', power: 500, price: 450000, brand: 'Windmax' },
      { name: 'Éolienne 1000W – mât 9m', power: 1000, price: 850000, brand: 'Bergey' },
      { name: 'Éolienne 2000W – mât 12m', power: 2000, price: 1500000, brand: 'Xzeres' },
      { name: 'Éolienne 3000W – mât 18m', power: 3000, price: 2200000, brand: 'Aeolos' },
      { name: 'Éolienne 5000W – mât 24m', power: 5000, price: 3800000, brand: 'Kingspan' },
      { name: 'Parc éolien 10kW', power: 10000, price: 7500000, brand: 'Endurance' },
    ];

    const recIndex = turbines.findIndex(t => t.power >= P);
    const rec = recIndex >= 0 ? turbines[recIndex] : turbines[turbines.length - 1];
    const nTurb = Math.ceil(P / rec.power);
    const totalCost = nTurb * rec.price * 1.2;

    const turbineOptions = turbines.map((t, i) => ({
      ...t,
      recommended: i === (recIndex >= 0 ? recIndex : turbines.length - 1)
    }));

    const productionAnnuelle = (P * 24 * 365 * 0.35) / 1000;
    const calculerFactureSocdel = (kwh: number): number => {
      if (kwh <= 110) return kwh * 50;
      if (kwh <= 400) return (110 * 50) + ((kwh - 110) * 79);
      return (110 * 50) + (290 * 79) + ((kwh - 400) * 96);
    };
    const consommationMensuelle = productionAnnuelle / 12;
    const factureMensuelle = calculerFactureSocdel(consommationMensuelle);
    const economieAnnuelle = Math.round(factureMensuelle * 12);
    const coutTotal = Math.round(nTurb * rec.price * 1.2);
    const paybackYears = Math.round((coutTotal / economieAnnuelle) * 10) / 10;
    const benefice20ans = Math.round((economieAnnuelle * 20) - coutTotal);
    const benefice25ans = Math.round((economieAnnuelle * 25) - coutTotal);
    const roi20ans = Math.round((benefice20ans / coutTotal) * 100);

    this.results = {
      requiredPower: P,
      windSpeed: v,
      efficiency: this.efficiency!,
      A: A.toFixed(2),
      D: D.toFixed(2),
      mast,
      nTurb,
      rec,
      totalCost: Math.round(totalCost),
      turbineOptions,
      region: this.selectedRegion?.name || this.t('Non spécifiée', 'Not specified'),
      roi: {
        productionAnnuelle: Math.round(productionAnnuelle),
        economieAnnuelle,
        paybackYears,
        benefice20ans,
        benefice25ans,
        roi20ans,
        consommationMensuelle: Math.round(consommationMensuelle),
        factureMensuelle: Math.round(factureMensuelle),
      }
    };

    this.saveProject();
    setTimeout(() => this.renderWindCharts(), 500);
  }

  // ===== Sauvegarde =====
  saveProject() {
    if (!this.results) return;
    this.saving = true;

    const project = {
      type: 'eolien' as const,
      name: `💨 Projet Éolien – ${this.results.region}`,
      city: this.results.region,
      input_data: {
        requiredPower: this.requiredPower!,
        windSpeed: this.windSpeed!,
        efficiency: this.efficiency!,
        airDensity: this.airDensity!,
      },
      result_data: this.results,
      total_cost: this.results.totalCost,
    };

    this.projectService.create(project).subscribe({
      next: () => {
        this.saving = false;
        this.saveStatus = 'success';
      },
      error: () => {
        this.saving = false;
        this.saveStatus = 'error';
      }
    });
  }

  reset() {
    this.results = null;
    this.saveStatus = '';
  }

  // ===== Graphiques =====
  renderWindCharts() {
    if (!this.results) return;

    this.windChart?.destroy();
    this.powerChart?.destroy();

    const windCtx = document.getElementById('windSpeedChart') as HTMLCanvasElement;
    if (windCtx) {
      const speeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const powers = speeds.map(v =>
        Math.round(0.5 * this.airDensity! * (this.results.A) * Math.pow(v, 3) * (this.efficiency! / 100))
      );
      this.windChart = new Chart(windCtx, {
        type: 'line',
        data: {
          labels: speeds.map(s => s + ' m/s'),
          datasets: [{
            label: this.t('Puissance produite (W)', 'Produced power (W)'),
            data: powers,
            borderColor: '#2980B9',
            backgroundColor: 'rgba(41,128,185,0.1)',
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: { title: { display: true, text: this.t('Puissance en fonction de la vitesse du vent', 'Power according to wind speed') } },
          scales: {
            y: { title: { display: true, text: this.t('Puissance (W)', 'Power (W)') } },
            x: { title: { display: true, text: this.t('Vitesse du vent', 'Wind speed') } }
          }
        }
      });
    }

    const powerCtx = document.getElementById('turbineChart') as HTMLCanvasElement;
    if (powerCtx) {
      this.powerChart = new Chart(powerCtx, {
        type: 'bar',
        data: {
          labels: this.results.turbineOptions.map((t: any) => t.name),
          datasets: [{
            label: this.t('Prix (FCFA)', 'Price (FCFA)'),
            data: this.results.turbineOptions.map((t: any) => t.price),
            backgroundColor: this.results.turbineOptions.map((t: any) =>
              t.recommended ? '#F5A623' : 'rgba(41,128,185,0.6)'
            ),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: this.t('Comparaison des éoliennes disponibles (FCFA)', 'Available wind turbines comparison (FCFA)') },
            legend: { display: false }
          },
          scales: { y: { title: { display: true, text: this.t('Prix (FCFA)', 'Price (FCFA)') } } }
        }
      });
    }
  }
}