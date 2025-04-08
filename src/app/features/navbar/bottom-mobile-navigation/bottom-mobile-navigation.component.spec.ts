import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomMobileNavigationComponent } from './bottom-mobile-navigation.component';

describe('BottomMobileNavigationComponent', () => {
  let component: BottomMobileNavigationComponent;
  let fixture: ComponentFixture<BottomMobileNavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomMobileNavigationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomMobileNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
