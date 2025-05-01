import { TestBed } from '@angular/core/testing';

import { PointingSystemService } from './pointing-system.service';

describe('PointingSystemService', () => {
  let service: PointingSystemService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PointingSystemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
