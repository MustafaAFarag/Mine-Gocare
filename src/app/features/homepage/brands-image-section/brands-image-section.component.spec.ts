import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandsImageSectionComponent } from './brands-image-section.component';

describe('BrandsImageSectionComponent', () => {
  let component: BrandsImageSectionComponent;
  let fixture: ComponentFixture<BrandsImageSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandsImageSectionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrandsImageSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
