import { ActivatedRoute } from '@angular/router';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);
import { Component, OnInit, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PvgisService } from '../../services/pvgis';
import { ProjectService } from '../../services/project';
import { PdfService } from '../../services/pdf';
import { AppTranslateService } from '../../services/translate';

interface Appliance {
  name: string;
  power: number;
  hours: number;
  qty: number;
}

interface City {
  name: string;
  lat: number;
  lon: number;
  wind: number;
}

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './calculator.html',
  styleUrl: './calculator.css'
})
export class Calculator implements OnInit, AfterViewInit {
  costChart: Chart | null = null;
  prodChart: Chart | null = null;
  consoChart: Chart | null = null;

  ngAfterViewInit() {}

  // ===== Villes du Cameroun =====
  cities: City[] = [
    { name: 'Yaoundé (Centre)', lat: 3.848, lon: 11.502, wind: 2.5 },
    { name: 'Douala (Littoral)', lat: 4.061, lon: 9.737, wind: 3.2 },
    { name: 'Garoua (Nord)', lat: 9.301, lon: 13.397, wind: 4.1 },
    { name: 'Maroua (Extrême-Nord)', lat: 10.591, lon: 14.316, wind: 4.5 },
    { name: 'Bafoussam (Ouest)', lat: 5.478, lon: 10.417, wind: 3.0 },
    { name: 'Bamenda (Nord-Ouest)', lat: 5.959, lon: 10.146, wind: 3.5 },
    { name: 'Ngaoundéré (Adamaoua)', lat: 7.322, lon: 13.584, wind: 4.8 },
    { name: 'Bertoua (Est)', lat: 4.578, lon: 13.686, wind: 2.2 },
    { name: 'Ebolowa (Sud)', lat: 2.900, lon: 11.150, wind: 2.0 },
    { name: 'Buea (Sud-Ouest)', lat: 4.154, lon: 9.242, wind: 3.8 },
  ];

  // ===== Étapes =====
  step = 1;

  // ===== Étape 1 : Appareils =====
  appliances: Appliance[] = [
    { name: 'Ampoule LED', power: 10, hours: 6, qty: 4 },
    { name: 'Téléviseur', power: 80, hours: 4, qty: 1 },
    { name: 'Réfrigérateur', power: 150, hours: 24, qty: 1 },
  ];

  // ===== Étape 2 : Localisation & paramètres =====
  selectedCity: City | null = null;
  sunHours: number = 5.1;
  loadingPvgis = false;
  pvgisStatus: 'official' | 'fallback' | 'error' | '' = '';
  autonomyDays = 2;
  voltage = 24;
  panelPower = 300;

  // ===== Résultats =====
  results: any = null;
  saving = false;
  saveStatus: 'success' | 'error' | '' = '';

  constructor(
    private pvgis: PvgisService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private pdfService: PdfService,
    public translateService: AppTranslateService
  ) {
    effect(() => {
      this.translateService.lang();
      if (this.results) {
        setTimeout(() => this.renderCharts(), 0);
      }
    });
  }

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

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
        if (saved && saved.type === 'solaire') {
          this.appliances = saved.input_data.appliances || this.appliances;
          this.sunHours = saved.input_data.sunHours || this.sunHours;
          this.autonomyDays = saved.input_data.autonomyDays || this.autonomyDays;
          this.voltage = saved.input_data.voltage || this.voltage;
          this.panelPower = saved.input_data.panelPower || this.panelPower;
          this.results = saved.result_data;
          this.step = 3;
          setTimeout(() => this.renderCharts(), 500);
        }
      }
    });
  }

  // ===== Gestion appareils =====
  addAppliance() {
    this.appliances.push({ name: 'Nouvel appareil', power: 50, hours: 4, qty: 1 });
  }

  removeAppliance(index: number) {
    this.appliances.splice(index, 1);
  }

  get totalConsumption(): number {
    return this.appliances.reduce((sum, a) => sum + (a.power * a.hours * a.qty), 0);
  }

  // ===== Navigation =====
  goToStep(n: number) {
    this.step = n;
  }

  // ===== Sélection ville =====
  onCityChange() {
    if (!this.selectedCity) return;
    this.loadingPvgis = true;
    this.pvgis.getSolarData(this.selectedCity.lat, this.selectedCity.lon).subscribe({
      next: (data) => {
        this.sunHours = data.sun_hours_per_day;
        this.pvgisStatus = data.source === 'PVGIS' ? 'official' : 'fallback';
        this.loadingPvgis = false;
      },
      error: () => {
        this.loadingPvgis = false;
        this.pvgisStatus = 'error';
      }
    });
  }

  // ===== CALCUL SOLAIRE =====
  calculateSolar() {
    const total = this.totalConsumption; // Wh/jour
    const lossFactor = 1.25;
    const DOD = 0.8;

    const dailyNeeded = total * lossFactor;
    const peakPower = dailyNeeded / this.sunHours; // Wc nécessaires
    const nPanels = Math.ceil(peakPower / this.panelPower);
    const actualPower = nPanels * this.panelPower;

    const battCapAh = (total * this.autonomyDays) / (DOD * this.voltage);
    const regCurrent = Math.ceil((actualPower / this.voltage) * 1.25);
    const maxLoad = total / 4;
    const inverterKva = Math.max(1, Math.ceil((maxLoad / 1000 * 1.3) * 10) / 10);

    // Types de panneaux
    const panelTypes = [
      { name: 'Panneau Monocristallin 300Wc', brand: 'JA Solar / Longi', price: 85000, eff: '21%', warranty: '25 ans', power: 300 },
      { name: 'Panneau Polycristallin 300Wc', brand: 'Yingli / Trina', price: 68000, eff: '18%', warranty: '25 ans', power: 300 },
      { name: 'Panneau Monocristallin 400Wc', brand: 'Canadian Solar', price: 110000, eff: '22%', warranty: '25 ans', power: 400 },
      { name: 'Panneau Bifacial 300Wc', brand: 'LONGi Hi-MO', price: 95000, eff: '22.5%', warranty: '30 ans', power: 300 },
      { name: 'Panneau Amorphe 200Wc', brand: 'Generic', price: 45000, eff: '12%', warranty: '10 ans', power: 200 },
      { name: 'Panneau Monocristallin PERC 500Wc', brand: 'Risen Energy', price: 135000, eff: '23%', warranty: '30 ans', power: 500 },
    ];

    const battTypes = [
      { name: 'Batterie AGM 200Ah/12V', brand: 'Exide / Solaris', price: 75000, cycles: '500', warranty: '3 ans', capacity: 200 },
      { name: 'Batterie GEL 200Ah/12V', brand: 'Victron / Banner', price: 95000, cycles: '800', warranty: '5 ans', capacity: 200 },
      { name: 'Batterie Lithium 100Ah/24V', brand: 'BYD / Pylontech', price: 185000, cycles: '3000', warranty: '10 ans', capacity: 100 },
      { name: 'Batterie AGM 150Ah/12V', brand: 'Ritar / Sonnenschein', price: 55000, cycles: '450', warranty: '2 ans', capacity: 150 },
    ];

    const recPanel = panelTypes[0];
    const recBatt = battTypes[0];
    const nBatt = Math.ceil(battCapAh / (recBatt.capacity * (24 / this.voltage)));

    const costPanels = nPanels * recPanel.price;
    const costBatt = nBatt * recBatt.price;
    const costReg = regCurrent <= 40 ? 25000 : regCurrent <= 60 ? 35000 : 55000;
    const costInv = inverterKva <= 1 ? 45000 : inverterKva <= 2 ? 75000 : 120000;
    const costInstall = (costPanels + costBatt + costReg + costInv) * 0.15;
    const costTotal = costPanels + costBatt + costReg + costInv + costInstall;

    // Options (6 types avec quantité nécessaire calculée pour chaque)
    const panelOptions = panelTypes.map((p, i) => ({
      ...p,
      qtyNeeded: Math.ceil(peakPower / p.power),
      recommended: i === 0
    }));

    const battOptions = battTypes.map((b, i) => ({
      ...b,
      recommended: i === 0
    }));

    // ===== CALCUL ROI =====
// Tarifs SOCADEL par tranches
const productionAnnuelle = (actualPower * this.sunHours * 365) / 1000; // kWh/an
const consommationMensuelle = productionAnnuelle / 12;

const calculerFactureSocdel = (kwh: number): number => {
  if (kwh <= 110) return kwh * 50;
  if (kwh <= 400) return (110 * 50) + ((kwh - 110) * 79);
  return (110 * 50) + (290 * 79) + ((kwh - 400) * 96); // 96 = moyenne 94-99
};

const factureMensuelleAvant = calculerFactureSocdel(consommationMensuelle);
const economieAnnuelle = Math.round(factureMensuelleAvant * 12);
const tarifKwh = Math.round(economieAnnuelle / productionAnnuelle); // tarif moyen
const coutTotal = Math.round(costPanels + costBatt + costReg + costInv + costInstall);
const paybackYears = Math.round((coutTotal / economieAnnuelle) * 10) / 10;
const benefice20ans = Math.round((economieAnnuelle * 20) - coutTotal);
const benefice25ans = Math.round((economieAnnuelle * 25) - coutTotal);
const roi20ans = Math.round(((benefice20ans / coutTotal) * 100));

this.results = {
  total,
  nPanels,
  actualPower,
  panelPower: this.panelPower,
  battCapAh: Math.round(battCapAh),
  nBatt,
  regCurrent,
  inverterKva,
  sunHours: this.sunHours,
  autonomyDays: this.autonomyDays,
  voltage: this.voltage,
  city: this.selectedCity?.name || this.t('Non spécifiée', 'Not specified'),
  lat: this.selectedCity?.lat,
  lon: this.selectedCity?.lon,
  costPanels, costBatt, costReg, costInv,
  costInstall: Math.round(costInstall),
  costTotal: Math.round(costTotal),
  panelOptions,
  battOptions,
  // ROI
  roi: {
    productionAnnuelle: Math.round(productionAnnuelle),
    economieAnnuelle,
    paybackYears,
    benefice20ans,
    benefice25ans,
    roi20ans,
    tarifKwh,
    consommationMensuelle: Math.round(consommationMensuelle),
    factureMensuelle: Math.round(factureMensuelleAvant),
  }
};
   
    this.step = 3;
    this.saveProject();
    setTimeout(() => this.renderCharts(), 500);
  
    const prodCtx = document.getElementById('prodChart') as HTMLCanvasElement;
    if (prodCtx) {
      const months = this.chartMonths();
      // Variation saisonnière approximative de l'ensoleillement au Cameroun
      const seasonalFactors = [1.02, 1.08, 1.14, 1.10, 0.98, 0.94, 1.00, 1.04, 1.02, 0.98, 0.96, 1.00];
      const dailyProd = this.results.actualPower * this.results.sunHours / 1000; // kWh/jour de base

      const monthlyProd = seasonalFactors.map(f => Math.round(dailyProd * f * 30));

      this.prodChart = new Chart(prodCtx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: this.t('Production mensuelle estimée (kWh)', 'Estimated monthly production (kWh)'),
            data: monthlyProd,
            backgroundColor: 'rgba(245, 166, 35, 0.7)',
            borderColor: '#F5A623',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: this.t('Production Solaire Mensuelle Estimée', 'Estimated Monthly Solar Production') },
            legend: { display: false }
          },
          scales: {
            y: { title: { display: true, text: this.t('kWh/mois', 'kWh/month') } }
          }
        }
      });
    }
    
    const consoCtx = document.getElementById('consoChart') as HTMLCanvasElement;
    if (consoCtx) {
      
      this.consoChart?.destroy();
      this.consoChart = new Chart(consoCtx, {
        type: 'bar',
        data: {
          labels: this.appliances.map(a => a.name),
          datasets: [{
            label: this.t('Consommation journalière (Wh/jour)', 'Daily consumption (Wh/day)'),
            data: this.appliances.map(a => a.power * a.hours * a.qty),
            backgroundColor: [
              '#F5A623', '#27AE60', '#2980B9', '#9B59B6',
              '#E74C3C', '#1ABC9C', '#F39C12', '#8E44AD'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: this.t('Consommation par appareil (Wh/jour)', 'Consumption by appliance (Wh/day)') },
            legend: { display: false }
          },
          scales: {
            y: { title: { display: true, text: this.t('Wh/jour', 'Wh/day') } }
          }
        }
      });
    }
  }
  
    
   renderCharts() {
    if (!this.results) return;

    this.costChart?.destroy();
    this.prodChart?.destroy();
    this.consoChart?.destroy();

    const costCtx = document.getElementById('costChart') as HTMLCanvasElement;
    const prodCtx = document.getElementById('prodChart') as HTMLCanvasElement;
    const consoCtx = document.getElementById('consoChart') as HTMLCanvasElement;

    if (consoCtx) {
      this.consoChart = new Chart(consoCtx, {
        type: 'bar',
        data: {
          labels: this.appliances.map(a => a.name),
          datasets: [{
            label: this.t('Consommation journalière (Wh/jour)', 'Daily consumption (Wh/day)'),
            data: this.appliances.map(a => a.power * a.hours * a.qty),
            backgroundColor: ['#F5A623','#27AE60','#2980B9','#9B59B6','#E74C3C','#1ABC9C','#F39C12','#8E44AD'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: this.t('Consommation par appareil (Wh/jour)', 'Consumption by appliance (Wh/day)') },
            legend: { display: false }
          },
          scales: { y: { title: { display: true, text: this.t('Wh/jour', 'Wh/day') } } }
        }
      });
    }

    if (costCtx) {
      this.costChart = new Chart(costCtx, {
        type: 'doughnut',
        data: {
          labels: [
            this.t('Panneaux', 'Panels'),
            this.t('Batteries', 'Batteries'),
            this.t('Régulateur', 'Controller'),
            this.t('Onduleur', 'Inverter'),
            this.t('Installation', 'Installation')
          ],
          datasets: [{
            data: [
              this.results.costPanels,
              this.results.costBatt,
              this.results.costReg,
              this.results.costInv,
              this.results.costInstall
            ],
            backgroundColor: ['#F5A623','#27AE60','#2980B9','#9B59B6','#E74C3C']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: this.t('Répartition des Coûts (FCFA)', 'Cost Breakdown (FCFA)') },
            legend: { position: 'bottom' }
          }
        }
      });
    }

    if (prodCtx) {
      const months = this.chartMonths();
      const seasonalFactors = [1.02,1.08,1.14,1.10,0.98,0.94,1.00,1.04,1.02,0.98,0.96,1.00];
      const dailyProd = this.results.actualPower * this.results.sunHours / 1000;
      const monthlyProd = seasonalFactors.map(f => Math.round(dailyProd * f * 30));

      this.prodChart = new Chart(prodCtx, {
        type: 'bar',
        data: {
          labels: months,
          datasets: [{
            label: this.t('Production mensuelle estimée (kWh)', 'Estimated monthly production (kWh)'),
            data: monthlyProd,
            backgroundColor: 'rgba(245,166,35,0.7)',
            borderColor: '#F5A623',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            title: { display: true, text: this.t('Production Solaire Mensuelle Estimée', 'Estimated Monthly Solar Production') },
            legend: { display: false }
          },
          scales: { y: { title: { display: true, text: this.t('kWh/mois', 'kWh/month') } } }
        }
      });
    }
  }

  // ===== Sauvegarde automatique =====
  saveProject() {
    if (!this.results) return;
    this.saving = true;
    const project = {
      type: 'solaire' as const,
      name: `☀️ Projet Solaire – ${this.results.city}`,
      city: this.results.city,
      latitude: this.results.lat,
      longitude: this.results.lon,
      input_data: {
        appliances: this.appliances,
        sunHours: this.sunHours,
        autonomyDays: this.autonomyDays,
        voltage: this.voltage,
        panelPower: this.panelPower,
      },
      result_data: this.results,
      total_cost: this.results.costTotal,
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

  resetCalculator() {
    this.step = 1;
    this.results = null;
    this.saveStatus = '';
  }
  cityCompare(c1: City | null, c2: City | null): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2;
  }
 
  async exportWithCharts() {
    const el = document.getElementById('solarResultsSection');
    console.log('Element trouvé:', el);
    if (!el) {
      alert(this.t('Élément non trouvé ! Vérifiez que vous êtes bien à l\'étape 3.', 'Element not found! Make sure you are on step 3.'));
      return;
    }
    alert(this.t('Génération du PDF en cours... Veuillez patienter.', 'Generating PDF... Please wait.'));
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      await this.pdfService.exportToPDF('solarResultsSection', 'rapport-solaire-energiecam.pdf');
    } catch(e) {
      alert(this.t('Erreur PDF : ', 'PDF error: ') + e);
    }
  }

  private chartMonths(): string[] {
    return this.translateService.getCurrentLang() === 'fr'
      ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  }
}
