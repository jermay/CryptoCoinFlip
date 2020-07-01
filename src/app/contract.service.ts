import BN from 'bn.js';
import { Injectable } from '@angular/core';

import { AbiItem } from 'web3-utils';
import { Contract } from './contract';

import * as coinFlipBetArtifacts from '../../build/contracts/PlaceCoinFlipBet.json';
import { Web3Service } from './web3.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  account: string;
  accountChanged: BehaviorSubject<string> = new BehaviorSubject('');
  protected placeCoinFlipBet: Promise<Contract>;
  protected contractAddress = {
    private: '0xB5efD6E3Afc98eB0fD6cEbDB86f100deC3a20180', // dev
    kovan: '0xd0aFBcc602cbd3bbb956784e625d52D7A5665d5E',
  }

  constructor(private w3s: Web3Service) {
    this.monitorAccountChange();
   }

  async monitorAccountChange() {
    setInterval(async () => {      
      let results = await this.w3s.instance.eth.getAccounts();
      if (results[0] != this.account) {        
        this.account = results[0];
        this.accountChanged.next(this.account);
      }
    }, 500);
  }

  getPlaceCoinFlipBet(): Promise<Contract> {
    if (this.placeCoinFlipBet) {
      return this.placeCoinFlipBet;
    }
    console.log('ContractService>getPlaceCoinFlipBet');
    this.placeCoinFlipBet = this.w3s.initWeb3()
      .then(async web3 => {
        const accounts = await web3.eth.getAccounts();
        const address = await this.getContractAddress();
        console.log('accounts: ', accounts);
        const c = new web3.eth.Contract(
          coinFlipBetArtifacts.abi as AbiItem[],
          address,
          { from: accounts[0] }
        );
        this.account = accounts[0];
        // c.defaultAccount = this.account;
        console.log('PlaceCoinFlipBet contract: ', c);
        return c;
      });

    return this.placeCoinFlipBet;
  }

  getContractAddress(): Promise<string> {
    return this.w3s.instance.eth.net.getNetworkType()
      .then(network => this.contractAddress[network]);
  }

  getContractBalance(): Promise<BN> {
    return this.getContractAddress()
      .then(address => this.w3s.instance.eth.getBalance(address))
      .then(strBal => new BN(strBal));
  }

  getNetwork(): Promise<string> {
    return this.w3s.instance.eth.net.getNetworkType();
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
