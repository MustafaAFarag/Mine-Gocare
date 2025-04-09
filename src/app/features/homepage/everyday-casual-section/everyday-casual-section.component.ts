import { Component, Input } from '@angular/core';
import { Category } from '../../../model/Categories';
import { environment } from '../../../../enviroments/enviroment';
import { Product } from '../../../model/Product';

@Component({
  selector: 'app-everyday-casual-section',
  imports: [],
  templateUrl: './everyday-casual-section.component.html',
  styleUrl: './everyday-casual-section.component.css',
})
export class EverydayCasualSectionComponent {
  @Input() categories: Category[] = [];
  @Input() products: Product[] = [];

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.png';
    return `${environment.apiUrl}/Attachments${relativePath.replace(/\\/g, '/')}`;
  }
}
