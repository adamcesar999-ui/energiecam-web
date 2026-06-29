import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedTools } from './advanced-tools';

describe('AdvancedTools', () => {
  let component: AdvancedTools;
  let fixture: ComponentFixture<AdvancedTools>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdvancedTools],
    }).compileComponents();

    fixture = TestBed.createComponent(AdvancedTools);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
