import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
  inject,
  OnDestroy,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Category } from '../../../model/Categories';
import { Product } from '../../../model/Product';
import { ChangeDetectorRef } from '@angular/core';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../enviroments/enviroment';

import { ProductCardComponent } from '../../../components/product-card/product-card.component';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-everyday-casual-section',
  standalone: true,
  imports: [
    LoadingComponent,
    CommonModule,
    ProductCardComponent,
    TranslateModule,
  ],
  templateUrl: './everyday-casual-section.component.html',
  styleUrls: ['./everyday-casual-section.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EverydayCasualSectionComponent implements OnInit, OnDestroy {
  @Input() categories: Category[] = [];
  @Input() products: Product[] = [];
  @Input() isLoadingProducts!: boolean;
  @Input() selectedCategory: any;
  isCategoryLoading: boolean = false;
  private langSubscription?: Subscription;

  @Output() categorySelected = new EventEmitter<number>(); // Emit category ID when clicked

  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);

  constructor() {}

  ngOnInit(): void {
    // Subscribe to changes in the language through the direction$ observable
    this.langSubscription = this.languageService.direction$.subscribe(() => {
      // Force update the view when language changes
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  getCategoryName(category: Category): string {
    const currentLang = this.languageService.getCurrentLanguage();
    return currentLang === 'ar' ? category.name.ar : category.name.en;
  }

  onCategoryClick(categoryId: number): void {
    this.isCategoryLoading = true;
    this.categorySelected.emit(categoryId);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      this.isCategoryLoading = false;
      this.cdr.detectChanges();
    }
  }
}
