import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { Category } from '../../../model/Categories';
import { environment } from '../../../../enviroments/enviroment';
import { Product } from '../../../model/Product';
import { LoadingComponent } from '../../../shared/loading/loading.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-everyday-casual-section',
  standalone: true,
  imports: [LoadingComponent, CommonModule],
  templateUrl: './everyday-casual-section.component.html',
  styleUrl: './everyday-casual-section.component.css',
})
export class EverydayCasualSectionComponent {
  @Input() categories: Category[] = [];
  @Input() products: Product[] = [];
  @Input() isLoadingProducts!: boolean;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['products']) {
      console.log('Products changed:', this.products);
      this.cdr.detectChanges(); // Forces Angular to refresh the view
    }
  }

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.png';
    return `${environment.apiUrl}/Attachments${relativePath.replace(/\\/g, '/')}`;
  }
}
