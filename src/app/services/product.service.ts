import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../enviroments/enviroment';
import { ApiEndPoint } from '../../constants/api.constant';
import { Observable } from 'rxjs';
import { Category } from '../model/Categories';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  constructor(private http: HttpClient) {}

  // CATEGORY API
  getCategories(): Observable<{ result: Category[] }> {
    return this.http.get<{ result: Category[] }>(
      `${environment.apiUrl}/${ApiEndPoint.allCategoriesApi}`,
    );
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
    } = {},
  ) {
    const body = {
      paging: {
        pageNumber: filters.pageNumber ?? 1,
        pageSize: filters.pageSize ?? 10,
      },
      categoryId: filters.categoryId ?? [],
      subCategoryId: filters.subCategoryId ?? [],
      subSubCategoryId: filters.subSubCategoryId ?? [],
      countryId: filters.countryId ?? 224,
      brandId: filters.brandId ?? [],
      gender: filters.gender ?? [0, 1],
      sortBy: filters.sortBy ?? 0,
    };

    return this.http.post<any>(
      `${environment.apiUrl}/${ApiEndPoint.getAllProductVariantsForClient}`,
      body,
    );
  }

  // Product Details API

  getProductDetails() {
    return this.http.get(
      `${environment.apiUrl}/${ApiEndPoint.getProductDetails}`,
    );
  }
}
