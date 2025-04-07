import { Component, OnInit } from '@angular/core';
import { BreadcrumbComponent } from '../../features/product-details/breadcrumb/breadcrumb.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../model/Employee';
import { environment } from '../../../enviroments/enviroment';
import { ProductInfoTabsComponent } from '../../features/product-details/product-info-tabs/product-info-tabs.component';
import { ProductImageGalleryComponent } from '../../features/product-details/product-image-gallery/product-image-gallery.component';
import { ProductInfoComponent } from '../../features/product-details/product-info/product-info.component';

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
  ],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  productDetails: Product;

  constructor(public productService: ProductService) {
    this.productDetails = {} as Product;
  }

  ngOnInit(): void {
    this.fetchProductDetailsAPI();
    console.log('Product Variants', this.productDetails.productVariants);
  }

  fetchProductDetailsAPI() {
    this.productService.getProductDetails().subscribe((response: any) => {
      this.productDetails = response.result;
      console.log('PRODUCT DETAILS', this.productDetails);
    });
  }
}
