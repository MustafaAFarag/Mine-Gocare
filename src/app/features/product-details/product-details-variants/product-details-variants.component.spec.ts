import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductDetailsVariantsComponent } from './product-details-variants.component';

describe('ProductDetailsVariantsComponent', () => {
  let component: ProductDetailsVariantsComponent;
  let fixture: ComponentFixture<ProductDetailsVariantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductDetailsVariantsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsVariantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
