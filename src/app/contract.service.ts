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
    private: '0x837Cc0a50e594F162f6D2625C7a552a2c37A9b55', // dev
    kovan: '0xa10c36F1382B67d58A946C2A604a6BB987dE69Dd',
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
}
