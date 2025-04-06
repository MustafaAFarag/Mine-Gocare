import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NavbarBannerComponent } from './navbar-banner.component';

describe('NavbarBannerComponent', () => {
  let component: NavbarBannerComponent;
  let fixture: ComponentFixture<NavbarBannerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavbarBannerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavbarBannerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
