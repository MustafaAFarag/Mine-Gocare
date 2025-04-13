import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CartNoProductsComponent } from './cart-no-products.component';

describe('CartNoProductsComponent', () => {
  let component: CartNoProductsComponent;
  let fixture: ComponentFixture<CartNoProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartNoProductsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CartNoProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
