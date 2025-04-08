import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CateogriesSectionComponent } from './cateogries-section.component';

describe('CateogriesSectionComponent', () => {
  let component: CateogriesSectionComponent;
  let fixture: ComponentFixture<CateogriesSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CateogriesSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CateogriesSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
