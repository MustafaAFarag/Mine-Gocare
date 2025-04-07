import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-product-info-tabs',
  imports: [CommonModule],
  templateUrl: './product-info-tabs.component.html',
  styleUrl: './product-info-tabs.component.css',
})
export class ProductInfoTabsComponent {
  activeTab: string = 'description';
}
