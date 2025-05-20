import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';
import { CountryService } from '../../../services/country.service';
import {
  Category,
  Brand,
  RatingOption,
  PriceRange,
} from '../../../model/shared-interfaces';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './filter-tab.component.html',
  styleUrl: './filter-tab.component.css',
})
export class FilterTabComponent implements OnInit, OnDestroy {
  // Add destroy subject for cleanup
  private destroy$ = new Subject<void>();

  // Track current language to detect changes
  private currentLanguage: string = '';

  // Add expanded state tracking
  expandedCategories: Set<number> = new Set();
  expandedSubCategories: Set<number> = new Set();

  @Input() categories: Category[] = [];
  @Input() brands: Brand[] = [];
  @Input() activeFilters: string[] = [];
  @Input() showCategories: boolean = true;
  @Input() showBrands: boolean = true;
  @Input() showRatings: boolean = true;
  @Input() showPrice: boolean = true;
  @Input() isMobile: boolean = false;
  @Input() categoriesLoading: boolean = false;
  @Input() brandsLoading: boolean = false;

  // Price filter inputs
  @Input() absoluteMinPrice: number = 0;
  @Input() absoluteMaxPrice: number = 1000;
  @Input() currency: string = 'EGP';

  categorySearchTerm: string = '';
  brandSearchTerm: string = '';

  // Price filter properties
  currentMinPrice: number = 0;
  currentMaxPrice: number = 1000;
  minPrice: number = 0;
  maxPrice: number = 1000;

  // Predefined price ranges
  priceRanges: PriceRange[] = [
    { min: 0, max: 50, selected: false },
    { min: 50, max: 100, selected: false },
    { min: 100, max: 300, selected: false },
    { min: 300, max: null, selected: false },
  ];

  // Rating options
  ratingOptions: RatingOption[] = [
    { value: 5, selected: false },
    { value: 4, selected: false },
    { value: 3, selected: false },
    { value: 2, selected: false },
    { value: 1, selected: false },
  ];

  @Output() filterToggled = new EventEmitter<
    'categories' | 'brands' | 'ratings' | 'price'
  >();
  @Output() categoryToggled = new EventEmitter<Category>();
  @Output() brandToggled = new EventEmitter<Brand>();
  @Output() ratingToggled = new EventEmitter<RatingOption>();
  @Output() priceRangeChanged = new EventEmitter<{
    min: number;
    max: number | null;
  }>();
  @Output() filterRemoved = new EventEmitter<string>();
  @Output() allFiltersCleared = new EventEmitter<void>();
  @Output() closeFilterSidebar = new EventEmitter<void>();

  constructor(
    public languageService: LanguageService,
    private countryService: CountryService,
  ) {}

  ngOnInit(): void {
    // Store initial language
    this.currentLanguage = this.languageService.getCurrentLanguage();

    // Subscribe to language changes directly
    this.languageService.language$
      .pipe(takeUntil(this.destroy$))
      .subscribe((newLanguage) => {
        // Only force update if language actually changed
        if (this.currentLanguage !== newLanguage) {
          this.currentLanguage = newLanguage;

          // Store current expanded states
          const expandedStates = {
            categories: this.showCategories,
            brands: this.showBrands,
            ratings: this.showRatings,
            price: this.showPrice,
          };

          // Force template refresh by creating new array references
          // but don't mutate the actual data
          this.categories = [...this.categories];

          // Don't modify the brands array directly, as it may be reducing to a single brand
          // Just let the parent component rebuild active filters instead

          // Delay emitting an event to refresh the parent component's active filters
          // without causing filter sections to collapse
          setTimeout(() => {
            // Notify parent to rebuild active filters without toggling section visibility
            this.filterRemoved.emit('');

            // Restore expanded states
            this.showCategories = expandedStates.categories;
            this.showBrands = expandedStates.brands;
            this.showRatings = expandedStates.ratings;
            this.showPrice = expandedStates.price;
          }, 0);
        }
      });

    // Subscribe to country changes
    this.countryService.country$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        // Clear brand search term when country changes
        this.brandSearchTerm = '';

        // Notify parent to rebuild active filters
        this.filterRemoved.emit('');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleFilter(section: 'categories' | 'brands' | 'ratings' | 'price'): void {
    this.filterToggled.emit(section);
  }

  toggleCategory(category: Category): void {
    this.categoryToggled.emit(category);
  }

  toggleBrand(brand: Brand): void {
    this.brandToggled.emit(brand);
  }

  toggleRating(rating: RatingOption): void {
    rating.selected = !rating.selected;
    this.ratingToggled.emit(rating);
  }

  resetRatingCheckboxes(): void {
    // Reset all rating options to unselected
    this.ratingOptions.forEach((rating) => {
      rating.selected = false;
    });

    // Reset all price ranges to unselected
    this.priceRanges.forEach((range) => {
      range.selected = false;
    });
  }

  selectPriceRange(priceRange: PriceRange): void {
    // Deselect all other price ranges
    this.priceRanges.forEach((range) => {
      if (range !== priceRange) {
        range.selected = false;
      }
    });

    // Toggle the selected state of the clicked range
    priceRange.selected = !priceRange.selected;

    if (priceRange.selected) {
      // Emit the selected price range
      this.priceRangeChanged.emit({
        min: priceRange.min,
        max: priceRange.max,
      });
    } else {
      // If deselected, reset to full range but don't add to active filters
      this.priceRangeChanged.emit({
        min: this.absoluteMinPrice,
        max: this.absoluteMaxPrice,
      });
    }
  }

  updatePriceFilter(): void {
    // Ensure min doesn't exceed max
    if (this.currentMinPrice > this.currentMaxPrice) {
      this.currentMinPrice = this.currentMaxPrice;
    }

    this.minPrice = this.currentMinPrice;
    this.maxPrice = this.currentMaxPrice;
  }

  applyPriceFilter(): void {
    this.priceRangeChanged.emit({
      min: this.currentMinPrice,
      max: this.currentMaxPrice,
    });
  }

  removeFilter(filter: string): void {
    this.filterRemoved.emit(filter);
  }

  clearAllFilters(): void {
    this.allFiltersCleared.emit();
  }

  closeSidebar(): void {
    this.closeFilterSidebar.emit();
  }

  // Filter brands based on search term
  get filteredBrands(): Brand[] {
    if (!this.brandSearchTerm.trim()) {
      return this.brands;
    }

    const searchTerm = this.brandSearchTerm.toLowerCase();
    const currentLang = this.languageService.getCurrentLanguage();

    return this.brands.filter((brand) => {
      // Search either in Arabic or English name based on current language
      if (currentLang === 'ar' && brand.ar) {
        return (
          brand.ar.toLowerCase().includes(searchTerm) ||
          (brand.en ? brand.en.toLowerCase().includes(searchTerm) : false)
        );
      }
      return brand.en ? brand.en.toLowerCase().includes(searchTerm) : false;
    });
  }

  // Filter categories based on search term
  get filteredCategories(): Category[] {
    if (!this.categorySearchTerm.trim()) {
      return this.categories;
    }

    const searchTerm = this.categorySearchTerm.toLowerCase();
    const currentLang = this.languageService.getCurrentLanguage();

    return this.categories
      .map((category) => {
        // Check if main category matches (in current language or English)
        const categoryNameToSearch =
          currentLang === 'ar' ? category.nameAr : category.nameEn;
        const categoryMatches = categoryNameToSearch
          .toLowerCase()
          .includes(searchTerm);

        // If main category matches, return it with all subcategories
        if (categoryMatches) {
          return { ...category };
        }

        // If main category doesn't match, check subcategories
        if (category.subcategories && category.subcategories.length > 0) {
          const matchingSubcategories = category.subcategories
            .filter((sub) => {
              const subCategoryNameToSearch =
                currentLang === 'ar' ? sub.nameAr : sub.nameEn;
              return subCategoryNameToSearch.toLowerCase().includes(searchTerm);
            })
            .map((sub) => ({ ...sub }));

          // If there are matching subcategories, return category with only those subcategories
          if (matchingSubcategories.length > 0) {
            return {
              ...category,
              subcategories: matchingSubcategories,
            };
          }

          // If no direct subcategories match, check sub-subcategories
          const subcategoriesWithMatchingSubs = category.subcategories
            .map((sub) => {
              if (sub.subcategories && sub.subcategories.length > 0) {
                const matchingSubSubs = sub.subcategories.filter((subSub) => {
                  const subSubCategoryNameToSearch =
                    currentLang === 'ar' ? subSub.nameAr : subSub.nameEn;
                  return subSubCategoryNameToSearch
                    .toLowerCase()
                    .includes(searchTerm);
                });

                if (matchingSubSubs.length > 0) {
                  return {
                    ...sub,
                    subcategories: matchingSubSubs,
                  };
                }
              }
              return null;
            })
            .filter(Boolean);

          if (subcategoriesWithMatchingSubs.length > 0) {
            return {
              ...category,
              subcategories: subcategoriesWithMatchingSubs as Category[],
            };
          }
        }

        // If no matches in this category tree, return null
        return null;
      })
      .filter(Boolean) as Category[];
  }

  // Tracking functions for ngFor performance
  trackByCategory(index: number, category: Category): number | string {
    return category.id || index;
  }

  trackByBrand(index: number, brand: Brand): number | string {
    return brand.id || brand.name || index;
  }

  // Add methods to handle category expansion
  toggleCategoryExpansion(category: Category, event: Event): void {
    event.stopPropagation(); // Prevent category selection when clicking expand icon
    if (category.id) {
      if (this.expandedCategories.has(category.id)) {
        this.expandedCategories.delete(category.id);
      } else {
        this.expandedCategories.add(category.id);
      }
    }
  }

  toggleSubCategoryExpansion(subcategory: Category, event: Event): void {
    event.stopPropagation(); // Prevent subcategory selection when clicking expand icon
    if (subcategory.id) {
      if (this.expandedSubCategories.has(subcategory.id)) {
        this.expandedSubCategories.delete(subcategory.id);
      } else {
        this.expandedSubCategories.add(subcategory.id);
      }
    }
  }

  isCategoryExpanded(category: Category): boolean {
    return category.id ? this.expandedCategories.has(category.id) : false;
  }

  isSubCategoryExpanded(subcategory: Category): boolean {
    return subcategory.id
      ? this.expandedSubCategories.has(subcategory.id)
      : false;
  }

  // Add method to get localized currency
  getLocalizedCurrency(): string {
    const country = localStorage.getItem('country') || 'EG';
    const language = this.languageService.getCurrentLanguage();

    if (country === 'EG') {
      return language === 'ar' ? 'ج.م' : 'EGP';
    } else if (country === 'SA') {
      return language === 'ar' ? 'ر.س' : 'SAR';
    }

    return 'EGP'; // Default fallback
  }
}
