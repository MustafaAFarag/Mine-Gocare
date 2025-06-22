import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiEndPoint } from '../constants/api.constant';
import { CartItem } from '../model/Cart';

export interface StockValidationResult {
  productId: number;
  variantId?: number;
  currentStock: number;
  requestedQuantity: number;
  isValid: boolean;
  errorMessage?: string;
}

export interface StockValidationResponse {
  isValid: boolean;
  invalidItems: StockValidationResult[];
  totalInvalidItems: number;
}

@Injectable({
  providedIn: 'root',
})
export class StockValidationService {
  constructor(private http: HttpClient) {}

  /**
   * Validate stock levels for all cart items against current server data
   */
  validateCartStock(
    cartItems: CartItem[],
  ): Observable<StockValidationResponse> {
    if (cartItems.length === 0) {
      return of({
        isValid: true,
        invalidItems: [],
        totalInvalidItems: 0,
      });
    }

    // Create validation requests for each cart item
    const validationRequests = cartItems.map((item) =>
      this.validateItemStock(
        item.productId,
        item.variantId || item.productId,
        item.quantity,
      ),
    );

    return forkJoin(validationRequests).pipe(
      map((results: StockValidationResult[]) => {
        const invalidItems = results.filter((result) => !result.isValid);
        return {
          isValid: invalidItems.length === 0,
          invalidItems,
          totalInvalidItems: invalidItems.length,
        };
      }),
      catchError((error) => {
        console.error('Error validating stock:', error);
        // Return invalid result if validation fails
        return of({
          isValid: false,
          invalidItems: cartItems.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            currentStock: 0,
            requestedQuantity: item.quantity,
            isValid: false,
            errorMessage: 'Unable to validate stock levels',
          })),
          totalInvalidItems: cartItems.length,
        });
      }),
    );
  }

  /**
   * Validate stock for a single item
   */
  private validateItemStock(
    productId: number,
    variantId: number,
    requestedQuantity: number,
  ): Observable<StockValidationResult> {
    return this.getProductStock(productId, variantId).pipe(
      map((currentStock) => {
        const isValid = currentStock >= requestedQuantity;
        return {
          productId,
          variantId,
          currentStock,
          requestedQuantity,
          isValid,
          errorMessage: isValid
            ? undefined
            : `Only ${currentStock} items available in stock`,
        };
      }),
      catchError((error) => {
        console.error(
          `Error validating stock for product ${productId}, variant ${variantId}:`,
          error,
        );
        return of({
          productId,
          variantId,
          currentStock: 0,
          requestedQuantity,
          isValid: false,
          errorMessage: 'Unable to verify stock levels',
        });
      }),
    );
  }

  /**
   * Get current stock count for a product variant from server
   */
  private getProductStock(
    productId: number,
    variantId: number,
  ): Observable<number> {
    return this.http
      .get<any>(
        `${environment.apiUrl}/${ApiEndPoint.getProductDetails}?productId=${productId}&ProductVariantId=${variantId}`,
      )
      .pipe(
        map((response) => {
          if (response.success && response.result) {
            // Find the specific variant
            const variant = response.result.productVariants?.find(
              (v: any) => v.id === variantId,
            );
            return variant ? variant.stockCount : 0;
          }
          return 0;
        }),
        catchError((error) => {
          console.error('Error fetching product stock:', error);
          return of(0);
        }),
      );
  }

  /**
   * Get detailed stock validation with product names
   */
  validateCartStockWithDetails(
    cartItems: CartItem[],
  ): Observable<StockValidationResponse & { details: any[] }> {
    return this.validateCartStock(cartItems).pipe(
      map((validation) => {
        const details = validation.invalidItems.map((item) => {
          const cartItem = cartItems.find(
            (ci) =>
              ci.productId === item.productId &&
              ci.variantId === item.variantId,
          );
          return {
            ...item,
            productName: cartItem?.name || 'Unknown Product',
            image: cartItem?.image || '',
          };
        });

        return {
          ...validation,
          details,
        };
      }),
    );
  }
}
