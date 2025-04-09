import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Category } from '../../model/Categories';
import { Product } from '../../model/Product';
import { BannerSectionComponent } from '../../features/homepage/banner-section/banner-section.component';
import { CateogriesSectionComponent } from '../../features/homepage/cateogries-section/cateogries-section.component';
import { OffersSectionComponent } from '../../features/homepage/offers-section/offers-section.component';
import { EverydayCasualSectionComponent } from '../../features/homepage/everyday-casual-section/everyday-casual-section.component';
import { BrandsImageSectionComponent } from '../../features/homepage/brands-image-section/brands-image-section.component';
import { InstashopSectionComponent } from '../../features/homepage/instashop-section/instashop-section.component';

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
  styleUrls: ['./homepage.component.css'],
})
export class HomepageComponent implements OnInit {
  categories: Category[] = [];
  products: Product[] = [];
  isLoadingCategories: boolean = true;
  isLoadingProducts: boolean = true;
  categoriesID: number[] = []; // Array to hold selected category IDs

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.fetchCategoriesAPI();
    this.fetchProductsAPI();
  }

  fetchCategoriesAPI() {
    console.log('Fetching categories...');
    this.productService.getCategories().subscribe({
      next: (res) => {
        console.log('Categories fetched:', res.result);
        this.categories = res.result;
        this.isLoadingCategories = false;
      },
      error: () => {
        console.error('Error fetching categories');
        this.isLoadingCategories = false;
        this.categories = [];
      },
    });
  }

  fetchProductsAPI() {
    console.log('Fetching products with categoriesID:', this.categoriesID);
    this.productService
      .getAllProductVariantsForClient({ categoryId: this.categoriesID })
      .subscribe({
        next: (res) => {
          console.log('Products fetched:', res.result.items);
          this.products = res.result.items;
          this.isLoadingProducts = false;
        },
        error: () => {
          console.error('Error fetching products');
          this.isLoadingProducts = false;
          this.products = [];
        },
      });
  }

  onCategorySelected(categoryId: number): void {
    console.log('Selected category:', categoryId);

    // Replace the current categoriesID with the selected category ID
    this.categoriesID = [categoryId]; // Only one category is selected at a time

    console.log('Updated categoriesID:', this.categoriesID);

    // Re-fetch products with the updated category ID
    this.fetchProductsAPI();
  }
}
