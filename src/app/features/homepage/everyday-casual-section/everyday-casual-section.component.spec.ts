import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EverydayCasualSectionComponent } from './everyday-casual-section.component';

describe('EverydayCasualSectionComponent', () => {
  let component: EverydayCasualSectionComponent;
  let fixture: ComponentFixture<EverydayCasualSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EverydayCasualSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EverydayCasualSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
