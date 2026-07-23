import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Advertise } from './advertise';

describe('Advertise', () => {
  let component: Advertise;
  let fixture: ComponentFixture<Advertise>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Advertise],
    }).compileComponents();

    fixture = TestBed.createComponent(Advertise);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
