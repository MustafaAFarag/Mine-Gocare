import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickProductInfoComponent } from './quick-product-info.component';

describe('QuickProductInfoComponent', () => {
  let component: QuickProductInfoComponent;
  let fixture: ComponentFixture<QuickProductInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickProductInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickProductInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
