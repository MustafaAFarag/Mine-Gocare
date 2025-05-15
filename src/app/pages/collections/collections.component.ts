import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { FilterTabComponent } from '../../features/collections/filter-tab/filter-tab.component';
import { ProductService } from '../../services/product.service';
import { Product } from '../../model/Product';
import { getFullImageUrl } from '../../lib/utils';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { CartSidebarService } from '../../services/cart-sidebar.service';
import { CartItem } from '../../model/Cart';
import { Category as ApiCategory } from '../../model/Categories';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';
import { WishlistService } from '../../services/wishlist.service';
import { MessageService } from 'primeng/api';
import { CountryService } from '../../services/country.service';

import { Category, Brand, RatingOption } from '../../model/shared-interfaces';
import { Subject, takeUntil } from 'rxjs';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    FilterTabComponent,
    ProductCardComponent,
    LoadingComponent,
    ToastModule,
    TranslateModule,
  ],
  providers: [MessageService],

  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css'],
})
export class CollectionsComponent implements OnInit, OnDestroy {
  // Add a subject for cleanup
  private destroy$ = new Subject<void>();

  // Filter states
  showCategories: boolean = true;
  showBrands: boolean = true;
  showRatings: boolean = true;
  showPrice: boolean = true;
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
  selectedRatings: number[] = [];

  // Price filter properties
  absoluteMinPrice: number = 0;
  absoluteMaxPrice: number = 5000;
  currentMinPrice: number = 0;
  currentMaxPrice: number = 5000;
  currency: string = 'EGP';

  // Add ViewChild reference to the filter tab components (both mobile and desktop versions)
  @ViewChild(FilterTabComponent) filterTabComponent!: FilterTabComponent;

  // Add sortOrder as a class property
  sortOrder: string = 'price-asc';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 12; // Show 3 products per page for testing
  paginatedProducts: Product[] = [];
  totalPages: number = 1;

  // Properties for quick view
  isQuickViewOpen = false;
  activeQuickViewProduct: Product | null = null;

  constructor(
    private productService: ProductService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private cartService: CartService,
    private cartSidebarService: CartSidebarService,
    public languageService: LanguageService,
    private wishlistService: WishlistService,
    private messageService: MessageService,
    private translateService: TranslateService,
    private countryService: CountryService,
  ) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  checkScreenSize() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth < 1024;
    }
  }

  ngOnInit(): void {
    this.isLoading = true; // Page loading when initializing

    // Subscribe to country changes
    this.countryService.country$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Refetch products when country changes
        if (this.categories.length > 0) {
          this.fetchProductsAPI();
        }
      });

    // Subscribe to language changes specifically (not just direction)
    this.languageService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe((language) => {
        this.updateDisplayLanguage();

        // Force a refresh of the categories and brands based on new language
        if (this.categories.length > 0) {
          this.updateCategoryNames(this.categories, language);
        }

        if (this.brands.length > 0) {
          this.updateBrandNames();
        }
      });

    // Fetch categories first, as we need them to map names to IDs
    this.categoriesLoading = true;
    this.productService.getCategories().subscribe({
      next: (res) => {
        this.categories = this.transformCategories(res.result);
        this.categoriesLoading = false;

        // Now read URL parameters after categories are loaded
        this.processUrlParameters();
      },
      error: (error) => {
        console.error('Error Fetching categories', error);
        this.categoriesLoading = false;
        this.isLoading = false;
      },
    });
  }

  // Add method to clean up subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Method to update displayed names based on current language
  updateDisplayLanguage(): void {
    const currentLang = this.languageService.getCurrentLanguage();

    // Update category names
    this.updateCategoryNames(this.categories, currentLang);

    // Update brand names
    this.updateBrandNames();

    // Make a copy of the brands array to preserve selected state
    // and prevent the array from being reduced
    this.brands = [...this.brands];

    // Rebuild active filters in the current language
    this.rebuildActiveFilters();
  }

  // New method to explicitly update brand names
  private updateBrandNames(): void {
    const currentLang = this.languageService.getCurrentLanguage();
    const updatedBrands = [...this.brands]; // Create a copy to avoid reference issues

    updatedBrands.forEach((brand) => {
      if (brand.en && brand.ar) {
        brand.name = currentLang === 'ar' ? brand.ar : brand.en;
      }
    });

    // Reassign the array to trigger change detection
    this.brands = updatedBrands;
  }

  // Recursive helper to update category names at all levels
  private updateCategoryNames(
    categories: Category[],
    currentLang: string,
  ): void {
    if (!categories) return;

    categories.forEach((category) => {
      // Update name based on current language
      category.name = currentLang === 'ar' ? category.nameAr : category.nameEn;

      // Update subcategories if any
      if (category.subcategories && category.subcategories.length > 0) {
        this.updateCategoryNames(category.subcategories, currentLang);
      }
    });
  }

  // New method to process URL parameters
  private processUrlParameters(): void {
    // Get query parameters from URL
    this.route.queryParams.subscribe((params) => {
      // Reset filters before applying new ones from URL
      this.resetAllFilters(false); // false means don't update URL (to avoid circular updates)

      // Apply category filters from URL (names to IDs)
      if (params['category']) {
        const categoryNames = params['category'].split(',');
        this.selectedCategoryIds = this.getCategoryIdsFromNames(
          categoryNames,
          0,
        );

        // Update selected state in categories
        this.updateCategorySelectionState();
      }

      if (params['subcategory']) {
        const subCategoryNames = params['subcategory'].split(',');
        this.selectedSubCategoryIds = this.getCategoryIdsFromNames(
          subCategoryNames,
          1,
        );

        // Update selected state in subcategories
        this.updateCategorySelectionState();
      }

      if (params['subsubcategory']) {
        const subSubCategoryNames = params['subsubcategory'].split(',');
        this.selectedSubSubCategoryIds = this.getCategoryIdsFromNames(
          subSubCategoryNames,
          2,
        );

        // Update selected state in sub-subcategories
        this.updateCategorySelectionState();
      }

      // Apply brand filters from URL
      if (params['brand']) {
        this.selectedBrandNames = params['brand'].split(',');

        // Update selected state in brands
        this.updateBrandSelectionState();
      }

      // Apply rating filters from URL
      if (params['rating']) {
        this.selectedRatings = params['rating'].split(',').map(Number);
      }

      // Apply price filters from URL
      if (params['minPrice']) {
        this.currentMinPrice = Number(params['minPrice']);
      }

      if (params['maxPrice']) {
        this.currentMaxPrice = Number(params['maxPrice']);
      }

      // Apply sort order from URL
      if (params['sort']) {
        this.sortOrder = params['sort'];
      }

      // Apply view mode from URL
      if (
        params['viewMode'] &&
        ['grid2', 'grid3', 'grid4', 'list'].includes(params['viewMode'])
      ) {
        this.viewMode = params['viewMode'] as
          | 'grid2'
          | 'grid3'
          | 'grid4'
          | 'list';
      }

      // Apply pagination from URL if present
      if (params['page']) {
        this.currentPage = Number(params['page']);
      } else {
        this.currentPage = 1;
      }

      // Update active filters array for display
      this.rebuildActiveFilters();

      // Fetch products with applied filters
      this.fetchProductsAPI();
    });
  }

  // Helper to rebuild active filters array based on selected items
  private rebuildActiveFilters(): void {
    this.activeFilters = [];
    const currentLang = this.languageService.getCurrentLanguage();

    // Add category names to active filters
    for (const category of this.categories) {
      if (category.selected) {
        // Use the localized name based on current language
        this.activeFilters.push(category.name);
      }

      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.selected) {
            // Use the localized name based on current language
            this.activeFilters.push(subcategory.name);
          }

          if (subcategory.subcategories) {
            for (const subSubcategory of subcategory.subcategories) {
              if (subSubcategory.selected) {
                // Use the localized name based on current language
                this.activeFilters.push(subSubcategory.name);
              }
            }
          }
        }
      }
    }

    // Add brand names to active filters
    for (const brandName of this.selectedBrandNames) {
      // Find the brand object to get its localized name
      const brand = this.brands.find((b) => b.en === brandName);
      if (brand && brand.en) {
        const localizedBrandName =
          currentLang === 'ar' && brand.ar ? brand.ar : brand.en;
        if (!this.activeFilters.includes(localizedBrandName)) {
          this.activeFilters.push(localizedBrandName);
        }
      } else if (!this.activeFilters.includes(brandName)) {
        this.activeFilters.push(brandName);
      }
    }

    // Add ratings to active filters
    for (const rating of this.selectedRatings) {
      const ratingText = `${rating} rating`;
      if (!this.activeFilters.includes(ratingText)) {
        this.activeFilters.push(ratingText);
      }
    }

    // Add price filter if set
    if (
      this.currentMinPrice !== this.absoluteMinPrice ||
      this.currentMaxPrice !== this.absoluteMaxPrice
    ) {
      let priceFilterText;

      if (this.currentMaxPrice === this.absoluteMaxPrice) {
        priceFilterText = `Price: ${this.currentMinPrice}+ ${this.currency}`;
      } else {
        priceFilterText = `Price: ${this.currentMinPrice}-${this.currentMaxPrice} ${this.currency}`;
      }

      this.activeFilters.push(priceFilterText);
    }
  }

  // Update selected state in categories based on IDs
  private updateCategorySelectionState(): void {
    // Update top-level categories
    for (const category of this.categories) {
      if (category.id && this.selectedCategoryIds.includes(category.id)) {
        category.selected = true;
      }

      // Update subcategories
      if (category.subcategories) {
        for (const subcategory of category.subcategories) {
          if (
            subcategory.id &&
            this.selectedSubCategoryIds.includes(subcategory.id)
          ) {
            subcategory.selected = true;
          }

          // Update sub-subcategories
          if (subcategory.subcategories) {
            for (const subSubcategory of subcategory.subcategories) {
              if (
                subSubcategory.id &&
                this.selectedSubSubCategoryIds.includes(subSubcategory.id)
              ) {
                subSubcategory.selected = true;
              }
            }
          }
        }
      }
    }
  }

  // Update selected state in brands
  private updateBrandSelectionState(): void {
    for (const brand of this.brands) {
      if (brand.en && this.selectedBrandNames.includes(brand.en)) {
        brand.selected = true;
      }
    }
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
        this.products = res.result.items;

        if (this.selectedBrandNames.length > 0) {
          this.filteredProducts = this.products.filter((product) =>
            this.selectedBrandNames.includes(product.brand.en),
          );
        } else {
          this.filteredProducts = this.products;
        }

        this.extractBrandsFromProducts();

        // Apply the current sort order to the products
        this.applySortingToProducts();

        this.applyPagination();
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
        const currentLang = this.languageService.getCurrentLanguage();

        this.products.forEach((product) => {
          // Using the English name as key to avoid duplicates
          const brandKey = product.brand.en;
          if (!uniqueBrands.has(brandKey)) {
            uniqueBrands.set(brandKey, {
              name:
                product.brand.ar && currentLang === 'ar'
                  ? product.brand.ar
                  : product.brand.en,
              en: product.brand.en,
              ar: product.brand.ar || product.brand.en, // Fallback to English if Arabic not available
              id: uniqueBrands.size + 1, // Generate a simple numeric ID
              selected: this.selectedBrandNames.includes(product.brand.en), // Set selected state based on current filters
            });
          }
        });

        this.brands = Array.from(uniqueBrands.values());
      } else {
        // Update brand names based on current language
        this.updateBrandNames();
      }
    }
  }

  getFullImageUrl = getFullImageUrl;

  // Categories
  categories: Category[] = [];

  // Brands
  brands: Brand[] = [];

  // View mode (grid or list)
  viewMode: 'grid2' | 'grid3' | 'grid4' | 'list' = 'grid3';

  // Methods
  toggleFilter(section: 'categories' | 'brands' | 'ratings' | 'price'): void {
    if (section === 'categories') this.showCategories = !this.showCategories;
    if (section === 'brands') this.showBrands = !this.showBrands;
    if (section === 'ratings') this.showRatings = !this.showRatings;
    if (section === 'price') this.showPrice = !this.showPrice;
  }

  toggleCategory(category: Category): void {
    // Ensure category has nameEn and nameAr properties
    if (!category.nameEn && category.name) {
      category.nameEn = category.name;
    }
    if (!category.nameAr && category.name) {
      category.nameAr = category.name;
    }

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

    // Update URL parameters
    this.updateUrlParams();

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

    // Update URL parameters
    this.updateUrlParams();

    // Refresh products when brands change
    this.fetchProductsAPI();
  }

  removeFilter(filter: string): void {
    // If filter is empty string, this is a signal to rebuild active filters only
    // (used when changing language)
    if (filter === '') {
      this.rebuildActiveFilters();
      return;
    }

    this.activeFilters = this.activeFilters.filter((f) => f !== filter);
    const currentLang = this.languageService.getCurrentLanguage();

    // Find and update the category or subcategory selection
    for (const category of this.categories) {
      if (category.name === filter) {
        category.selected = false;
        if (category.id) {
          this.selectedCategoryIds = this.selectedCategoryIds.filter(
            (id) => id !== category.id,
          );
        }
        this.updateUrlParams();
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
            this.updateUrlParams();
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
                this.updateUrlParams();
                this.fetchProductsAPI();
                return;
              }
            }
          }
        }
      }
    }

    // Check brands - need to match by localized name
    for (const brand of this.brands) {
      const localizedBrandName =
        currentLang === 'ar' && brand.ar ? brand.ar : brand.en;
      if (localizedBrandName === filter && brand.en) {
        brand.selected = false;
        this.selectedBrandNames = this.selectedBrandNames.filter(
          (name) => name !== brand.en,
        );
        this.updateUrlParams();
        this.fetchProductsAPI();
        return;
      }
    }

    // Check ratings (format: "X rating")
    if (filter.endsWith(' rating')) {
      const ratingStr = filter.split(' ')[0];
      const ratingValue = parseInt(ratingStr, 10);

      if (!isNaN(ratingValue) && this.selectedRatings.includes(ratingValue)) {
        this.selectedRatings = this.selectedRatings.filter(
          (r) => r !== ratingValue,
        );

        // Update the UI in the filter tab component
        if (this.filterTabComponent) {
          const ratingOption = this.filterTabComponent.ratingOptions.find(
            (r) => r.value === ratingValue,
          );
          if (ratingOption) {
            ratingOption.selected = false;
          }
        }

        this.updateUrlParams();
        this.filterProductsByRating();
        return;
      }
    }

    // Check if it's a price filter
    if (filter.startsWith('Price:')) {
      // Reset price to default
      this.currentMinPrice = this.absoluteMinPrice;
      this.currentMaxPrice = this.absoluteMaxPrice;

      // Reset UI in filter component
      if (this.filterTabComponent) {
        this.filterTabComponent.priceRanges.forEach((range) => {
          range.selected = false;
        });
      }

      this.updateUrlParams();
      this.fetchProductsAPI();
      return;
    }
  }

  handleAllFiltersCleared(): void {
    this.clearAllFilters();
  }

  clearAllFilters(): void {
    // Use the resetAllFilters method we created earlier
    this.resetAllFilters(true);

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

    // Reset rating UI in the filterTabComponent if it exists
    if (this.filterTabComponent) {
      this.filterTabComponent.resetRatingCheckboxes();
    }

    this.fetchProductsAPI();
  }

  // Helper method to update URL parameters
  private updateUrlParams(shouldReplace: boolean = true): void {
    const queryParams: any = {};

    // Get category names from IDs and add to URL if selected
    if (this.selectedCategoryIds.length > 0) {
      const categoryNames = this.getCategoryNamesFromIds(
        this.selectedCategoryIds,
        0,
      );
      if (categoryNames.length > 0) {
        queryParams['category'] = categoryNames.join(',');
      }
    }

    if (this.selectedSubCategoryIds.length > 0) {
      const subCategoryNames = this.getCategoryNamesFromIds(
        this.selectedSubCategoryIds,
        1,
      );
      if (subCategoryNames.length > 0) {
        queryParams['subcategory'] = subCategoryNames.join(',');
      }
    }

    if (this.selectedSubSubCategoryIds.length > 0) {
      const subSubCategoryNames = this.getCategoryNamesFromIds(
        this.selectedSubSubCategoryIds,
        2,
      );
      if (subSubCategoryNames.length > 0) {
        queryParams['subsubcategory'] = subSubCategoryNames.join(',');
      }
    }

    // Add brands to URL if selected
    if (this.selectedBrandNames.length > 0) {
      queryParams['brand'] = this.selectedBrandNames.join(',');
    }

    // Add ratings to URL if selected
    if (this.selectedRatings.length > 0) {
      queryParams['rating'] = this.selectedRatings.join(',');
    }

    // Add price range to URL if not default
    if (this.currentMinPrice !== this.absoluteMinPrice) {
      queryParams['minPrice'] = this.currentMinPrice;
    }

    if (this.currentMaxPrice !== this.absoluteMaxPrice) {
      queryParams['maxPrice'] = this.currentMaxPrice;
    }

    // Add sort order to URL if set
    if (this.sortOrder) {
      queryParams['sort'] = this.sortOrder;
    }

    // Add pagination to URL
    queryParams['page'] = this.currentPage;

    // Add view mode to URL
    queryParams['viewMode'] = this.viewMode;

    // Update URL without triggering navigation
    const url = this.router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams,
      })
      .toString();

    this.location.replaceState(url);
  }

  // Helper method to get category names from IDs
  private getCategoryNamesFromIds(ids: number[], level: number): string[] {
    const names: string[] = [];

    if (level === 0) {
      // Top-level categories
      for (const id of ids) {
        const category = this.categories.find((cat) => cat.id === id);
        if (category) {
          names.push(encodeURIComponent(category.nameEn)); // Use English name for URL params
        }
      }
    } else if (level === 1) {
      // Subcategories (middle level)
      for (const id of ids) {
        for (const category of this.categories) {
          if (category.subcategories) {
            const subcategory = category.subcategories.find(
              (sub) => sub.id === id,
            );
            if (subcategory) {
              names.push(encodeURIComponent(subcategory.nameEn)); // Use English name for URL params
              break;
            }
          }
        }
      }
    } else if (level === 2) {
      // Sub-subcategories (lowest level)
      for (const id of ids) {
        for (const category of this.categories) {
          if (category.subcategories) {
            for (const subcategory of category.subcategories) {
              if (subcategory.subcategories) {
                const subSubcategory = subcategory.subcategories.find(
                  (subSub) => subSub.id === id,
                );
                if (subSubcategory) {
                  names.push(encodeURIComponent(subSubcategory.nameEn)); // Use English name for URL params
                  break;
                }
              }
            }
          }
        }
      }
    }

    return names;
  }

  // Helper method to get category IDs from names
  private getCategoryIdsFromNames(names: string[], level: number): number[] {
    const ids: number[] = [];
    const decodedNames = names.map((name) => decodeURIComponent(name));

    if (level === 0) {
      // Top-level categories
      for (const name of decodedNames) {
        const category = this.categories.find((cat) => cat.nameEn === name);
        if (category && category.id) {
          ids.push(category.id);
        }
      }
    } else if (level === 1) {
      // Subcategories (middle level)
      for (const name of decodedNames) {
        for (const category of this.categories) {
          if (category.subcategories) {
            const subcategory = category.subcategories.find(
              (sub) => sub.nameEn === name,
            );
            if (subcategory && subcategory.id) {
              ids.push(subcategory.id);
              break;
            }
          }
        }
      }
    } else if (level === 2) {
      // Sub-subcategories (lowest level)
      for (const name of decodedNames) {
        for (const category of this.categories) {
          if (category.subcategories) {
            for (const subcategory of category.subcategories) {
              if (subcategory.subcategories) {
                const subSubcategory = subcategory.subcategories.find(
                  (subSub) => subSub.nameEn === name,
                );
                if (subSubcategory && subSubcategory.id) {
                  ids.push(subSubcategory.id);
                  break;
                }
              }
            }
          }
        }
      }
    }

    return ids;
  }

  // Helper to reset all filters without necessarily updating URL (for initial load)
  resetAllFilters(updateUrl: boolean = true): void {
    this.activeFilters = [];
    this.selectedCategoryIds = [];
    this.selectedSubCategoryIds = [];
    this.selectedSubSubCategoryIds = [];
    this.selectedBrandNames = [];
    this.selectedRatings = [];
    this.currentMinPrice = this.absoluteMinPrice;
    this.currentMaxPrice = this.absoluteMaxPrice;

    // Only update URL if specified (to avoid circular updates)
    if (updateUrl) {
      this.updateUrlParams();
    }
  }

  setViewMode(mode: 'grid2' | 'grid3' | 'grid4' | 'list'): void {
    this.viewMode = mode;
    this.updateUrlParams();
  }

  // Methods for FilterTabComponent
  handleFilterToggled(
    section: 'categories' | 'brands' | 'ratings' | 'price',
  ): void {
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
      variantId: product.variantId,
      name: product.name.en,
      image: product.mainImageUrl,
      afterPrice: product.priceAfterDiscount,
      beforePrice: product.priceBeforeDiscount,
      quantity: 1,
    };

    this.cartService.addToCart(cartItem);
    this.cartSidebarService.openCart(); // Open the cart sidebar after adding the item
  }

  // Add to cart with toast notification
  addToCartWithToast(product: Product, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const cartItem: CartItem = {
      productId: product.productId,
      variantId: product.variantId,
      name: product.name,
      image: product.mainImageUrl,
      afterPrice: product.priceAfterDiscount,
      beforePrice: product.priceBeforeDiscount,
      quantity: 1,
      currency: product.currency.name,
    };

    this.cartService.addToCart(cartItem);
    this.cartSidebarService.openCart();
  }

  // Toggle wishlist with toast notification
  toggleWishlist(product: Product, event: Event): void {
    event.stopPropagation();

    if (this.isInWishlist(product)) {
      this.wishlistService.removeFromWishlist(
        product.productId,
        product.variantId,
      );
      this.messageService.add({
        severity: 'info',
        summary: this.translateService.instant(
          'wishlist.toast.removedFromWishlist.summary',
        ),
        detail: this.translateService.instant(
          'wishlist.toast.removedFromWishlist.detail',
          {
            name:
              this.languageService.getCurrentLanguage() === 'ar'
                ? product.name.ar
                : product.name.en,
          },
        ),
        life: 2000,
      });
    } else {
      const added = this.wishlistService.addToWishlist(product);
      if (added) {
        this.messageService.add({
          severity: 'success',
          summary: this.translateService.instant(
            'wishlist.toast.addedToWishlist.summary',
          ),
          detail: this.translateService.instant(
            'wishlist.toast.addedToWishlist.detail',
            {
              name:
                this.languageService.getCurrentLanguage() === 'ar'
                  ? product.name.ar
                  : product.name.en,
            },
          ),
          life: 2000,
        });
      }
    }
  }

  // Check if product is in wishlist
  isInWishlist(product: Product): boolean {
    return this.wishlistService.isInWishlist(
      product.productId,
      product.variantId,
    );
  }

  // Quick view handlers
  openQuickView(product: Product, event: Event): void {
    event.stopPropagation();
    this.activeQuickViewProduct = product;
    this.isQuickViewOpen = true;
  }

  closeQuickView(): void {
    this.isQuickViewOpen = false;
    this.activeQuickViewProduct = null;
  }

  // New methods for rating and price filters
  handleRatingToggled(rating: RatingOption): void {
    if (rating.selected) {
      // Add rating to the active filters
      const ratingText = `${rating.value} rating`;
      if (!this.activeFilters.includes(ratingText)) {
        this.activeFilters.push(ratingText);
      }

      if (!this.selectedRatings.includes(rating.value)) {
        this.selectedRatings.push(rating.value);
      }
    } else {
      // Remove rating from the active filters
      const ratingText = `${rating.value} rating`;
      this.activeFilters = this.activeFilters.filter(
        (filter) => filter !== ratingText,
      );

      this.selectedRatings = this.selectedRatings.filter(
        (r) => r !== rating.value,
      );
    }

    // Update URL parameters
    this.updateUrlParams();

    this.filterProductsByRating();
  }

  filterProductsByRating(): void {
    if (this.selectedRatings.length === 0) {
      // No rating filter, reset to all products filtered by other criteria
      this.fetchProductsAPI();
      return;
    }

    // Find the minimum rating from selected ratings
    const minRating = Math.min(...this.selectedRatings);

    // Filter products by minimum rating
    this.filteredProducts = this.products.filter(
      (product) => product.rating >= minRating,
    );
    this.applyPagination();
  }

  handlePriceRangeChanged(priceRange: {
    min: number;
    max: number | null;
  }): void {
    this.currentMinPrice = priceRange.min;
    this.currentMaxPrice =
      priceRange.max !== null ? priceRange.max : this.absoluteMaxPrice;

    // Remove any existing price filter
    this.activeFilters = this.activeFilters.filter(
      (filter) => !filter.startsWith('Price:'),
    );

    // Only add the price filter to active filters if it's not the default range
    if (
      this.currentMinPrice !== this.absoluteMinPrice ||
      this.currentMaxPrice !== this.absoluteMaxPrice
    ) {
      // Add the new price filter
      let priceFilterText = '';
      if (priceRange.max === null) {
        priceFilterText = `Price: ${priceRange.min}+ ${this.currency}`;
      } else {
        priceFilterText = `Price: ${priceRange.min}-${priceRange.max} ${this.currency}`;
      }

      this.activeFilters.push(priceFilterText);
    }

    // Update URL parameters
    this.updateUrlParams();

    // Filter products by price
    this.filterProductsByPrice();
  }

  filterProductsByPrice(): void {
    this.filteredProducts = this.products.filter((product) => {
      const meetsMinPrice = product.priceAfterDiscount >= this.currentMinPrice;
      const meetsMaxPrice =
        this.currentMaxPrice === null ||
        product.priceAfterDiscount <= this.currentMaxPrice;
      return meetsMinPrice && meetsMaxPrice;
    });
    this.applyPagination();
  }

  // Update applySortOrder method
  applySortOrder(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.sortOrder = selectElement.value;

    // Update URL parameters
    this.updateUrlParams();

    // Apply sorting to the products
    this.applySortingToProducts();
    this.applyPagination();
  }

  // Transform API categories to our UI format
  transformCategories(apiCategories: ApiCategory[]): Category[] {
    if (apiCategories.length === 0) {
      return [];
    }

    const currentLang = this.languageService.getCurrentLanguage();

    // Process all categories from the API response
    return apiCategories.map((category) => ({
      name: currentLang === 'ar' ? category.name.ar : category.name.en,
      nameEn: category.name.en,
      nameAr: category.name.ar,
      selected: false,
      id: category.id,
      isParent: category.hasSubCategories,
      level: 0, // Top level category
      subcategories: category.subCategories?.map((subCat) => ({
        name: currentLang === 'ar' ? subCat.name.ar : subCat.name.en,
        nameEn: subCat.name.en,
        nameAr: subCat.name.ar,
        selected: false,
        id: subCat.id,
        isParent: subCat.hasSubCategories,
        level: 1, // Middle level category
        subcategories: subCat.subCategories?.map((subSubCat) => ({
          name: currentLang === 'ar' ? subSubCat.name.ar : subSubCat.name.en,
          nameEn: subSubCat.name.en,
          nameAr: subSubCat.name.ar,
          selected: false,
          id: subSubCat.id,
          level: 2, // Bottom level category,
        })),
      })),
    }));
  }

  // New method for pagination
  applyPagination(): void {
    // Calculate total pages
    this.totalPages = Math.ceil(
      this.filteredProducts.length / this.itemsPerPage,
    );

    // Make sure currentPage is within valid range
    if (this.currentPage < 1) this.currentPage = 1;
    if (this.currentPage > this.totalPages)
      this.currentPage = this.totalPages || 1;

    // Get paginated products
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(
      startIndex + this.itemsPerPage,
      this.filteredProducts.length,
    );
    this.paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
  }

  // Method to change page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyPagination();

      // Update URL with new page number
      const queryParams = {
        ...this.route.snapshot.queryParams,
        page: this.currentPage,
      };
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams,
        queryParamsHandling: 'merge',
      });
    }
  }

  // Helper method to generate page array for the pagination UI
  getPageArray(): any[] {
    // If there are 5 or fewer pages, show all pages
    if (this.totalPages <= 5) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    const pages = [];

    // Always show first page
    pages.push(1);

    // Current page is in first 3 pages
    if (this.currentPage <= 3) {
      pages.push(2, 3);
      // Add ellipsis if there are more pages after 3
      if (this.totalPages > 3) {
        pages.push({ ellipsis: true });
        // Add last page if it's not already included
        if (this.totalPages > 4) {
          pages.push(this.totalPages);
        }
      }
    }
    // Current page is in last 3 pages
    else if (this.currentPage >= this.totalPages - 2) {
      pages.push({ ellipsis: true });
      // Add the last three pages
      for (let i = this.totalPages - 2; i <= this.totalPages; i++) {
        if (i > 1) {
          // Avoid duplicate with first page
          pages.push(i);
        }
      }
    }
    // Current page is somewhere in the middle
    else {
      pages.push({ ellipsis: true });
      pages.push(this.currentPage - 1, this.currentPage, this.currentPage + 1);
      // Add ellipsis if there are more pages after current+1
      if (this.currentPage + 1 < this.totalPages) {
        pages.push({ ellipsis: true });
        pages.push(this.totalPages);
      }
    }

    return pages;
  }

  // Helper method to apply the current sort order to products
  private applySortingToProducts(): void {
    if (this.sortOrder === 'price-asc') {
      // Sort products by price ascending (low to high)
      this.filteredProducts = [...this.filteredProducts].sort(
        (a, b) => a.priceAfterDiscount - b.priceAfterDiscount,
      );
    } else if (this.sortOrder === 'price-desc') {
      // Sort products by price descending (high to low)
      this.filteredProducts = [...this.filteredProducts].sort(
        (a, b) => b.priceAfterDiscount - a.priceAfterDiscount,
      );
    }
  }
}
