import { Component } from '@angular/core';
import { BannerSectionComponent } from '../../features/homepage/banner-section/banner-section.component';
import { CateogriesSectionComponent } from '../../features/homepage/cateogries-section/cateogries-section.component';
import { OffersSectionComponent } from '../../features/homepage/offers-section/offers-section.component';
import { EverydayCasualSectionComponent } from '../../features/homepage/everyday-casual-section/everyday-casual-section.component';
import { BrandsImageSectionComponent } from '../../features/homepage/brands-image-section/brands-image-section.component';
import { InstashopSectionComponent } from '../../features/homepage/instashop-section/instashop-section.component';

@Component({
  selector: 'app-homepage',
  imports: [
    BannerSectionComponent,
    CateogriesSectionComponent,
    OffersSectionComponent,
    EverydayCasualSectionComponent,
    BrandsImageSectionComponent,
    InstashopSectionComponent,
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css',
})
export class HomepageComponent {}
