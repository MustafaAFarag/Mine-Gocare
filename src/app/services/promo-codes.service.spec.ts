import { TestBed } from '@angular/core/testing';

import { PromoCodesService } from './promo-codes.service';

describe('PromoCodesService', () => {
  let service: PromoCodesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromoCodesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
