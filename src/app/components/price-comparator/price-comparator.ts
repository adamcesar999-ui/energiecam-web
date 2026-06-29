import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { PriceComparisonService } from '../../services/price-comparison';
import { AppTranslateService } from '../../services/translate';

@Component({
  selector: 'app-price-comparator',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './price-comparator.html',
  styleUrls: ['./price-comparator.css']
})
export class PriceComparatorComponent implements OnInit {
  types: string[] = [];
  cities: string[] = [];
  selectedType: string = '';
  selectedCity: string = '';
  results: any = null;
  loading: boolean = false;

  constructor(
    private priceService: PriceComparisonService,
    private router: Router,
    public translateService: AppTranslateService
  ) {}

  t(fr: string, en: string): string {
    return this.translateService.t(fr, en);
  }

  ngOnInit(): void {
    this.priceService.getTypes().subscribe(t => this.types = t);
    this.priceService.getCities().subscribe(c => this.cities = c);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  compare(): void {
    if (!this.selectedType) return;
    this.loading = true;
    this.priceService.comparePrices(this.selectedType).subscribe({
      next: (data) => {
        this.results = data;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  formatType(type: string): string {
    const labels: any = {
      panneau_solaire: '☀️ ' + this.t('Panneau Solaire', 'Solar Panel'),
      batterie: '🔋 ' + this.t('Batterie', 'Battery'),
      regulateur: '⚡ ' + this.t('Régulateur', 'Regulator'),
      onduleur: '🔌 ' + this.t('Onduleur', 'Inverter'),
      eolienne: '💨 ' + this.t('Éolienne', 'Wind Turbine'),
    };
    return labels[type] || type;
  }
}
