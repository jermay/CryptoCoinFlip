import { Injectable } from '@angular/core';

import { AbiItem } from 'web3-utils';
import { Contract } from './contract';


// import Contract from '@truffle/contract';
import * as coinFlipBetArtifacts from '../../build/contracts/PlaceCoinFlipBet.json';
import { Web3Service } from './web3.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  protected placeCoinFlipBet: Promise<Contract>;
  protected readonly placeCoinFlipBetAddress = '0xb173FA239E7b9cC6bE549c931b72b076162Ee00b';

  constructor(private w3s: Web3Service) {  }

  getPlaceCoinFlipBet(): Promise<Contract> {
    if (this.placeCoinFlipBet) {
      return this.placeCoinFlipBet;
    }
    this.placeCoinFlipBet = this.w3s.initWeb3()
      .then(async web3 => {      
        const accounts = await web3.eth.getAccounts();
        console.log(accounts);
        const c = new web3.eth.Contract(
          coinFlipBetArtifacts.abi as AbiItem[],
          this.placeCoinFlipBetAddress,
          { from: accounts[0] }
        );
        c.defaultAccount = accounts[0];
        console.log(c);

        return c;
      });

    return this.placeCoinFlipBet;
  }
}
