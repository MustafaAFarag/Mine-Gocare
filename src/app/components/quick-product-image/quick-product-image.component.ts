import { Component, Input, SimpleChanges } from '@angular/core';
import { ProductDetails } from '../../model/ProductDetail';
import { getFullImageUrl } from '../../lib/utils';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-quick-product-image',
  standalone: true,
  imports: [CommonModule, GalleriaModule],
  templateUrl: './quick-product-image.component.html',
  styleUrl: './quick-product-image.component.css',
})
export class QuickProductImageComponent {
  @Input() productDetails!: ProductDetails;
  images: any[] = [];

  responsiveOptions: any[] = [
    { breakpoint: '1500px', numVisible: 2 },
    { breakpoint: '768px', numVisible: 2 },
    { breakpoint: '560px', numVisible: 2 },
  ];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['productDetails'] && changes['productDetails'].currentValue) {
      this.loadImages();
    }
  }

  loadImages() {
    this.images = [];

    if (this.productDetails?.mainImageUrl) {
      this.images.push({
        itemImageSrc: this.getFullImageUrl(this.productDetails.mainImageUrl),
        thumbnailImageSrc: this.getFullImageUrl(
          this.productDetails.mainImageUrl,
        ),
        alt: 'Main Product Image',
        title: 'Main Product Image',
      });
    }

    if (this.productDetails?.gallaryImageUrls?.length) {
      this.productDetails.gallaryImageUrls.forEach((image, index) => {
        this.images.push({
          itemImageSrc: this.getFullImageUrl(image.imageUrl),
          thumbnailImageSrc: this.getFullImageUrl(image.imageUrl),
          alt: `Gallery Image ${index + 1}`,
          title: `Gallery Image ${index + 1}`,
        });
      });
    }
  }

  getFullImageUrl = getFullImageUrl;
}
