import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';
import { Calculator } from './calculator';
import { PvgisService } from '../../services/pvgis';
import { ProjectService } from '../../services/project';
import { PdfService } from '../../services/pdf';
import { CustomCityService } from '../../services/custom-city';
import { AppTranslateService } from '../../services/translate';

class MockPvgisService {
  getSolarData(lat: number, lon: number) {
    return of({ sun_hours_per_day: 5.2, source: 'PVGIS' });
  }
}
class MockProjectService {
  create(project: any) { return of({ id: 1, ...project }); }
  static selectedProject: any = null;
}
class MockPdfService {
  exportToPDF(elementId: string, filename: string) { return Promise.resolve(); }
}
class MockCustomCityService {
  getAll() { return of([]); }
  create(data: any) { return of({ id: 1, ...data }); }
  delete(id: number) { return of({}); }
}
class MockAppTranslateService {
  currentLang = 'fr';
  getCurrentLang() { return 'fr'; }
  lang() { return 'fr'; }
  t(fr: string, en: string) { return fr; }
}

describe('Calculator', () => {
  let component: Calculator;
  let fixture: ComponentFixture<Calculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, FormsModule, RouterLink, Calculator],
      providers: [
        { provide: PvgisService, useClass: MockPvgisService },
        { provide: ProjectService, useClass: MockProjectService },
        { provide: PdfService, useClass: MockPdfService },
        { provide: CustomCityService, useClass: MockCustomCityService },
        { provide: AppTranslateService, useClass: MockAppTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Calculator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default null values for financial parameters', () => {
    expect(component.interestRate).toBeNull();
    expect(component.inflationRate).toBeNull();
    expect(component.maintenanceRate).toBeNull();
    expect(component.degradationRate).toBeNull();
    expect(component.loanRatio).toBe(0);
    expect(component.residualValue).toBeNull();
  });

  it('should have a list of cities', () => {
    expect(component.cities.length).toBeGreaterThan(0);
    expect(component.cities.some((c: any) => c.name === 'Douala')).toBeTruthy();
  });

  it('should validate location correctly when all fields are filled', () => {
    expect(component.isLocationValid()).toBeFalsy();

    component.selectedRegionName = 'Littoral';
    component.selectedCity = component.cities.find((c: any) => c.name === 'Douala') || null;
    component.sunHours = 5.1;
    component.autonomyDays = 3;
    component.voltage = 24;
    component.panelPower = 300;
    component.interestRate = 5;
    component.inflationRate = 2;
    component.maintenanceRate = 1.5;
    component.degradationRate = 0.5;
    component.residualValue = 10;
    component.loanRatio = 0;

    expect(component.isLocationValid()).toBeTruthy();
  });

  it('should add and remove appliances', () => {
    const initialLength = component.appliances.length;
    component.addAppliance();
    expect(component.appliances.length).toBe(initialLength + 1);
    component.removeAppliance(initialLength);
    expect(component.appliances.length).toBe(initialLength);
  });

  it('should calculate total consumption correctly', () => {
    component.appliances = [
      { name: 'TV', power: 100, hours: 5, qty: 2 },
      { name: 'Lampe', power: 20, hours: 8, qty: 3 },
    ];
    expect(component.totalConsumption).toBe(100 * 5 * 2 + 20 * 8 * 3);
  });

  it('should call calculateSolar and produce results when valid', () => {
    component.selectedRegionName = 'Littoral';
    component.selectedCity = component.cities.find((c: any) => c.name === 'Douala') || null;
    component.sunHours = 5.1;
    component.autonomyDays = 3;
    component.voltage = 24;
    component.panelPower = 300;
    component.interestRate = 5;
    component.inflationRate = 2;
    component.maintenanceRate = 1.5;
    component.degradationRate = 0.5;
    component.residualValue = 10;
    component.loanRatio = 0;
    component.appliances = [{ name: 'TV', power: 100, hours: 5, qty: 2 }];

    (window as any).alert = () => {};
    component.calculateSolar();

    expect(component.results).toBeTruthy();
    expect(component.results.roi).toBeTruthy();
    expect(component.results.roi.van).toBeDefined();
    expect(component.results.roi.tri).toBeDefined();
    expect(component.results.roi.cashFlows).toBeDefined();
    expect(component.step).toBe(3);
  });

  it('should reset calculator properly', () => {
    component.results = { dummy: 'data' };
    component.step = 3;
    component.resetCalculator();
    expect(component.results).toBeNull();
    expect(component.step).toBe(1);
  });
});