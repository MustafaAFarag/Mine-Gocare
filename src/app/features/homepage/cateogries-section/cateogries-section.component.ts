import { Component, Input } from '@angular/core';
import { Category } from '../../../model/Categories';
import { environment } from '../../../../enviroments/enviroment';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { NgFor, NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cateogries-section',
  standalone: true,
  imports: [LoadingComponent, NgIf, NgFor],
  templateUrl: './cateogries-section.component.html',
  styleUrl: './cateogries-section.component.css',
})
export class CateogriesSectionComponent {
  @Input() categories: Category[] = [];
  @Input() isLoadingCategories!: boolean;

  constructor(private router: Router) {}

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.png';
    return `${environment.apiUrl}/Attachments${relativePath.replace(/\\/g, '/')}`;
  }

  navigateToCategory(category: Category): void {
    // Encode the category name to handle special characters in the URL
    const encodedCategoryName = encodeURIComponent(category.name.en);

    // Navigate to collections page with the category as a query parameter
    this.router.navigate(['/collections'], {
      queryParams: { category: encodedCategoryName },
    });
  }
}
