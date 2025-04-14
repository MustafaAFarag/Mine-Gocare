import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  selector: 'app-filter-tab',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-tab.component.html',
  styleUrl: './filter-tab.component.css',
})
export class FilterTabComponent {
  @Input() categories: Category[] = [];
  @Input() brands: Brand[] = [];
  @Input() colors: Color[] = [];
  @Input() activeFilters: string[] = [];
  @Input() showCategories: boolean = true;
  @Input() showBrands: boolean = true;
  @Input() showColors: boolean = true;
  @Input() isMobile: boolean = false;

  @Output() filterToggled = new EventEmitter<
    'categories' | 'brands' | 'colors'
  >();
  @Output() categoryToggled = new EventEmitter<Category>();
  @Output() filterRemoved = new EventEmitter<string>();
  @Output() allFiltersCleared = new EventEmitter<void>();
  @Output() closeFilterSidebar = new EventEmitter<void>();

  toggleFilter(section: 'categories' | 'brands' | 'colors'): void {
    this.filterToggled.emit(section);
  }

  toggleCategory(category: Category): void {
    this.categoryToggled.emit(category);
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
}
