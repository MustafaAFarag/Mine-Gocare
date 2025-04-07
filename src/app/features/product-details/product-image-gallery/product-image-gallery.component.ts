import { Component, Input, OnInit } from '@angular/core';
import { environment } from '../../../../enviroments/enviroment';
import { Product } from '../../../model/Employee';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';

@Component({
  selector: 'app-product-image-gallery',
  standalone: true,
  imports: [CommonModule, GalleriaModule],
  templateUrl: './product-image-gallery.component.html',
  styleUrl: './product-image-gallery.component.css',
})
export class ProductImageGalleryComponent implements OnInit {
  @Input() productDetails!: Product;

  images: any[] = [];
  responsiveOptions: any[] = [
    {
      breakpoint: '1024px',
      numVisible: 5,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
    },
  ];

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    // Start with the main image
    if (this.productDetails?.mainImageUrl) {
      this.images.push({
        itemImageSrc: this.getFullImageUrl(this.productDetails.mainImageUrl),
        thumbnailImageSrc: this.getFullImageUrl(
          this.productDetails.mainImageUrl
        ),
        alt: 'Main Product Image',
        title: 'Main Product Image',
      });
    }

    // Add gallery images
    if (
      this.productDetails?.gallaryImageUrls &&
      this.productDetails.gallaryImageUrls.length > 0
    ) {
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

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.jpg';
    return `${environment.apiUrl}/Attachments${relativePath.replace(
      /\\/g,
      '/'
    )}`;
  }
}
