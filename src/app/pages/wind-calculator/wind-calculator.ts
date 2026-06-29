import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { Component, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProjectService } from '../../services/project';
import { AppTranslateService } from '../../services/translate';

interface Region {
  name: string;
  wind: number;
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

  regions: Region[] = [
    { name: 'Ngaoundéré (Adamaoua)', wind: 4.8 },
    { name: 'Maroua (Extrême-Nord)', wind: 4.5 },
    { name: 'Garoua (Nord)', wind: 4.1 },
    { name: 'Buea (Sud-Ouest)', wind: 3.8 },
    { name: 'Bamenda (Nord-Ouest)', wind: 3.5 },
    { name: 'Douala (Littoral)', wind: 3.2 },
    { name: 'Bafoussam (Ouest)', wind: 3.0 },
    { name: 'Bertoua (Est)', wind: 2.2 },
    { name: 'Yaoundé (Centre)', wind: 2.5 },
    { name: 'Ebolowa (Sud)', wind: 2.0 },
  ];

  requiredPower = 2000;
  windSpeed = 4.0;
  efficiency = 35;
  airDensity = 1.225;
  selectedRegion: Region | null = null;

  results: any = null;
  saving = false;
  saveStatus: 'success' | 'error' | '' = '';

  constructor(
    private projectService: ProjectService,
    private route: ActivatedRoute,
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

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['load']) {
        const saved = ProjectService.selectedProject;
        if (saved && saved.type === 'eolien') {
          this.requiredPower = saved.input_data.requiredPower || this.requiredPower;
          this.windSpeed = saved.input_data.windSpeed || this.windSpeed;
          this.efficiency = saved.input_data.efficiency || this.efficiency;
          this.airDensity = saved.input_data.airDensity || this.airDensity;
          this.results = saved.result_data;
          setTimeout(() => this.renderWindCharts(), 500);
        }
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

  calculateWind() {
    const Cp = this.efficiency / 100;
    const rho = this.airDensity;
    const v = this.windSpeed;
    const P = this.requiredPower;

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

    // ===== CALCUL ROI ÉOLIEN =====
const productionAnnuelle = (P * 24 * 365 * 0.35) / 1000; // kWh/an (35% facteur de charge)

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
  efficiency: this.efficiency,
  A: A.toFixed(2),
  D: D.toFixed(2),
  mast,
  nTurb,
  rec,
  totalCost: Math.round(totalCost),
  turbineOptions,
  region: this.selectedRegion?.name || this.t('Non spécifiée', 'Not specified'),
  // ROI
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

  saveProject() {
    if (!this.results) return;
    this.saving = true;

    const project = {
      type: 'eolien' as const,
      name: `💨 Projet Éolien – ${this.results.region}`,
      city: this.results.region,
      input_data: {
        requiredPower: this.requiredPower,
        windSpeed: this.windSpeed,
        efficiency: this.efficiency,
        airDensity: this.airDensity,
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

  renderWindCharts() {
    if (!this.results) return;

    this.windChart?.destroy();
    this.powerChart?.destroy();

    const windCtx = document.getElementById('windSpeedChart') as HTMLCanvasElement;
    if (windCtx) {
      const speeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const powers = speeds.map(v =>
        Math.round(0.5 * this.airDensity * (this.results.A) * Math.pow(v, 3) * (this.efficiency / 100))
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
