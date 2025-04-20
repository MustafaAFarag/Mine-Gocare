import { Component, Input } from '@angular/core';
import { Category } from '../../../model/Categories';
import { environment } from '../../../../enviroments/enviroment';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { getFullImageUrl } from '../../../lib/utils';

@Component({
  selector: 'app-cateogries-section',
  standalone: true,
  imports: [LoadingComponent, NgIf, NgFor, TranslateModule],
  templateUrl: './cateogries-section.component.html',
  styleUrl: './cateogries-section.component.css',
})
export class CateogriesSectionComponent {
  @Input() categories: Category[] = [];
  @Input() isLoadingCategories!: boolean;
  currentLang: string;

  constructor(
    private router: Router,
    private translate: TranslateService,
  ) {
    this.currentLang =
      this.translate.currentLang || this.translate.getDefaultLang();
  }

  getCategoryName(category: any): string {
    return this.currentLang === 'ar' ? category.name.ar : category.name.en;
  }

  getFullImageUrl = getFullImageUrl;

  navigateToCategory(category: Category): void {
    // Encode the category name to handle special characters in the URL
    const encodedCategoryName = encodeURIComponent(category.name.en);

    // Navigate to collections page with the category as a query parameter
    this.router.navigate(['/collections'], {
      queryParams: { category: encodedCategoryName },
    });
  }
}
