import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { ProductDetails } from '../../model/ProductDetail';
import { getFullImageUrl } from '../../lib/utils';
import { QuickProductInfoComponent } from '../quick-product-info/quick-product-info.component';
import { QuickProductImageComponent } from '../quick-product-image/quick-product-image.component';
import { LoadingComponent } from '../../shared/loading/loading.component';

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

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Remove initial fetch - we'll only fetch when modal opens
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Only fetch product details when the modal is opened
    if (
      changes['isOpen'] &&
      changes['isOpen'].currentValue === true &&
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
          this.cdr.detectChanges(); // Manually trigger change detection
        },
        error: (error) => {
          console.error('Error fetching product details:', error);
          this.isLoading = false;
          this.cdr.detectChanges(); // Manually trigger change detection
        },
      });
  }

  getFullImageUrl = getFullImageUrl;
}
