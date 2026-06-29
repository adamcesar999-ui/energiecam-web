import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WindCalculator } from './wind-calculator';

describe('WindCalculator', () => {
  let component: WindCalculator;
  let fixture: ComponentFixture<WindCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WindCalculator],
    }).compileComponents();

    fixture = TestBed.createComponent(WindCalculator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
