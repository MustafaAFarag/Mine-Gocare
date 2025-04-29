import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickProductImageComponent } from './quick-product-image.component';

describe('QuickProductImageComponent', () => {
  let component: QuickProductImageComponent;
  let fixture: ComponentFixture<QuickProductImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickProductImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickProductImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
