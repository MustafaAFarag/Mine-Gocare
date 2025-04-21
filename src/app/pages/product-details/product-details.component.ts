import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ProductInfoTabsComponent } from '../../features/product-details/product-info-tabs/product-info-tabs.component';
import { ProductImageGalleryComponent } from '../../features/product-details/product-image-gallery/product-image-gallery.component';
import { ProductInfoComponent } from '../../features/product-details/product-info/product-info.component';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { ProductDetails } from '../../model/ProductDetail';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-product-details',
  imports: [
    BreadcrumbComponent,
    CommonModule,
    FormsModule,
    RouterModule,
    ProductInfoTabsComponent,
    ProductImageGalleryComponent,
    ProductInfoComponent,
    LoadingComponent,
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  productDetails!: ProductDetails;
  isLoading: boolean = true;
  currentLanguage: string = 'en';

  constructor(
    public productService: ProductService,
    private route: ActivatedRoute,
    private languageService: LanguageService,
  ) {
    this.productDetails = {} as ProductDetails;
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const productId = params['productId'];
      const variantId = params['variantId'];
      console.log('Product ID:', productId);
      this.fetchProductDetailsAPI(productId, variantId);
    });

    // Subscribe to language changes
    this.languageService.language$.subscribe((lang) => {
      this.currentLanguage = lang;
    });
  }

  fetchProductDetailsAPI(productId: string, variantId: string) {
    this.productService
      .getProductDetails(productId, variantId)
      .subscribe((response: any) => {
        this.productDetails = response.result;
        this.isLoading = false;
        console.log('PRODUCT DETAILS', this.productDetails);
      });
  }

  getLocalizedProductName(): string {
    if (!this.productDetails || !this.productDetails.productName) {
      return '';
    }
    return this.currentLanguage === 'ar'
      ? this.productDetails.productName.ar
      : this.productDetails.productName.en;
  }
}
