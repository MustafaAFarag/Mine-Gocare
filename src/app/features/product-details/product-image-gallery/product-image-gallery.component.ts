import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../model/Product';
import { CommonModule } from '@angular/common';
import { GalleriaModule } from 'primeng/galleria';
import { ProductDetails } from '../../../model/ProductDetail';
import { getFullImageUrl } from '../../../lib/utils';

@Component({
  selector: 'app-product-image-gallery',
  standalone: true,
  imports: [CommonModule, GalleriaModule],
  templateUrl: './product-image-gallery.component.html',
  styleUrl: './product-image-gallery.component.css',
})
export class ProductImageGalleryComponent implements AfterViewInit, OnDestroy {
  @Input() productDetails!: ProductDetails;
  private boundScrollHandler: any;

  images: any[] = [];
  imagesLoaded = false;
  loadingImages = true;
  isProcessing = false;
  isSticky = false;
  stopStickyAt: number = 0;
  galleryInitialized = false;

  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 2 },
  ];

  private debounceTimeout: any;

  ngOnChanges(changes: SimpleChanges) {
    if (
      changes['productDetails'] &&
      changes['productDetails'].currentValue &&
      !this.isProcessing
    ) {
      this.loadImages();
    }
  }

  ngAfterViewInit() {
    // Use ngAfterViewInit only for DOM manipulations or scroll setup
    if (typeof window !== 'undefined' && !this.galleryInitialized) {
      this.galleryInitialized = true;
      this.boundScrollHandler = this.onScroll.bind(this);
      window.addEventListener('scroll', this.boundScrollHandler);

      // Setup stopStickyAt logic after view initialization
      setTimeout(() => {
        const galleryElement = document.getElementById('product-gallery');
        if (galleryElement) {
          const galleriaContainer = galleryElement.querySelector('.p-galleria');
          if (galleriaContainer) {
            this.stopStickyAt =
              galleryElement.offsetTop + galleriaContainer.clientHeight;
          }
        }
      }, 500);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined' && this.boundScrollHandler) {
      window.removeEventListener('scroll', this.boundScrollHandler);
    }
  }

  debounce(func: Function, wait: number) {
    return (...args: any[]) => {
      clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => func(...args), wait);
    };
  }

  onScroll() {
    const scrollPosition = window.scrollY;
    const galleryElement = document.getElementById('product-gallery');

    if (galleryElement) {
      const galleryTop =
        galleryElement.getBoundingClientRect().top + window.scrollY;
      const galleryHeight = galleryElement.clientHeight;
      // Increased buffer zone to make it stick earlier
      const bufferZone = 250; // Changed from 30 to 150px

      if (scrollPosition > galleryTop - bufferZone) {
        // Changed from + to - to trigger earlier
        this.isSticky = true;
      } else if (scrollPosition < galleryTop - bufferZone) {
        this.isSticky = false;
      }

      if (scrollPosition > galleryTop + galleryHeight - bufferZone) {
        this.isSticky = false;
      }
    }
  }

  loadImages() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    this.loadingImages = true;
    this.imagesLoaded = false;
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

    // Use Promise.resolve() to avoid unexpected async issues
    Promise.resolve().then(() => {
      this.finishLoading();
    });
  }

  finishLoading(): void {
    this.imagesLoaded = true;
    this.loadingImages = false;
    this.isProcessing = false;
  }

  getFullImageUrl = getFullImageUrl;
}
