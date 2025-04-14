import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb.component';
import { FilterTabComponent } from '../../features/collections/filter-tab/filter-tab.component';

interface Product {
  id: number;
  name: string;
  image: string;
  rating: number;
  category: string;
}

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
  imports: [CommonModule, BreadcrumbComponent, FilterTabComponent],
  templateUrl: './collections.component.html',
  styleUrls: ['./collections.component.css'],
})
export class CollectionsComponent {
  // Filter states
  showCategories: boolean = true;
  showBrands: boolean = true;
  showColors: boolean = true;

  // Active filters
  activeFilters: string[] = ['Baby Essentials'];

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

  // Products
  products: Product[] = [
    {
      id: 1,
      name: 'Tiny Treasures',
      image: '/assets/default-image.png',
      rating: 0,
      category: 'Baby Toys',
    },
    {
      id: 2,
      name: 'Baby Bliss',
      image: '/assets/default-image.png',
      rating: 0,
      category: 'Baby Footwear',
    },
    {
      id: 3,
      name: 'Baby Bliss',
      image: '/assets/default-image.png',
      rating: 0,
      category: 'Baby Footwear',
    },
  ];

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
}
