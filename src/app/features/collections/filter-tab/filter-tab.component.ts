import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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

interface RatingOption {
  value: number;
  selected: boolean;
}

interface PriceRange {
  min: number;
  max: number | null; // null represents "and above"
  selected: boolean;
}

@Component({
  selector: 'app-filter-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-tab.component.html',
  styleUrl: './filter-tab.component.css',
})
export class FilterTabComponent {
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
    { min: 300, max: null, selected: false }, // 300+ (and above)
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
      // If deselected, reset to full range
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

  // Filter categories based on search term
  get filteredCategories(): Category[] {
    if (!this.categorySearchTerm.trim()) {
      return this.categories;
    }

    const searchTerm = this.categorySearchTerm.toLowerCase();
    return this.categories
      .map((category) => {
        // Check if main category matches
        const categoryMatches = category.name
          .toLowerCase()
          .includes(searchTerm);

        // If main category matches, return it with all subcategories
        if (categoryMatches) {
          return { ...category };
        }

        // If main category doesn't match, check subcategories
        if (category.subcategories && category.subcategories.length > 0) {
          const matchingSubcategories = category.subcategories
            .filter((sub) => sub.name.toLowerCase().includes(searchTerm))
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
                const matchingSubSubs = sub.subcategories.filter((subSub) =>
                  subSub.name.toLowerCase().includes(searchTerm),
                );

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

  // Filter brands based on search term
  get filteredBrands(): Brand[] {
    if (!this.brandSearchTerm.trim()) {
      return this.brands;
    }

    const searchTerm = this.brandSearchTerm.toLowerCase();
    return this.brands.filter((brand) =>
      brand.name.toLowerCase().includes(searchTerm),
    );
  }
}
