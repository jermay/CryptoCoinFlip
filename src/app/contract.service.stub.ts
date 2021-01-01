import BN from 'bn.js';
import { Injectable } from '@angular/core';
import { Contract } from './contract';
import { ContractService } from './contract.service';

@Injectable()
export class ContractServiceStub extends ContractService {

    contractBalance = new BN('0');
    network = 'private';

    constructor() { 
      super(undefined)
     }

     async monitorAccountChange() { }
  
    getPlaceCoinFlipBet(): Promise<Contract> {
      return this.placeCoinFlipBet;
    }

    setplaceCoinFlipBet(contract: Contract) {
      this.placeCoinFlipBet = Promise.resolve(contract);
    }

    getContractBalance(): Promise<BN> {
      return Promise.resolve(this.contractBalance);
    }

    getContractAddress(): Promise<string> {
      return Promise.resolve(this.contractAddress[this.network]);
    }
  
    getNetwork(): Promise<string> {
      return Promise.resolve(this.network);
    }
}