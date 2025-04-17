import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Category } from '../../model/Categories';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  categories: Category[] = [];

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

  navigateToCategory(category: Category): void {
    // Encode the category name to handle special characters in the URL
    const encodedCategoryName = encodeURIComponent(category.name.en);

    this.router.navigate(['/collections'], {
      queryParams: { category: encodedCategoryName },
    });
  }
}
