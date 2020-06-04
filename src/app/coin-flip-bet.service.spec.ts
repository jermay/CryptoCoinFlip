import BN from 'bn.js';
// import { TestBed } from '@angular/core/testing';

import { CoinFlipBetService } from './coin-flip-bet.service';
import { ContractServiceStub } from './contract.service.stub';
import { ContractStub } from './contract.stub';
import { async } from '@angular/core/testing';

describe('CoinFlipBetService', () => {
  let service: CoinFlipBetService;
  let contract: ContractStub;

  // beforeEach(() => TestBed.configureTestingModule({
  //   providers: [{provide: ContractService, useClass: ContractServiceStub}]
  // }));
  beforeEach(async(()=> {
    let contractService = new ContractServiceStub();
    contract = new ContractStub();
    contractService.setplaceCoinFlipBet(contract);
    service = new CoinFlipBetService(contractService);
  }));

  it('should be created', () => {
    // const service: CoinFlipBetService = TestBed.get(CoinFlipBetService);
    expect(contract).toBeTruthy();
    expect(service).toBeTruthy();
  });

  it('should subscribe to the contract bet events', async function() {
    expect(contract.betPlacedEventSubs.length).toEqual(1);
    expect(contract.betResultEventSubs.length).toEqual(1);
  });

  describe('Place Bet', ()=> {
    let placeBetEventCount: number;
    let betResultEventCount: number;
    beforeEach(()=> {
      service.betPlaced.subscribe(() => placeBetEventCount++);
      service.betResult.subscribe(() => betResultEventCount++);
      placeBetEventCount = 0;
      betResultEventCount = 0;
    });
    
    it('should emit a BetPlaced event', async () => {
      await service.placeBet(true, new BN('1'));
      expect(placeBetEventCount).toEqual(1);
    });
    
    it('Should emit a BetResult event', async () => {
      await service.placeBet(true, new BN('1'));
      expect(betResultEventCount).toEqual(1);
    });
  });
});
