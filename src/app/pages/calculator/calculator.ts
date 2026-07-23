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
import { CustomCityService, CustomCity } from '../../services/custom-city';
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
  isCustom?: boolean;
  customId?: number;
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
  cashFlowChart: Chart | null = null;  // nouveau graphique

  ngAfterViewInit() {}

  // ===== Données villes =====
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

  onRegionGroupChange() { this.selectedCity = null; }

  // ===== Étapes =====
  step = 1;

  // ===== Étape 1 : Appareils =====
  appliances: Appliance[] = [{ name: '', power: 0, hours: 0, qty: 0 }];

  // ===== Étape 2 : Localisation & paramètres =====
  sunHours: number = 5.1;
  loadingPvgis = false;
  pvgisStatus: 'official' | 'fallback' | 'error' | '' = '';
  autonomyDays: number | null = null;
  voltage = 24;
  panelPower: number | null = null;

  // === NOUVEAUX PARAMÈTRES FINANCIERS ===
  interestRate: number | null = null;
  inflationRate: number | null = null;
  maintenanceRate: number | null = null;
  degradationRate: number | null = null;
  loanRatio: number | null = 0;
  residualValue: number | null = null;

  // ===== Résultats =====
  results: any = null;
  saving = false;
  saveStatus: 'success' | 'error' | '' = '';

  // ===== Ajout ville personnalisée =====
  showAddCityForm = false;
  newCityName = '';
  newCityLat: number | null = null;
  newCityLon: number | null = null;
  newCityRegion: string | null = null;
  newCitySunHours: number | null = null;
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

  get battAhTooltip(): string {
    if (!this.results) return '';
    return this.t(
      `Capacité totale en ampères-heures (Ah) sous ${this.results.voltage}V. Cette valeur représente l'énergie stockée disponible pour couvrir ${this.results.autonomyDays} jour(s) d'autonomie.`,
      `Total capacity in amp-hours (Ah) at ${this.results.voltage}V. This value represents the stored electrical energy available to cover ${this.results.autonomyDays} day(s) of autonomy.`
    );
  }

  constructor(
    private pvgis: PvgisService,
    private projectService: ProjectService,
    private route: ActivatedRoute,
    private pdfService: PdfService,
    private customCityService: CustomCityService,
    public translateService: AppTranslateService
  ) {
    effect(() => {
      this.translateService.lang();
      if (this.results) {
        setTimeout(() => this.renderCharts(), 0);
      }
    });
  }

  t(fr: string, en: string): string { return this.translateService.t(fr, en); }

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

  // ===================================================
  // VALIDATIONS
  // ===================================================
  isConsumptionValid(): boolean {
    return this.appliances.some(app =>
      app.name && app.name.trim() !== '' &&
      app.power > 0 &&
      app.hours > 0 &&
      app.qty > 0
    );
  }

  isLocationValid(): boolean {
    return this.selectedRegionName !== null &&
           this.selectedCity !== null &&
           this.sunHours > 0 &&
           this.autonomyDays !== null &&
           this.autonomyDays > 0 &&
           this.panelPower !== null &&
           this.panelPower > 0 &&
           this.voltage !== null &&
           // Nouveaux champs obligatoires
           this.interestRate !== null && this.interestRate >= 0 &&
           this.inflationRate !== null && this.inflationRate >= 0 &&
           this.maintenanceRate !== null && this.maintenanceRate >= 0 &&
           this.degradationRate !== null && this.degradationRate >= 0 &&
           this.residualValue !== null && this.residualValue >= 0 &&
           this.loanRatio !== null && this.loanRatio >= 0 && this.loanRatio <= 100;
  }

  // ===================================================
  // TRANSITIONS ENTRE ONGLETS
  // ===================================================
  goToStep(n: number) {
    if (n > this.step) {
      if (this.step === 1 && n === 2) {
        if (!this.isConsumptionValid()) {
          alert(this.t(
            'Veuillez remplir au moins un appareil avec tous les champs valides (nom, puissance > 0, heures > 0, quantité > 0).',
            'Please fill at least one appliance with valid fields (name, power > 0, hours > 0, quantity > 0).'
          ));
          return;
        }
      }
      if (this.step === 2 && n === 3) {
        if (!this.isLocationValid()) {
          alert(this.t(
            'Veuillez remplir tous les champs de localisation, paramètres et paramètres financiers avant de calculer.',
            'Please fill all location, parameters and financial fields before calculating.'
          ));
          return;
        }
      }
    }
    this.step = n;
  }

  // ===== Gestion appareils =====
  addAppliance() {
    this.appliances.push({ name: '', power: 0, hours: 0, qty: 0 });
  }
  removeAppliance(index: number) {
    this.appliances.splice(index, 1);
  }
  get totalConsumption(): number {
    return this.appliances.reduce((sum, a) => sum + (a.power * a.hours * a.qty), 0);
  }

  // ===== Ajout ville personnalisée =====
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
      next: (data) => this.finalizeAddCity(regionGroup, data.sun_hours_per_day, data.source === 'PVGIS' ? 'official' : 'fallback'),
      error: () => this.finalizeAddCity(regionGroup, this.newCitySunHours ?? 5.0, 'error')
    });
  }

  private finalizeAddCity(regionGroup: { name: string; cities: string[] }, sunHours: number, status: 'official' | 'fallback' | 'error') {
    const finalSunHours = (this.newCitySunHours !== null && this.newCitySunHours > 0) ? this.newCitySunHours : sunHours;

    this.customCityService.create({
      name: this.newCityName,
      region: this.newCityRegion,
      latitude: this.newCityLat!,
      longitude: this.newCityLon!,
      sun_hours: finalSunHours,
      wind_speed: 3.0
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
        this.sunHours = finalSunHours;
        this.pvgisStatus = status;
        this.loadingPvgis = false;
        this.addCityStatus = 'added';
        this.newCityName = '';
        this.newCityRegion = null;
        this.newCityLat = null;
        this.newCityLon = null;
        this.newCitySunHours = null;
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
    if (!confirm(this.t(`Supprimer définitivement la ville "${city.name}" ? Elle sera retirée de tous les modules.`, `Permanently delete "${city.name}"? It will be removed from all modules.`))) return;
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

  cityCompare(c1: City | null, c2: City | null): boolean {
    return c1 && c2 ? c1.name === c2.name : c1 === c2;
  }

  // ===================================================
  // CALCUL SOLAIRE AVEC DÉGRADATION ET ROI AVANCÉ
  // ===================================================
  calculateSolar() {
    if (!this.isLocationValid()) {
      alert(this.t('Veuillez remplir tous les champs avant de calculer.', 'Please fill all fields before calculating.'));
      return;
    }

    const total = this.totalConsumption;
    const lossFactor = 1.25;
    const DOD = 0.8;

    const dailyNeeded = total * lossFactor;
    const peakPower = dailyNeeded / this.sunHours;
    const nPanels = Math.ceil(peakPower / this.panelPower!);
    const actualPower = nPanels * this.panelPower!;

    const battCapAh = (total * this.autonomyDays!) / (DOD * this.voltage);
    const regCurrent = Math.ceil((actualPower / this.voltage) * 1.25);
    const maxLoad = total / 4;
    const inverterKva = Math.max(1, Math.ceil((maxLoad / 1000 * 1.3) * 10) / 10);

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

    const panelOptions = panelTypes.map((p, i) => ({
      ...p,
      qtyNeeded: Math.ceil(peakPower / p.power),
      recommended: i === 0
    }));

    const battOptions = battTypes.map((b, i) => ({
      ...b,
      recommended: i === 0
    }));

    // ===== PRODUCTION ANNUELLE DE BASE (sans dégradation) =====
    const baseProduction = (actualPower * this.sunHours * 365) / 1000; // kWh/an

    // ===== CALCUL DES ÉCONOMIES =====
    const calculerFactureSocdel = (kwh: number): number => {
      if (kwh <= 110) return kwh * 50;
      if (kwh <= 400) return (110 * 50) + ((kwh - 110) * 79);
      return (110 * 50) + (290 * 79) + ((kwh - 400) * 96);
    };
    const consommationMensuelle = baseProduction / 12;
    const factureMensuelleAvant = calculerFactureSocdel(consommationMensuelle);
    const annualRevenue = Math.round(factureMensuelleAvant * 12); // économie brute annuelle

    // ===== PARAMÈTRES FINANCIERS =====
    const investment = costTotal;
    const maintenanceCost = (this.maintenanceRate! / 100) * investment;
    const netAnnualBenefit = annualRevenue - maintenanceCost;

    const inflation = this.inflationRate! / 100;
    const discountRate = this.interestRate! / 100;
    const degradation = this.degradationRate! / 100;
    const years = 20;

    // ===== CASH-FLOWS AVEC DÉGRADATION =====
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

    // ===== CALCUL DU TRI =====
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

    // ===== PAYBACK ACTUALISÉ =====
    let cumulative = -investment;
    let paybackYear = 0;
    for (let i = 0; i < discountedCashFlows.length; i++) {
      cumulative += discountedCashFlows[i];
      if (cumulative >= 0 && paybackYear === 0) {
        paybackYear = i + 1;
      }
    }
    const paybackDiscounted = paybackYear > 0 ? paybackYear : '>20';

    // ===== AUTRES INDICATEURS =====
    const loanAmount = (this.loanRatio! / 100) * investment;
    const totalInterest = loanAmount * discountRate * years;
    const residualValueAmount = (this.residualValue! / 100) * investment;
    const netProfit = van + residualValueAmount / Math.pow(1 + discountRate, years);
    const seuilRentabilite = investment / netAnnualBenefit;
    const paybackSimple = Math.round((investment / annualRevenue) * 10) / 10;
    const benefice20ans = Math.round((annualRevenue * 20) - investment - (maintenanceCost * 20));
    const roiSimple = Math.round((benefice20ans / investment) * 100);

    // ===== CONSTRUCTION DES RÉSULTATS =====
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
      roi: {
        productionAnnuelle: Math.round(baseProduction),
        economieAnnuelle: annualRevenue,
        paybackYears: paybackSimple,
        benefice20ans: benefice20ans,
        benefice25ans: Math.round((annualRevenue * 25) - investment - (maintenanceCost * 25)),
        roi20ans: roiSimple,
        tarifKwh: Math.round(annualRevenue / baseProduction),
        consommationMensuelle: Math.round(consommationMensuelle),
        factureMensuelle: Math.round(factureMensuelleAvant),
        // Nouveaux indicateurs avancés
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

    this.step = 3;
    this.saveProject();
    setTimeout(() => this.renderCharts(), 500);
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
        interestRate: this.interestRate,
        inflationRate: this.inflationRate,
        maintenanceRate: this.maintenanceRate,
        degradationRate: this.degradationRate,
        loanRatio: this.loanRatio,
        residualValue: this.residualValue
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

  async exportWithCharts() {
    const el = document.getElementById('solarResultsSection');
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

  // ===================================================
  // GRAPHIQUES
  // ===================================================
  renderCharts() {
    if (!this.results) return;

    this.costChart?.destroy();
    this.prodChart?.destroy();
    this.consoChart?.destroy();
    this.cashFlowChart?.destroy();

    const consoCtx = document.getElementById('consoChart') as HTMLCanvasElement;
    if (consoCtx) {
      this.consoChart = new Chart(consoCtx, {
        type: 'bar',
        data: {
          labels: this.appliances.map(a => a.name || 'Appareil'),
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

    const costCtx = document.getElementById('costChart') as HTMLCanvasElement;
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

    const prodCtx = document.getElementById('prodChart') as HTMLCanvasElement;
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

    // NOUVEAU GRAPHIQUE DES CASH-FLOWS
    const cashCtx = document.getElementById('cashFlowChart') as HTMLCanvasElement;
    if (cashCtx && this.results.roi.cashFlows) {
      const years = this.results.roi.cashFlows.map((_: any, i: number) => i + 1);
      const discounted = this.results.roi.discountedCashFlows;
      this.cashFlowChart = new Chart(cashCtx, {
        type: 'bar',
        data: {
          labels: years.map((y: number) => 'An ' + y),
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

  // ===== Initialisation =====
  ngOnInit() {
    this.loadCustomCities();

    this.route.queryParams.subscribe(params => {
      if (params['load']) {
        const saved = ProjectService.selectedProject;
        if (saved && saved.type === 'solaire') {
          this.appliances = saved.input_data.appliances || this.appliances;
          this.sunHours = saved.input_data.sunHours || this.sunHours;
          this.autonomyDays = saved.input_data.autonomyDays || null;
          this.voltage = saved.input_data.voltage || this.voltage;
          this.panelPower = saved.input_data.panelPower || null;
          this.interestRate = saved.input_data.interestRate || null;
          this.inflationRate = saved.input_data.inflationRate || null;
          this.maintenanceRate = saved.input_data.maintenanceRate || null;
          this.degradationRate = saved.input_data.degradationRate || null;
          this.loanRatio = saved.input_data.loanRatio || 0;
          this.residualValue = saved.input_data.residualValue || null;
          this.results = saved.result_data;
          this.step = 3;
          setTimeout(() => this.renderCharts(), 500);
        }
      }
    });
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
}