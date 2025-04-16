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

import { ProductCardComponent } from '../../../components/product-card/product-card.component';

@Component({
  selector: 'app-everyday-casual-section',
  standalone: true,
  imports: [LoadingComponent, CommonModule, ProductCardComponent],
  templateUrl: './everyday-casual-section.component.html',
  styleUrls: ['./everyday-casual-section.component.css'],
})
export class EverydayCasualSectionComponent {
  @Input() categories: Category[] = [];
  @Input() products: Product[] = [];
  @Input() isLoadingProducts!: boolean;
  @Input() selectedCategory: any;

  isCategoryLoading: boolean = false;

  @Output() categorySelected = new EventEmitter<number>(); // Emit category ID when clicked

  constructor(private cdr: ChangeDetectorRef) {}

  onCategoryClick(categoryId: number): void {
    this.isCategoryLoading = true;
    this.categorySelected.emit(categoryId); // Emit the selected category's ID
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      console.log('Products changed:', this.products);
      this.isCategoryLoading = false;
      this.cdr.detectChanges();
    }
  }
}
