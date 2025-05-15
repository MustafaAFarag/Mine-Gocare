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
  selectedCategory: Category | null = null; // Track the selected category

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.fetchCategoriesAPI();
  }

  fetchCategoriesAPI() {
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories = res.result;
        this.isLoadingCategories = false;

        // Set the first category as the default selected category
        if (this.categories.length > 0) {
          this.selectedCategory = this.categories[0];
          this.categoriesID = [this.selectedCategory.id];
          this.fetchProductsAPI(); // Fetch products for the default selected category
        }
      },
      error: () => {
        console.error('Error fetching categories');
        this.isLoadingCategories = false;
        this.categories = [];
      },
    });
  }

  fetchProductsAPI() {
    this.productService
      .getAllProductVariantsForClient({
        categoryId: this.categoriesID,
        pageNumber: 1,
        pageSize: 9,
      })
      .subscribe({
        next: (res) => {
          this.products = res.result.items;
          this.isLoadingProducts = false;
        },
        error: () => {
          this.isLoadingProducts = false;
          this.products = [];
        },
      });
  }

  onCategorySelected(categoryId: number): void {
    // Replace the current categoriesID with the selected category ID
    this.categoriesID = [categoryId]; // Only one category is selected at a time

    // Find the selected category object from the categories array
    this.selectedCategory =
      this.categories.find((category) => category.id === categoryId) || null;

    // Re-fetch products with the updated category ID
    this.fetchProductsAPI();
  }
}
