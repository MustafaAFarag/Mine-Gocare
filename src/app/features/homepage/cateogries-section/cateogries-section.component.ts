import {
  Component,
  Input,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { Category } from '../../../model/Categories';
import { environment } from '../../../../environments/environment';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { getFullImageUrl } from '../../../lib/utils';
import { LanguageService } from '../../../services/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cateogries-section',
  standalone: true,
  imports: [LoadingComponent, NgIf, NgFor, TranslateModule],
  templateUrl: './cateogries-section.component.html',
  styleUrl: './cateogries-section.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CateogriesSectionComponent implements OnInit, OnDestroy {
  @Input() categories: Category[] = [];
  @Input() isLoadingCategories!: boolean;
  private langSubscription?: Subscription;

  private router = inject(Router);
  private languageService = inject(LanguageService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    // Subscribe to language changes
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

  getCategoryName(category: any): string {
    // Always get the current language from the service
    const currentLang = this.languageService.getCurrentLanguage();
    return currentLang === 'ar' ? category.name.ar : category.name.en;
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
