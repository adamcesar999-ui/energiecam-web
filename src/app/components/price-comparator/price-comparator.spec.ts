import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceComparator } from './price-comparator';

describe('PriceComparator', () => {
  let component: PriceComparator;
  let fixture: ComponentFixture<PriceComparator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceComparator],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceComparator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
