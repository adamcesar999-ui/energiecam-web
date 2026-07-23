import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdModeration } from './ad-moderation';

describe('AdModeration', () => {
  let component: AdModeration;
  let fixture: ComponentFixture<AdModeration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdModeration],
    }).compileComponents();

    fixture = TestBed.createComponent(AdModeration);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
