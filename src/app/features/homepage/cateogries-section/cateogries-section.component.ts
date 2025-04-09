import { Component, Input } from '@angular/core';
import { Category } from '../../../model/Categories';
import { environment } from '../../../../enviroments/enviroment';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-cateogries-section',
  standalone: true,
  imports: [LoadingComponent, NgIf],
  templateUrl: './cateogries-section.component.html',
  styleUrl: './cateogries-section.component.css',
})
export class CateogriesSectionComponent {
  @Input() categories: Category[] = [];
  @Input() isLoadingCategories!: boolean;

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.png';
    return `${environment.apiUrl}/Attachments${relativePath.replace(/\\/g, '/')}`;
  }
}
