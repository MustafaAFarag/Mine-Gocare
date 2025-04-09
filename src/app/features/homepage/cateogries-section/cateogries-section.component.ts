import { Component, inject, OnInit } from '@angular/core';
import { ProductService } from '../../../services/product.service';
import { Category } from '../../../model/Categories';
import { environment } from '../../../../enviroments/enviroment';

@Component({
  selector: 'app-cateogries-section',
  imports: [],
  templateUrl: './cateogries-section.component.html',
  styleUrl: './cateogries-section.component.css',
})
export class CateogriesSectionComponent implements OnInit {
  categories: Category[] = [];
  productService = inject(ProductService);

  ngOnInit() {
    this.getCategoriesAPI();
  }

  getCategoriesAPI() {
    this.productService
      .getCategories()
      .subscribe((res: { result: Category[] }) => {
        this.categories = res.result;
      });
  }

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.png';
    return `${environment.apiUrl}/Attachments${relativePath.replace(
      /\\/g,
      '/',
    )}`;
  }

  categories1 = [
    {
      name: 'Fruits',
      image: 'https://placehold.co/400x400/orange/white?text=Fruits',
    },
    {
      name: 'Berries Jam',
      image: 'https://placehold.co/400x400/purple/white?text=Berries+Jam',
    },
    {
      name: 'Berries Meals',
      image: 'https://placehold.co/400x400/green/white?text=Berries+Meals',
    },
    {
      name: 'BlackBerry',
      image: 'https://placehold.co/400x400/black/white?text=BlackBerry',
    },
    {
      name: 'RaspBerry',
      image: 'https://placehold.co/400x400/red/white?text=RaspBerry',
    },
  ];
}
