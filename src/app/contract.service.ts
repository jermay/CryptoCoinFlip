import { Injectable } from '@angular/core';

import { AbiItem } from 'web3-utils';
import { Contract } from './contract';

import * as coinFlipBetArtifacts from '../../build/contracts/PlaceCoinFlipBet.json';
import { Web3Service } from './web3.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  protected placeCoinFlipBet: Promise<Contract>;
  protected readonly placeCoinFlipBetAddress = '0xe92CCd96f19C4E873f0a159d95Aaa731f2CFaAAa';

  constructor(private w3s: Web3Service) {  }

  getPlaceCoinFlipBet(): Promise<Contract> {
    if (this.placeCoinFlipBet) {
      return this.placeCoinFlipBet;
    }
    console.log('ContractService>getPlaceCoinFlipBet');
    this.placeCoinFlipBet = this.w3s.initWeb3()
      .then(async web3 => {      
        const accounts = await web3.eth.getAccounts();
        console.log('accounts: ', accounts);
        const c = new web3.eth.Contract(
          coinFlipBetArtifacts.abi as AbiItem[],
          this.placeCoinFlipBetAddress,
          { from: accounts[0] }
        );
        c.defaultAccount = accounts[0];
        console.log('PlaceCoinFlipBet contract: ', c);
        return c;
      });

    return this.placeCoinFlipBet;
  }

  // getPlaceCoinFlipBet(): Promise<Contract> {
  //   if (this.placeCoinFlipBet) {
  //     return this.placeCoinFlipBet;
  //   }
  //   console.log('ContractService>getPlaceCoinFlipBet');
  //   this.placeCoinFlipBet = this.w3s.initWeb3()
  //     .then(async web3 => {      
  //       let TruffleContract = require('@truffle/contract');
  //       let CoinFlipBetContract = TruffleContract(coinFlipBetArtifacts);
  //       CoinFlipBetContract.setProvider(this.w3s.instance.currentProvider);
  //       console.log('from TruffleContract: ', CoinFlipBetContract);
  //       console.log('networks: ', CoinFlipBetContract.networks());
  //       let deployed = await CoinFlipBetContract.deployed();
  //       console.log('deployed contract: ', deployed);
  //       return deployed;
  //     });

  //   return this.placeCoinFlipBet;
  // }
}
