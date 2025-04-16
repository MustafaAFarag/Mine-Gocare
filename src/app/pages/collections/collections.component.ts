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
import { Category as ApiCategory } from '../../model/Categories';

interface Category {
  name: string;
  selected: boolean;
  subcategories?: Category[];
  isParent?: boolean;
  id?: number;
  level?: number;
}

interface Brand {
  name: string;
  id?: number;
  selected?: boolean;
  en?: string;
  ar?: string;
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
  filteredProducts: Product[] = [];
  isLoading: boolean = true;
  productsLoading: boolean = false;
  isMobile: boolean = false;
  showFilterSidebar: boolean = false;
  categoriesLoading: boolean = true;
  brandsLoading: boolean = false;

  // Active filters
  activeFilters: string[] = [];
  selectedCategoryIds: number[] = [];
  selectedSubCategoryIds: number[] = [];
  selectedSubSubCategoryIds: number[] = [];
  selectedBrandNames: string[] = [];

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
    this.isLoading = true; // Page loading when initializing
    this.fetchCategoriesAPI();
    this.fetchProductsAPI(); // This sets productsLoading internally
  }

  fetchCategoriesAPI() {
    this.categoriesLoading = true;
    this.productService.getCategories().subscribe({
      next: (res) => {
        console.log('Categories Fetched', res.result);
        this.categories = this.transformCategories(res.result);
        this.categoriesLoading = false;
      },
      error: (error) => {
        console.error('Error Fetching categories', error);
        this.categoriesLoading = false;
      },
    });
  }

  // Transform API categories to our UI format
  transformCategories(apiCategories: ApiCategory[]): Category[] {
    return apiCategories.map((cat) => ({
      name: cat.name.en,
      selected: false,
      id: cat.id,
      isParent: cat.hasSubCategories,
      level: 0, // Top level category
      subcategories: cat.subCategories?.map((subCat) => ({
        name: subCat.name.en,
        selected: false,
        id: subCat.id,
        isParent: subCat.hasSubCategories,
        level: 1, // Middle level category
        subcategories: subCat.subCategories?.map((subSubCat) => ({
          name: subSubCat.name.en,
          selected: false,
          id: subSubCat.id,
          level: 2, // Bottom level category
        })),
      })),
    }));
  }

  fetchProductsAPI() {
    this.productsLoading = true;
    const filters = {
      categoryId:
        this.selectedCategoryIds.length > 0
          ? this.selectedCategoryIds
          : undefined,
      subCategoryId:
        this.selectedSubCategoryIds.length > 0
          ? this.selectedSubCategoryIds
          : undefined,
      subSubCategoryId:
        this.selectedSubSubCategoryIds.length > 0
          ? this.selectedSubSubCategoryIds
          : undefined,
    };

    this.productService.getAllProductVariantsForClient(filters).subscribe({
      next: (res) => {
        console.log('Products fetched:', res.result.items);
        this.products = res.result.items;

        if (this.selectedBrandNames.length > 0) {
          this.filteredProducts = this.products.filter((product) =>
            this.selectedBrandNames.includes(product.brand.en),
          );
        } else {
          this.filteredProducts = this.products;
        }

        this.extractBrandsFromProducts();
        this.isLoading = false;
        this.productsLoading = false;
      },
      error: (err) => {
        console.error('Error fetching products:', err);
        this.isLoading = false;
        this.productsLoading = false;
      },
    });
  }

  // Extract available brands from products for the filter
  extractBrandsFromProducts() {
    if (!this.brandsLoading && this.products.length > 0) {
      // Only extract brands if we haven't already done it
      if (this.brands.length === 0) {
        const uniqueBrands = new Map();

        this.products.forEach((product) => {
          // Using the English name as key to avoid duplicates
          const brandKey = product.brand.en;
          if (!uniqueBrands.has(brandKey)) {
            uniqueBrands.set(brandKey, {
              name: product.brand.en,
              en: product.brand.en,
              ar: product.brand.ar,
              id: uniqueBrands.size + 1, // Generate a simple numeric ID
              selected: this.selectedBrandNames.includes(product.brand.en), // Set selected state based on current filters
            });
          }
        });

        this.brands = Array.from(uniqueBrands.values());
      } else {
        // Update existing brands selection status
        this.brands.forEach((brand) => {
          if (brand.en) {
            brand.selected = this.selectedBrandNames.includes(brand.en);
          }
        });
      }
    }
  }

  getFullImageUrl = getFullImageUrl;

  // Categories
  categories: Category[] = [];

  // Brands
  brands: Brand[] = [];

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

    if (category.selected) {
      if (!this.activeFilters.includes(category.name)) {
        this.activeFilters.push(category.name);
      }

      if (category.id) {
        // Handle different category levels
        if (category.level === 0) {
          // This is a top-level category
          if (!this.selectedCategoryIds.includes(category.id)) {
            this.selectedCategoryIds.push(category.id);
          }
        } else if (category.level === 1) {
          // This is a subcategory (middle level)
          if (!this.selectedSubCategoryIds.includes(category.id)) {
            this.selectedSubCategoryIds.push(category.id);
          }
        } else if (category.level === 2) {
          // This is a sub-subcategory (lowest level)
          if (!this.selectedSubSubCategoryIds.includes(category.id)) {
            this.selectedSubSubCategoryIds.push(category.id);
          }
        }
      }
    } else {
      this.activeFilters = this.activeFilters.filter(
        (filter) => filter !== category.name,
      );

      if (category.id) {
        // Handle different category levels for removal
        if (category.level === 0) {
          // This is a top-level category
          this.selectedCategoryIds = this.selectedCategoryIds.filter(
            (id) => id !== category.id,
          );
        } else if (category.level === 1) {
          // This is a subcategory (middle level)
          this.selectedSubCategoryIds = this.selectedSubCategoryIds.filter(
            (id) => id !== category.id,
          );
        } else if (category.level === 2) {
          // This is a sub-subcategory (lowest level)
          this.selectedSubSubCategoryIds =
            this.selectedSubSubCategoryIds.filter((id) => id !== category.id);
        }
      }
    }

    // Refresh products when categories change
    this.fetchProductsAPI();
  }

  toggleBrand(brand: Brand): void {
    brand.selected = !brand.selected;

    if (brand.selected) {
      if (!this.activeFilters.includes(brand.name)) {
        this.activeFilters.push(brand.name);
      }

      if (brand.en && !this.selectedBrandNames.includes(brand.en)) {
        this.selectedBrandNames.push(brand.en);
      }
    } else {
      this.activeFilters = this.activeFilters.filter(
        (filter) => filter !== brand.name,
      );

      if (brand.en) {
        this.selectedBrandNames = this.selectedBrandNames.filter(
          (name) => name !== brand.en,
        );
      }
    }

    // Refresh products when brands change
    this.fetchProductsAPI();
  }

  removeFilter(filter: string): void {
    this.activeFilters = this.activeFilters.filter((f) => f !== filter);

    // Find and update the category or subcategory selection
    for (const category of this.categories) {
      if (category.name === filter) {
        category.selected = false;
        if (category.id) {
          this.selectedCategoryIds = this.selectedCategoryIds.filter(
            (id) => id !== category.id,
          );
        }
        this.fetchProductsAPI();
        return;
      }

      // Check subcategories
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.name === filter) {
            subcategory.selected = false;
            if (subcategory.id) {
              this.selectedSubCategoryIds = this.selectedSubCategoryIds.filter(
                (id) => id !== subcategory.id,
              );
            }
            this.fetchProductsAPI();
            return;
          }

          // Check sub-subcategories if any
          if (subcategory.subcategories) {
            for (const subSubcategory of subcategory.subcategories) {
              if (subSubcategory.name === filter) {
                subSubcategory.selected = false;
                if (subSubcategory.id) {
                  this.selectedSubSubCategoryIds =
                    this.selectedSubSubCategoryIds.filter(
                      (id) => id !== subSubcategory.id,
                    );
                }
                this.fetchProductsAPI();
                return;
              }
            }
          }
        }
      }
    }

    // Check brands
    for (const brand of this.brands) {
      if (brand.name === filter) {
        brand.selected = false;
        if (brand.en) {
          this.selectedBrandNames = this.selectedBrandNames.filter(
            (name) => name !== brand.en,
          );
        }
        this.fetchProductsAPI();
        return;
      }
    }
  }

  clearAllFilters(): void {
    this.activeFilters = [];
    this.selectedCategoryIds = [];
    this.selectedSubCategoryIds = [];
    this.selectedSubSubCategoryIds = [];
    this.selectedBrandNames = [];

    // Deselect all categories and subcategories
    this.categories.forEach((category) => {
      category.selected = false;

      if (category.isParent && category.subcategories) {
        category.subcategories.forEach((sub) => {
          sub.selected = false;

          if (sub.isParent && sub.subcategories) {
            sub.subcategories.forEach((subSub) => {
              subSub.selected = false;
            });
          }
        });
      }
    });

    // Deselect all brands
    this.brands.forEach((brand) => {
      brand.selected = false;
    });

    this.fetchProductsAPI();
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

  handleBrandToggled(brand: Brand): void {
    this.toggleBrand(brand);
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
