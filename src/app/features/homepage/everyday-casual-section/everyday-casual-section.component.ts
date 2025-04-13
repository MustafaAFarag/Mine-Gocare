import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { Category } from '../../../model/Categories';
import { Product } from '../../../model/Product';
import { ChangeDetectorRef } from '@angular/core';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroment';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart.service';
import { CartItem } from '../../../model/Cart';
import { CartSidebarService } from '../../../services/cart-sidebar.service';

@Component({
  selector: 'app-everyday-casual-section',
  standalone: true,
  imports: [LoadingComponent, CommonModule],
  templateUrl: './everyday-casual-section.component.html',
  styleUrls: ['./everyday-casual-section.component.css'],
})
export class EverydayCasualSectionComponent {
  @Input() categories: Category[] = [];
  @Input() products: Product[] = [];
  @Input() isLoadingProducts!: boolean;
  @Input() selectedCategory: any;

  @Output() categorySelected = new EventEmitter<number>(); // Emit category ID when clicked

  constructor(
    private cdr: ChangeDetectorRef,
    private router: Router,
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
  ) {}

  onCategoryClick(categoryId: number): void {
    console.log('clicked');

    this.categorySelected.emit(categoryId); // Emit the selected category's ID
  }

  navigateToProductDetails(productId: number, variantId: number): void {
    this.router.navigate([`/product-details/${productId}/${variantId}`]);
  }

  addToCart(product: Product): void {
    const cartItem: CartItem = {
      productId: product.productId,
      name: product.name.en,
      image: product.mainImageUrl,
      afterPrice: product.priceAfterDiscount,
      beforePrice: product.priceBeforeDiscount,
      quantity: 1,
    };

    this.cartService.addToCart(cartItem);
    this.cartSidebarService.openCart(); // Open the cart sidebar after adding the item
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      console.log('Products changed:', this.products);
      this.cdr.detectChanges();
    }
  }

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.png';
    return `${environment.apiUrl}/Attachments${relativePath.replace(/\\/g, '/')}`;
  }
}
