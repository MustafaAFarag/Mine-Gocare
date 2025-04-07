import { Component, Input } from '@angular/core';
import { environment } from '../../../../enviroments/enviroment';
import { Product } from '../../../model/Employee';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-image-gallery',
  imports: [CommonModule],
  templateUrl: './product-image-gallery.component.html',
  styleUrl: './product-image-gallery.component.css',
})
export class ProductImageGalleryComponent {
  @Input() productDetails!: Product;

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.jpg';
    return `${environment.apiUrl}/Attachments${relativePath.replace(
      /\\/g,
      '/'
    )}`;
  }
}
