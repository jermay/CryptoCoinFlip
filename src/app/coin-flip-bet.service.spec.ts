import { TestBed } from '@angular/core/testing';

import { CoinFlipBetService } from './coin-flip-bet.service';

describe('CoinFlipBetService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CoinFlipBetService = TestBed.get(CoinFlipBetService);
    expect(service).toBeTruthy();
  });
});
