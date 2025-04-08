import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
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
export class ProductImageGalleryComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() productDetails!: Product;

  images: any[] = [];
  imagesLoaded = false;
  loadingImages = true;
  isProcessing = false;
  isSticky = false;
  stopStickyAt: number = 0;
  galleryInitialized = false; // Added flag to track gallery initialization

  responsiveOptions: any[] = [
    { breakpoint: '1024px', numVisible: 5 },
    { breakpoint: '768px', numVisible: 3 },
    { breakpoint: '560px', numVisible: 2 },
  ];

  private debounceTimeout: any;

  ngOnInit() {
    // Perform any initialization logic here, avoiding async operations
  }

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
      window.addEventListener(
        'scroll',
        this.debounce(this.onScroll.bind(this), 50),
      );

      // Setup stopStickyAt logic after view initialization
      setTimeout(() => {
        const galleryElement = document.getElementById('product-gallery');
        if (galleryElement) {
          const galleriaContainer = galleryElement.querySelector('.p-galleria');
          if (galleriaContainer) {
            this.stopStickyAt =
              galleryElement.offsetTop + galleriaContainer.clientHeight;
            console.log('Stop sticky at:', this.stopStickyAt);
          }
        }
      }, 500);
    }
  }

  ngOnDestroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener(
        'scroll',
        this.debounce(this.onScroll.bind(this), 50),
      );
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
      const bufferZone = 30;

      if (scrollPosition > galleryTop + bufferZone) {
        this.isSticky = true;
      } else if (scrollPosition < galleryTop - bufferZone) {
        this.isSticky = false;
      }

      if (scrollPosition > galleryTop + galleryHeight - bufferZone) {
        this.isSticky = false;
      }

      console.log('Scroll:', scrollPosition, 'isSticky:', this.isSticky);
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

  getFullImageUrl(relativePath?: string): string {
    if (!relativePath) return 'assets/default-image.png';
    return `${environment.apiUrl}/Attachments${relativePath.replace(
      /\\/g,
      '/',
    )}`;
  }
}
