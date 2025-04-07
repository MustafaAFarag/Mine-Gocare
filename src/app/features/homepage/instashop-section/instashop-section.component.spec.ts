import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InstashopSectionComponent } from './instashop-section.component';

describe('InstashopSectionComponent', () => {
  let component: InstashopSectionComponent;
  let fixture: ComponentFixture<InstashopSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstashopSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InstashopSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
