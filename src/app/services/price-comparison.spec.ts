import { TestBed } from '@angular/core/testing';

import { PriceComparison } from './price-comparison';

describe('PriceComparison', () => {
  let service: PriceComparison;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PriceComparison);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
