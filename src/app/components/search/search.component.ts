import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { Product } from '../../model/Product';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { getFullImageUrl } from '../../lib/utils';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../model/Cart';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslateModule,
    LoadingComponent,
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css',
})
export class SearchComponent implements OnInit, OnDestroy {
  @Output() closeSearch = new EventEmitter<void>();

  searchTerm: string = '';
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading: boolean = false;
  private productSubscription: Subscription | null = null;

  constructor(
    private productService: ProductService,
    public translateService: TranslateService,
    private cartService: CartService,
  ) {}

  ngOnInit(): void {
    this.loadProducts();
    // Prevent body scrolling when search is open
    document.body.style.overflow = 'hidden';
  }

  getFullImageUrl = getFullImageUrl;

  ngOnDestroy(): void {
    if (this.productSubscription) {
      this.productSubscription.unsubscribe();
    }
    // Restore body scrolling when search is closed
    document.body.style.overflow = '';
  }

  loadProducts(): void {
    this.isLoading = true;
    this.productSubscription = this.productService
      .getAllProductVariantsForClient({
        pageSize: 100, // Load more products for better search results
      })
      .subscribe({
        next: (response) => {
          this.products = response.result.items;
          this.filteredProducts = this.products.slice(0, 5); // Show first 5 products by default
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading products:', error);
          this.isLoading = false;
        },
      });
  }

  onSearch(): void {
    if (!this.searchTerm.trim()) {
      this.filteredProducts = this.products.slice(0, 5);
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter((product) => {
      const nameEn = product.name.en.toLowerCase();
      const nameAr = product.name.ar.toLowerCase();
      return (
        nameEn.includes(searchTermLower) || nameAr.includes(searchTermLower)
      );
    });
  }

  addToCart(product: Product): void {
    if (!product) {
      console.error('Product is undefined');
      return;
    }

    const cartItem: CartItem = {
      productId: product.productId,
      variantId: product.variantId,
      name: product.name,
      image: product.mainImageUrl,
      afterPrice: product.priceAfterDiscount,
      beforePrice: product.priceBeforeDiscount,
      quantity: 1,
      currency: product.currency,
    };

    this.cartService.addToCart(cartItem);
  }

  addToWishlist(product: Product): void {
    // This will be implemented later
    console.log('Add to wishlist:', product);
  }

  closeSearchPanel(): void {
    this.closeSearch.emit();
  }

  // Prevent closing when clicking inside the search container
  @HostListener('click', ['$event'])
  onContainerClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (target.closest('.search-container')) {
      event.stopPropagation();
    }
  }
}
