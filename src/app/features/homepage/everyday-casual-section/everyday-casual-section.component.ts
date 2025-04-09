import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
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
export class EverydayCasualSectionComponent implements OnInit, OnChanges {
  @Input() categories: Category[] = [];
  @Input() products: Product[] = [];
  @Input() isLoadingProducts!: boolean;

  ngOnInit(): void {
    console.log('OnInit - isLoadingProducts:', this.isLoadingProducts);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isLoadingProducts']) {
      console.log(
        'OnChanges - isLoadingProducts changed to:',
        changes['isLoadingProducts'].currentValue,
      );
    }
  }

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.png';
    return `${environment.apiUrl}/Attachments${relativePath.replace(/\\/g, '/')}`;
  }
}
