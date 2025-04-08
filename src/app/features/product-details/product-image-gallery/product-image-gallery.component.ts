import { Component, Input, OnInit, SimpleChanges } from '@angular/core';
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
export class ProductImageGalleryComponent {
  @Input() productDetails!: Product;

  images: any[] = [];
  imagesLoaded = false;
  loadingImages = true;
  isProcessing = false; // Flag to prevent duplicate processing

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

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['productDetails'] &&
      changes['productDetails'].currentValue &&
      !this.isProcessing
    ) {
      this.loadImages();
    }
  }

  loadImages() {
    // Prevent multiple simultaneous calls
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.loadingImages = true;
    this.imagesLoaded = false;
    this.images = [];

    console.log('Loading images...', this.productDetails); // Debug log

    // Process main image immediately if available
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

    // Add gallery images if available
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

    setTimeout(() => {
      this.finishLoading();
    }, 500);
  }

  finishLoading(): void {
    this.imagesLoaded = true;
    this.loadingImages = false;
    this.isProcessing = false;
  }

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.png';
    return `${environment.apiUrl}/Attachments${relativePath.replace(
      /\\/g,
      '/'
    )}`;
  }
}
