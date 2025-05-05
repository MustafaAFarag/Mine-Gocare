import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ProductDetails } from '../../model/ProductDetail';
import { getFullImageUrl } from '../../lib/utils';
import { QuickProductInfoComponent } from '../quick-product-info/quick-product-info.component';
import { QuickProductImageComponent } from '../quick-product-image/quick-product-image.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

interface ProductImage {
  id: number;
  url: string;
  alt: string;
}

@Component({
  selector: 'app-quick-product-view-modal',
  imports: [
    CommonModule,
    FormsModule,
    QuickProductInfoComponent,
    QuickProductImageComponent,
    LoadingComponent,
  ],
  templateUrl: './quick-product-view-modal.component.html',
  styleUrl: './quick-product-view-modal.component.css',
})
export class QuickProductViewModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() productId?: number;
  @Input() variantId?: number;
  @Output() closeModal = new EventEmitter<void>();
  productDetails!: ProductDetails;
  isLoading: boolean = false;

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    if (this.productId && this.variantId) {
      this.fetchProductDetails();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['productId'] || changes['variantId']) &&
      this.productId &&
      this.variantId
    ) {
      this.fetchProductDetails();
    }
  }

  onClose() {
    this.closeModal.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.closeModal.emit();
    }
  }

  fetchProductDetails() {
    if (!this.productId || !this.variantId) return;
    this.isLoading = true;
    this.productService
      .getProductDetails(this.productId, this.variantId)
      .subscribe({
        next: (response) => {
          this.productDetails = response.result;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching product details:', error);
          this.isLoading = false;
        },
      });
  }

  getFullImageUrl = getFullImageUrl;
}
