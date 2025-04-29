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

interface ProductImage {
  id: number;
  url: string;
  alt: string;
}

@Component({
  selector: 'app-quick-product-view-modal',
  imports: [CommonModule, FormsModule, QuickProductInfoComponent],
  templateUrl: './quick-product-view-modal.component.html',
  styleUrl: './quick-product-view-modal.component.css',
})
export class QuickProductViewModalComponent implements OnInit, OnChanges {
  @Input() isOpen: boolean = false;
  @Input() productId?: number;
  @Input() variantId?: number;
  @Output() closeModal = new EventEmitter<void>();
  productDetails!: ProductDetails;

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

  fetchProductDetails() {
    if (!this.productId || !this.variantId) return;
    this.productService
      .getProductDetails(this.productId, this.variantId)
      .subscribe((response) => {
        this.productDetails = response.result;
      });
  }

  getFullImageUrl = getFullImageUrl;
}
