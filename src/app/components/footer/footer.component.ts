import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Category } from '../../model/Categories';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  categories: Category[] = [];
  private languageService = inject(LanguageService);

  constructor(
    private router: Router,
    private productService: ProductService,
  ) {}

  ngOnInit(): void {
    this.getCategoriesAPI();
  }

  getCategoriesAPI() {
    this.productService.getCategories().subscribe((res) => {
      this.categories = res.result;
    });
  }

  getCategoryName(category: any): string {
    // Get the current language from the service
    const currentLang = this.languageService.getCurrentLanguage();
    return currentLang === 'ar' ? category.name.ar : category.name.en;
  }

  navigateToCategory(category: Category): void {
    // Encode the category name to handle special characters in the URL
    const encodedCategoryName = encodeURIComponent(category.name.en);

    this.router.navigate(['/collections'], {
      queryParams: { category: encodedCategoryName },
    });
  }
}
