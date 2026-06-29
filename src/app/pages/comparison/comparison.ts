import { Component, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AiService } from '../../services/ai';
import { AppTranslateService } from '../../services/translate';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './comparison.html',
  styleUrl: './comparison.css'
})
export class Comparison {

  // Inputs communs
  consumption = 4000; // Wh/jour
  city = 'Yaoundé';
  sunHours = 5.1;
  windSpeed = 2.5;
  budget: number | null = null;

  // Résultats calculés
  solarResult: any = null;
  windResult: any = null;
  hybridResult: any = null;
  aiRecommendation = '';
  aiLoading = false;
  calculated = false;
  compChart: Chart | null = null;

  cities = [
    { name: 'Yaoundé (Centre)', sun: 5.1, wind: 2.5 },
    { name: 'Douala (Littoral)', sun: 4.8, wind: 3.2 },
    { name: 'Garoua (Nord)', sun: 6.1, wind: 4.1 },
    { name: 'Maroua (Extrême-Nord)', sun: 6.4, wind: 4.5 },
    { name: 'Bafoussam (Ouest)', sun: 5.3, wind: 3.0 },
    { name: 'Bamenda (Nord-Ouest)', sun: 5.0, wind: 3.5 },
    { name: 'Ngaoundéré (Adamaoua)', sun: 5.8, wind: 4.8 },
    { name: 'Bertoua (Est)', sun: 4.9, wind: 2.2 },
    { name: 'Ebolowa (Sud)', sun: 4.7, wind: 2.0 },
    { name: 'Buea (Sud-Ouest)', sun: 4.5, wind: 3.8 },
  ];

  constructor(
    private aiService: AiService,
    public translateService: AppTranslateService
  ) {
    effect(() => {
      this.translateService.lang();
      if (this.calculated) {
        setTimeout(() => this.renderChart(), 0);
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

  onCityChange() {
    const c = this.cities.find(c => c.name === this.city);
    if (c) { this.sunHours = c.sun; this.windSpeed = c.wind; }
  }

  compare() {
    const daily = this.consumption;
    const loss = 1.25;
    const DOD = 0.8;
    const voltage = 24;
    const panelPower = 300;
    const autonomy = 2;

    // === SOLAIRE ===
    const peakPower = (daily * loss) / this.sunHours;
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
      reliability: this.sunHours >= 5.5 ? 'excellent' : this.sunHours >= 4.5 ? 'good' : 'average',
      maintenance: 'low',
      lifespan: '25-years',
      score: Math.round((this.sunHours / 6.5) * 100)
    };

    // === ÉOLIEN ===
    const Cp = 0.35;
    const rho = 1.225;
    const v = this.windSpeed;
    const A = daily / (0.5 * rho * Math.pow(v, 3) * Cp * 24);
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

    // === HYBRIDE ===
    const hybridCost = Math.round((totalSolar + costWind) * 0.65);
    this.hybridResult = {
      totalCost: hybridCost,
      roi: Math.round(hybridCost / (daily * 365 / 1000 * 120)),
      reliability: 'excellent',
      maintenance: 'average',
      lifespan: '25-years',
      score: Math.round((this.solarResult.score + this.windResult.score) / 2 * 1.1)
    };

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
      consumption: this.consumption,
      city: this.city,
      sun_hours: this.sunHours,
      wind_speed: this.windSpeed,
      budget: this.budget ?? undefined
    }).subscribe({
      next: (res) => { this.aiRecommendation = res.recommendation; this.aiLoading = false; },
      error: () => { this.aiRecommendation = this.t('⚠️ IA indisponible.', '⚠️ AI unavailable.'); this.aiLoading = false; }
    });
  }

  getBestSystem(): string {
    if (!this.solarResult) return '';
    const costs = [
      { name: '☀️ ' + this.t('Solaire', 'Solar'), cost: this.solarResult.totalCost },
      { name: '💨 ' + this.t('Éolien', 'Wind'), cost: this.windResult.totalCost },
      { name: '⚡ ' + this.t('Hybride', 'Hybrid'), cost: this.hybridResult.totalCost }
    ];
    return costs.sort((a, b) => a.cost - b.cost)[0].name;
  }
}
