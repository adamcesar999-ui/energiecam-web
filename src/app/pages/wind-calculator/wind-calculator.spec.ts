import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { WindCalculator } from './wind-calculator';
import { ProjectService } from '../../services/project';
import { CustomCityService } from '../../services/custom-city';
import { AppTranslateService } from '../../services/translate';

class MockProjectService {
  create(project: any) { return of({ id: 1, ...project }); }
  static selectedProject: any = null;
}
class MockCustomCityService {
  getAll() { return of([]); }
  create(data: any) { return of({ id: 1, ...data }); }
  delete(id: number) { return of({}); }
}
class MockAppTranslateService {
  currentLang = 'fr';
  lang() { return 'fr'; }
  t(fr: string, en: string) { return fr; }
}

describe('WindCalculator', () => {
  let component: WindCalculator;
  let fixture: ComponentFixture<WindCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, RouterLink, WindCalculator],
      providers: [
        { provide: ProjectService, useClass: MockProjectService },
        { provide: CustomCityService, useClass: MockCustomCityService },
        { provide: AppTranslateService, useClass: MockAppTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WindCalculator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default null values (no pre-filled numbers)', () => {
    expect(component.height).toBeNull();
    expect(component.roughnessClass).toBeNull();
    expect(component.kFactor).toBeNull();
    expect(component.interestRate).toBeNull();
    expect(component.inflationRate).toBeNull();
    expect(component.maintenanceRate).toBeNull();
    expect(component.residualValue).toBeNull();
    expect(component.degradationRate).toBeNull();
    expect(component.loanRatio).toBe(0); // seule valeur gardée
  });

  it('should apply article data for Douala when checkbox checked', () => {
    const douala = component.regions.find(r => r.name === 'Douala');
    if (douala) {
      component.selectedRegion = douala;
      component.useArticleData = true;
      component.onRegionChange();
      expect(component.height).toBe(138);
      expect(component.roughnessClass).toBe(0);
      expect(component.windSpeed).toBe(8.15);
    }
  });

  it('should validate form correctly with null values', () => {
    expect(component.isFormValid()).toBeFalse();

    // Remplir tous les champs
    component.selectedRegion = component.regions[0];
    component.requiredPower = 2000;
    component.windSpeed = 5;
    component.efficiency = 35;
    component.airDensity = 1.225;
    component.height = 30;
    component.roughnessClass = 2;
    component.interestRate = 5;
    component.inflationRate = 2;
    component.maintenanceRate = 1.5;
    component.loanRatio = 0;
    component.residualValue = 10;
    component.degradationRate = 0.5;
    component.kFactor = 2;

    expect(component.isFormValid()).toBeTrue();
  });

  it('should produce results when calculateWind is called', () => {
    component.selectedRegion = component.regions.find(r => r.name === 'Douala') || component.regions[0];
    component.requiredPower = 2000;
    component.windSpeed = 5;
    component.efficiency = 35;
    component.airDensity = 1.225;
    component.height = 30;
    component.roughnessClass = 2;
    component.interestRate = 5;
    component.inflationRate = 2;
    component.maintenanceRate = 1.5;
    component.loanRatio = 0;
    component.residualValue = 10;
    component.degradationRate = 0.5;
    component.kFactor = 2;
    component.onRegionChange();
    spyOn(window, 'alert');
    component.calculateWind();
    expect(component.results).toBeTruthy();
    expect(component.results.roi.van).toBeDefined();
    expect(component.results.roi.tri).toBeDefined();
    expect(component.results.roi.cashFlows).toBeDefined();
  });
});