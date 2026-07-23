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
  wind10: number;
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
  cashFlowChart: Chart | null = null;

  // ===== Données villes =====
  regions: Region[] = [
    { name: 'Yaoundé', wind10: 2.5 }, { name: 'Mbalmayo', wind10: 2.1 },
    { name: 'Obala', wind10: 2.3 }, { name: 'Mfou', wind10: 2.2 },
    { name: 'Akonolinga', wind10: 2.0 }, { name: 'Eséka', wind10: 2.1 },
    { name: 'Douala', wind10: 3.2 }, { name: 'Edéa', wind10: 2.8 },
    { name: 'Nkongsamba', wind10: 2.9 }, { name: 'Manjo', wind10: 2.7 },
    { name: 'Loum', wind10: 2.6 }, { name: 'Bafoussam', wind10: 3.0 },
    { name: 'Dschang', wind10: 3.3 }, { name: 'Mbouda', wind10: 3.4 },
    { name: 'Foumban', wind10: 3.1 }, { name: 'Bafang', wind10: 3.0 },
    { name: 'Bandjoun', wind10: 3.2 }, { name: 'Bamenda', wind10: 3.5 },
    { name: 'Kumbo', wind10: 3.8 }, { name: 'Wum', wind10: 3.6 },
    { name: 'Nkambe', wind10: 4.0 }, { name: 'Buea', wind10: 3.8 },
    { name: 'Limbe', wind10: 4.2 }, { name: 'Kumba', wind10: 2.9 },
    { name: 'Mamfe', wind10: 2.7 }, { name: 'Tiko', wind10: 3.9 },
    { name: 'Garoua', wind10: 4.1 }, { name: 'Guider', wind10: 4.0 },
    { name: 'Poli', wind10: 3.9 }, { name: 'Tcholliré', wind10: 4.2 },
    { name: 'Pitoa', wind10: 4.0 }, { name: 'Maroua', wind10: 4.5 },
    { name: 'Kousséri', wind10: 4.7 }, { name: 'Mokolo', wind10: 4.6 },
    { name: 'Yagoua', wind10: 4.4 }, { name: 'Kaélé', wind10: 4.3 },
    { name: 'Mora', wind10: 4.8 }, { name: 'Ngaoundéré', wind10: 4.8 },
    { name: 'Meiganga', wind10: 4.5 }, { name: 'Tibati', wind10: 4.0 },
    { name: 'Tignère', wind10: 4.9 }, { name: 'Bertoua', wind10: 2.2 },
    { name: 'Batouri', wind10: 2.0 }, { name: 'Yokadouma', wind10: 1.9 },
    { name: 'Abong-Mbang', wind10: 2.0 }, { name: 'Ebolowa', wind10: 2.0 },
    { name: 'Sangmélima', wind10: 1.8 }, { name: 'Kribi', wind10: 3.6 },
    { name: 'Ambam', wind10: 1.9 }
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
    { name: 'Sud', cities: ['Ebolowa','Sangmélima','Kribi','Ambam'] }
  ];

  selectedRegionName: string | null = null;
  selectedRegion: Region | null = null;

  get filteredRegions(): Region[] {
    if (!this.selectedRegionName) return [];
    const group = this.regionGroups.find(g => g.name === this.selectedRegionName);
    if (!group) return [];
    return this.regions.filter(r => group.cities.includes(r.name));
  }

  onRegionGroupChange() { this.selectedRegion = null; }

  // ===== Paramètres de concordance (TOUS à null par défaut) =====
  height: number | null = null;
  roughnessClass: number | null = null;
  useArticleData: boolean = false;
  kFactor: number | null = null;

  // ===== Paramètres de dimensionnement =====
  requiredPower: number | null = null;
  windSpeed: number | null = null;
  efficiency: number | null = null;
  airDensity: number | null = null;

  // ===== Paramètres financiers (TOUS à null sauf loanRatio) =====
  interestRate: number | null = null;
  inflationRate: number | null = null;
  maintenanceRate: number | null = null;
  loanRatio: number | null = 0;          // gardé car logique
  residualValue: number | null = null;
  degradationRate: number | null = null;

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
    if (!regionGroup) { this.addCityStatus = 'missing'; return; }
    if (regionGroup.cities.includes(this.newCityName)) { this.addCityStatus = 'missing'; return; }

    let windSpeed = this.newCityWind;
    if (windSpeed === null || windSpeed === undefined || isNaN(windSpeed) || windSpeed <= 0) {
      const existingCities = this.regions.filter(r => regionGroup.cities.includes(r.name));
      const avgWind = existingCities.reduce((sum, r) => sum + r.wind10, 0) / (existingCities.length || 1);
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
          wind10: saved.wind_speed ?? 3.0,
          lat: saved.latitude,
          lon: saved.longitude,
          isCustom: true,
          customId: saved.id
        };
        regionGroup.cities.push(newRegion.name);
        this.regions.push(newRegion);
        this.selectedRegion = newRegion;
        this.windSpeed = newRegion.wind10;
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

  t(fr: string, en: string): string { return this.translateService.t(fr, en); }

  get saveMessage(): string {
    if (this.saveStatus === 'success') return this.t('✅ Projet sauvegardé automatiquement dans "Mes Projets"', '✅ Project automatically saved in "My Projects"');
    if (this.saveStatus === 'error') return this.t('⚠️ Erreur lors de la sauvegarde.', '⚠️ Error while saving.');
    return '';
  }

  isFormValid(): boolean {
    return this.selectedRegion !== null &&
           this.requiredPower !== null && this.requiredPower > 0 &&
           this.windSpeed !== null && this.windSpeed > 0 &&
           this.efficiency !== null && this.efficiency > 0 && this.efficiency <= 100 &&
           this.airDensity !== null && this.airDensity > 0 &&
           this.height !== null && this.height > 0 &&
           this.roughnessClass !== null && this.roughnessClass >= 0 && this.roughnessClass <= 4 &&
           this.interestRate !== null && this.interestRate >= 0 &&
           this.inflationRate !== null && this.inflationRate >= 0 &&
           this.maintenanceRate !== null && this.maintenanceRate >= 0 &&
           this.loanRatio !== null && this.loanRatio >= 0 && this.loanRatio <= 100 &&
           this.residualValue !== null && this.residualValue >= 0 &&
           this.degradationRate !== null && this.degradationRate >= 0 && this.degradationRate <= 5;
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
          this.height = saved.input_data.height || null;
          this.roughnessClass = saved.input_data.roughnessClass || null;
          this.kFactor = saved.input_data.kFactor || null;
          this.useArticleData = saved.input_data.useArticleData || false;
          this.interestRate = saved.input_data.interestRate || null;
          this.inflationRate = saved.input_data.inflationRate || null;
          this.maintenanceRate = saved.input_data.maintenanceRate || null;
          this.loanRatio = saved.input_data.loanRatio || 0;
          this.residualValue = saved.input_data.residualValue || null;
          this.degradationRate = saved.input_data.degradationRate || null;
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
            wind10: c.wind_speed ?? 3.0,
            lat: c.latitude,
            lon: c.longitude,
            isCustom: true,
            customId: c.id
          };
          this.regions.push(region);
          const group = this.regionGroups.find(g => g.name === c.region);
          if (group && !group.cities.includes(c.name)) group.cities.push(c.name);
        });
      }
    });
  }

  onRegionChange() {
    if (this.selectedRegion) {
      this.windSpeed = this.selectedRegion.wind10;
      if (this.useArticleData && this.selectedRegion.name === 'Douala') {
        this.height = 138;
        this.roughnessClass = 0;
        this.windSpeed = 8.15;
      }
    }
  }

  regionCompare(r1: Region | null, r2: Region | null): boolean {
    return r1 && r2 ? r1.name === r2.name : r1 === r2;
  }

  // ===== Fonctions de calcul =====
  extrapolateWind(v10: number, targetHeight: number, roughnessClass: number): number {
    const alphaTable = [0.10, 0.15, 0.20, 0.30, 0.40];
    const alpha = alphaTable[roughnessClass] ?? 0.14;
    return v10 * Math.pow(targetHeight / 10, alpha);
  }

  weibullParams(vMean: number, k: number): { k: number, C: number } {
    const gamma = (x: number): number => {
      if (x === 1) return 1;
      if (x === 1.5) return 0.886226925;
      if (x === 2) return 1;
      const g = 7;
      const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
                 771.32342877765313, -176.61502916214059, 12.507343278686905,
                 -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
      if (x < 0.5) { return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x)); }
      x -= 1;
      let a = c[0];
      for (let i = 1; i < g + 2; i++) { a += c[i] / (x + i); }
      const t = x + g + 0.5;
      return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
    };
    const C = vMean / gamma(1 + 1/k);
    return { k, C };
  }

  meanCubeSpeed(vMean: number, k: number): number {
    const gamma = (x: number): number => {
      if (x === 1) return 1;
      if (x === 1.5) return 0.886226925;
      if (x === 2) return 1;
      const g = 7;
      const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028,
                 771.32342877765313, -176.61502916214059, 12.507343278686905,
                 -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
      if (x < 0.5) { return Math.PI / (Math.sin(Math.PI * x) * gamma(1 - x)); }
      x -= 1;
      let a = c[0];
      for (let i = 1; i < g + 2; i++) { a += c[i] / (x + i); }
      const t = x + g + 0.5;
      return Math.sqrt(2 * Math.PI) * Math.pow(t, x + 0.5) * Math.exp(-t) * a;
    };
    const gamma1 = gamma(1 + 1/k);
    const gamma3 = gamma(1 + 3/k);
    return Math.pow(vMean, 3) * gamma3 / Math.pow(gamma1, 3);
  }

  // ===== Calcul principal =====
  calculateWind() {
    if (!this.isFormValid()) {
      alert(this.t('Veuillez remplir tous les champs correctement.', 'Please fill all fields correctly.'));
      return;
    }

    const v10 = this.selectedRegion!.wind10;
    let vTarget: number;
    let powerDensity: number;
    let weibullK = this.kFactor!;
    let weibullC: number;
    let articleUsed = false;

    if (this.useArticleData && this.selectedRegion!.name === 'Douala') {
      this.height = 138;
      this.roughnessClass = 0;
      vTarget = 8.15;
      powerDensity = 749.78;
      const params = this.weibullParams(vTarget, this.kFactor!);
      weibullK = params.k;
      weibullC = params.C;
      articleUsed = true;
    } else {
      vTarget = this.extrapolateWind(v10, this.height!, this.roughnessClass!);
      const rho = this.airDensity!;
      powerDensity = 0.5 * rho * Math.pow(vTarget, 3);
      const params = this.weibullParams(vTarget, this.kFactor!);
      weibullK = params.k;
      weibullC = params.C;
    }

    this.windSpeed = vTarget;

    const Cp = this.efficiency! / 100;
    const rho = this.airDensity!;
    const P = this.requiredPower!;

    const A = P / (0.5 * rho * Math.pow(vTarget, 3) * Cp);
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

    const vCubeMean = this.meanCubeSpeed(vTarget, weibullK);
    const powerMean = 0.5 * rho * A * Cp * vCubeMean;
    const productionAnnuelle = (powerMean * 24 * 365) / 1000;

    // ===== CALCULS FINANCIERS AVANCÉS =====
    const investment = totalCost;
    const calculerFactureSocdel = (kwh: number): number => {
      if (kwh <= 110) return kwh * 50;
      if (kwh <= 400) return (110 * 50) + ((kwh - 110) * 79);
      return (110 * 50) + (290 * 79) + ((kwh - 400) * 96);
    };
    const consommationMensuelle = productionAnnuelle / 12;
    const factureMensuelle = calculerFactureSocdel(consommationMensuelle);
    const annualSavings = Math.round(factureMensuelle * 12);

    const maintenanceCost = (this.maintenanceRate! / 100) * investment;
    const netAnnualBenefit = annualSavings - maintenanceCost;

    const inflation = this.inflationRate! / 100;
    const discountRate = this.interestRate! / 100;
    const degradation = this.degradationRate! / 100;
    const years = 20;

    let cashFlows: number[] = [];
    let discountedCashFlows: number[] = [];
    let cumulativeDiscounted = -investment;

    for (let year = 1; year <= years; year++) {
      const degradationFactor = Math.pow(1 - degradation, year - 1);
      const inflationFactor = Math.pow(1 + inflation, year - 1);
      const adjustedBenefit = netAnnualBenefit * inflationFactor * degradationFactor;
      const discounted = adjustedBenefit / Math.pow(1 + discountRate, year);
      cashFlows.push(Math.round(adjustedBenefit));
      discountedCashFlows.push(Math.round(discounted));
      cumulativeDiscounted += discounted;
    }

    const van = cumulativeDiscounted;

    function calculateIRR(cashFlows: number[], investment: number, maxIter = 100): number {
      let guess = 0.05;
      let npv = 0;
      let npvDerivative = 0;
      for (let iter = 0; iter < maxIter; iter++) {
        npv = -investment;
        npvDerivative = 0;
        for (let t = 0; t < cashFlows.length; t++) {
          npv += cashFlows[t] / Math.pow(1 + guess, t + 1);
          npvDerivative -= (t + 1) * cashFlows[t] / Math.pow(1 + guess, t + 2);
        }
        if (Math.abs(npv) < 1) break;
        if (npvDerivative === 0) break;
        guess = guess - npv / npvDerivative;
        if (guess < -0.9) guess = 0.05;
        if (guess > 1) guess = 0.5;
      }
      return guess * 100;
    }

    const tri = calculateIRR(cashFlows, investment);

    let cumulative = -investment;
    let paybackYear = 0;
    for (let i = 0; i < discountedCashFlows.length; i++) {
      cumulative += discountedCashFlows[i];
      if (cumulative >= 0 && paybackYear === 0) {
        paybackYear = i + 1;
      }
    }
    const paybackDiscounted = paybackYear > 0 ? paybackYear : '>20';

    const loanAmount = (this.loanRatio! / 100) * investment;
    const totalInterest = loanAmount * discountRate * years;
    const residualValueAmount = (this.residualValue! / 100) * investment;
    const netProfit = van + residualValueAmount / Math.pow(1 + discountRate, years);
    const seuilRentabilite = investment / netAnnualBenefit;
    const paybackYears = Math.round((investment / annualSavings) * 10) / 10;
    const benefice20ans = Math.round((annualSavings * 20) - investment - (maintenanceCost * 20));
    const roi20ans = Math.round((benefice20ans / investment) * 100);

    this.results = {
      requiredPower: P,
      windSpeed: vTarget,
      windSpeed10: v10,
      height: this.height,
      roughnessClass: this.roughnessClass,
      powerDensity: powerDensity,
      weibullK: weibullK,
      weibullC: weibullC,
      vCubeMean: vCubeMean,
      articleUsed: articleUsed,
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
        economieAnnuelle: annualSavings,
        paybackYears: paybackYears,
        benefice20ans: benefice20ans,
        benefice25ans: Math.round((annualSavings * 25) - investment - (maintenanceCost * 25)),
        roi20ans: roi20ans,
        consommationMensuelle: Math.round(consommationMensuelle),
        factureMensuelle: Math.round(factureMensuelle),
        van: Math.round(van),
        tri: tri.toFixed(1) + '%',
        paybackDiscounted: paybackDiscounted,
        maintenanceCost: Math.round(maintenanceCost),
        netAnnualBenefit: Math.round(netAnnualBenefit),
        residualValue: Math.round(residualValueAmount),
        loanAmount: Math.round(loanAmount),
        totalInterest: Math.round(totalInterest),
        seuilRentabilite: seuilRentabilite.toFixed(1),
        cashFlows: cashFlows,
        discountedCashFlows: discountedCashFlows
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
        height: this.height!,
        roughnessClass: this.roughnessClass!,
        kFactor: this.kFactor!,
        useArticleData: this.useArticleData,
        interestRate: this.interestRate!,
        inflationRate: this.inflationRate!,
        maintenanceRate: this.maintenanceRate!,
        loanRatio: this.loanRatio!,
        residualValue: this.residualValue!,
        degradationRate: this.degradationRate!
      },
      result_data: this.results,
      total_cost: this.results.totalCost,
    };
    this.projectService.create(project).subscribe({
      next: () => { this.saving = false; this.saveStatus = 'success'; },
      error: () => { this.saving = false; this.saveStatus = 'error'; }
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
    this.cashFlowChart?.destroy();

    const windCtx = document.getElementById('windSpeedChart') as HTMLCanvasElement;
    if (windCtx) {
      const speeds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const A = parseFloat(this.results.A);
      const Cp = this.results.efficiency / 100;
      const rho = this.airDensity!;
      const powers = speeds.map(v => Math.round(0.5 * rho * A * Math.pow(v, 3) * Cp));
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

    const cashCtx = document.getElementById('cashFlowChart') as HTMLCanvasElement;
    if (cashCtx && this.results.roi.cashFlows) {
      const years = this.results.roi.cashFlows.map((_: any, i: number) => i + 1);
      const discounted = this.results.roi.discountedCashFlows;
      this.cashFlowChart = new Chart(cashCtx, {
        type: 'bar',
        data: {
          labels: years.map((y : number)=> 'An ' + y),
          datasets: [{
            label: this.t('Cash-flow actualisé (FCFA)', 'Discounted cash flow (FCFA)'),
            data: discounted,
            backgroundColor: discounted.map((v: number) => v >= 0 ? 'rgba(46, 204, 113, 0.7)' : 'rgba(231, 76, 60, 0.7)'),
            borderColor: discounted.map((v: number) => v >= 0 ? '#27ae60' : '#e74c3c'),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: this.t('Flux de trésorerie actualisés par année', 'Discounted cash flows per year') }
          },
          scales: {
            y: { title: { display: true, text: this.t('FCFA', 'FCFA') } },
            x: { title: { display: true, text: this.t('Année', 'Year') } }
          }
        }
      });
    }
  }
}