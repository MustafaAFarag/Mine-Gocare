import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { FilterTabComponent } from '../../features/collections/filter-tab/filter-tab.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../model/Product';
import { getFullImageUrl } from '../../lib/utils';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CartItem } from '../../model/Cart';

interface Category {
  name: string;
  selected: boolean;
}

interface Brand {
  name: string;
}

interface Color {
  name: string;
}

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    FilterTabComponent,
    ProductCardComponent,
    LoadingComponent,
  ],
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css'],
})
export class CollectionsComponent implements OnInit {
  // Filter states
  showCategories: boolean = true;
  showBrands: boolean = true;
  showColors: boolean = true;
  products: Product[] = [];
  isLoading: boolean = true;
  isMobile: boolean = false;
  showFilterSidebar: boolean = false;

  // Active filters
  activeFilters: string[] = ['Baby Essentials'];

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    this.isMobile = window.innerWidth < 1024;
  }

  ngOnInit(): void {
    this.fetchProductsAPI();
  }

  fetchProductsAPI() {
    this.isLoading = true;
    this.productService.getAllProductVariantsForClient().subscribe({
      next: (res) => {
        console.log('Products fetched:', res.result.items);
        this.products = res.result.items;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.isLoading = false;
      },
    });
  }

  getFullImageUrl = getFullImageUrl;

  // Categories
  categories: Category[] = [
    { name: 'Baby Essentials', selected: true },
    { name: 'Soft Toys', selected: false },
    { name: 'Clothes', selected: false },
    { name: 'Baby Toys', selected: false },
    { name: 'Baby Footwear', selected: false },
  ];

  // Brands
  brands: Brand[] = [
    { name: 'Aero Edge' },
    { name: 'Trail Blaze' },
    { name: 'Velocity Vibe' },
    { name: 'BeachBliss Surfboards' },
  ];

  // Colors
  colors: Color[] = [{ name: 'Burgundy' }, { name: 'Brown' }];

  // View mode (grid or list)
  viewMode: 'grid2' | 'grid3' | 'grid4' | 'list' = 'grid3';

  // Sort options
  sortOptions: string[] = [
    'Ascending Order',
    'Descending Order',
    'Price: Low to High',
    'Price: High to Low',
    'Newest First',
  ];
  selectedSort: string = 'Ascending Order';

  // Methods
  toggleFilter(section: 'categories' | 'brands' | 'colors'): void {
    if (section === 'categories') this.showCategories = !this.showCategories;
    if (section === 'brands') this.showBrands = !this.showBrands;
    if (section === 'colors') this.showColors = !this.showColors;
  }

  toggleCategory(category: Category): void {
    category.selected = !category.selected;

    if (category.selected && !this.activeFilters.includes(category.name)) {
      this.activeFilters.push(category.name);
    } else if (
      !category.selected &&
      this.activeFilters.includes(category.name)
    ) {
      this.activeFilters = this.activeFilters.filter(
        (filter) => filter !== category.name,
      );
    }
  }

  removeFilter(filter: string): void {
    this.activeFilters = this.activeFilters.filter((f) => f !== filter);

    // Also update the category selection
    const category = this.categories.find((c) => c.name === filter);
    if (category) {
      category.selected = false;
    }
  }

  clearAllFilters(): void {
    this.activeFilters = [];
    this.categories.forEach((category) => {
      category.selected = false;
    });
  }

  setViewMode(mode: 'grid2' | 'grid3' | 'grid4' | 'list'): void {
    this.viewMode = mode;
  }

  // Methods for FilterTabComponent
  handleFilterToggled(section: 'categories' | 'brands' | 'colors'): void {
    this.toggleFilter(section);
  }

  handleCategoryToggled(category: Category): void {
    this.toggleCategory(category);
  }

  handleFilterRemoved(filter: string): void {
    this.removeFilter(filter);
  }

  handleAllFiltersCleared(): void {
    this.clearAllFilters();
  }

  toggleFilterSidebar(): void {
    this.showFilterSidebar = !this.showFilterSidebar;
  }

  closeFilterSidebar(): void {
    this.showFilterSidebar = false;
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
}
