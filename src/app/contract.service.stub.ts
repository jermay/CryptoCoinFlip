import { Injectable } from '@angular/core';
import { Contract } from './contract';
import { ContractService } from './contract.service';

@Injectable()
export class ContractServiceStub extends ContractService {
  
    constructor() { 
      super(undefined)
     }
  
    getPlaceCoinFlipBet(): Promise<Contract> {
      return this.placeCoinFlipBet;
    }

    setplaceCoinFlipBet(contract: Contract) {
      this.placeCoinFlipBet = Promise.resolve(contract);
    }
}