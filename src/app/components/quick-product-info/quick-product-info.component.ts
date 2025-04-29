import { Component, Input } from '@angular/core';
import { ProductDetails } from '../../model/ProductDetail';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-quick-product-info',
  imports: [CommonModule, TranslateModule],
  templateUrl: './quick-product-info.component.html',
  styleUrl: './quick-product-info.component.css',
})
export class QuickProductInfoComponent {
  @Input() productDetails!: ProductDetails;
}
