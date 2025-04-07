import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductInfoTabsComponent } from './product-info-tabs.component';

describe('ProductInfoTabsComponent', () => {
  let component: ProductInfoTabsComponent;
  let fixture: ComponentFixture<ProductInfoTabsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductInfoTabsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductInfoTabsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
