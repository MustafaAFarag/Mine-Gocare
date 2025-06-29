import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';
import { ApiEndPoint } from '../constants/api.constant';
import { Observable } from 'rxjs';
import { Category } from '../model/Categories';
import { ProductApiResponse } from '../model/Product';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  // CATEGORY API
  getCategories(noCache: boolean = true): Observable<{ result: Category[] }> {
    let url = `${environment.apiUrl}/${ApiEndPoint.allCategoriesApi}`;
    if (noCache) {
      url += `?_=${Date.now()}`;
    }
    return this.http.get<{ result: Category[] }>(url);
  }

  // Product API
  getAllProductVariantsForClient(
    filters: {
      pageNumber?: number;
      pageSize?: number;
      countryId?: number;
      gender?: number[];
      categoryId?: number[];
      subCategoryId?: number[];
      subSubCategoryId?: number[];
      brandId?: number[];
      sortBy?: number;
      minPrice?: number;
      maxPrice?: number;
    } = {},
  ): Observable<ProductApiResponse> {
    // Get country from localStorage only in browser environment
    let selectedCountry = 'EG';
    if (isPlatformBrowser(this.platformId)) {
      const storedCountry = localStorage.getItem('country');
      console.log('Stored Country from localStorage:', storedCountry);
      selectedCountry = storedCountry || 'EG';
    }
    console.log('Selected Country:', selectedCountry);
    const countryId = selectedCountry === 'EG' ? 224 : 103;
    console.log('COUNTRY ID:', countryId);

    const body: any = {
      paging: {
        pageNumber: filters.pageNumber ?? 1,
        pageSize: filters.pageSize ?? 10,
      },
      categoryId: filters.categoryId ?? [],
      subCategoryId: filters.subCategoryId ?? [],
      subSubCategoryId: filters.subSubCategoryId ?? [],
      countryId: filters.countryId ?? countryId,
      brandId: filters.brandId ?? [],
      gender: filters.gender ?? [0, 1],
      sortBy: filters.sortBy ?? 0,
    };

    // Only add price filters if they are explicitly set
    if (filters.minPrice !== undefined) {
      body.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      body.maxPrice = filters.maxPrice;
    }

    return this.http.post<ProductApiResponse>(
      `${environment.apiUrl}/${ApiEndPoint.getAllProductVariantsForClient}`,
      body,
    );
  }

  // Product Details API

  getProductDetails(productId: number, variantId: number): Observable<any> {
    return this.http.get(
      `${environment.apiUrl}/${ApiEndPoint.getProductDetails}?productId=${productId}&ProductVariantId=${variantId}`,
    );
  }
}
