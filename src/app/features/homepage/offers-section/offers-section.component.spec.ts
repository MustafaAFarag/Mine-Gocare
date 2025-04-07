import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OffersSectionComponent } from './offers-section.component';

describe('OffersSectionComponent', () => {
  let component: OffersSectionComponent;
  let fixture: ComponentFixture<OffersSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OffersSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OffersSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
