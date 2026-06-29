import { TestBed } from '@angular/core/testing';

import { Pvgis } from './pvgis';

describe('Pvgis', () => {
  let service: Pvgis;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Pvgis);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
