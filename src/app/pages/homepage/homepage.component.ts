import { Component, OnInit } from '@angular/core';
import { BannerSectionComponent } from '../../features/homepage/banner-section/banner-section.component';
import { CateogriesSectionComponent } from '../../features/homepage/cateogries-section/cateogries-section.component';
import { OffersSectionComponent } from '../../features/homepage/offers-section/offers-section.component';
import { EverydayCasualSectionComponent } from '../../features/homepage/everyday-casual-section/everyday-casual-section.component';
import { BrandsImageSectionComponent } from '../../features/homepage/brands-image-section/brands-image-section.component';
import { InstashopSectionComponent } from '../../features/homepage/instashop-section/instashop-section.component';
import { ProductService } from '../../services/product.service';
import { Category } from '../../model/Categories';
import { Product } from '../../model/Product';

@Component({
  selector: 'app-homepage',
  standalone: true,
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
export class HomepageComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  isLoadingCategories: boolean = true;
  isLoadingProducts: boolean = true;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.fetchCategoriesAPI();
    this.fetchProductsAPI();
  }

  fetchCategoriesAPI() {
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.result;
        this.isLoadingCategories = false;
      },
      error: () => {
        this.isLoadingCategories = false;
        this.categories = [];
      },
    });
  }

  fetchProductsAPI() {
    this.productService.getAllProductVariantsForClient().subscribe({
      next: (res) => {
        this.products = res.result.items;
        console.log('PRODUCTS', this.products);
        this.isLoadingProducts = false;
      },
      error: () => {
        this.isLoadingProducts = false;
        this.products = [];
      },
    });
  }
}
