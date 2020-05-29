import BN from 'bn.js';
import * as data from '../../build/contracts/PlaceCoinFlipBet.json';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import Web3 from 'web3';
const web3 = new Web3(Web3.givenProvider);

import { Injectable } from '@angular/core';
import { BetEvent } from './bet-event.js';

@Injectable({
  providedIn: 'root'
})
export class CoinFlipBetService {

  balance = new BN('0');

  // TODO: move contract address to a config file
  private readonly contractAddress = '0x1E59C4C2E99B4370c550964C82d737Db1DAAd3De';
  private contract: Promise<Contract>;

  constructor() {
    this.contract = this.getContract();
  }

  private getContract(): Promise<Contract> {
    if (this.contract) {
      return this.contract;
    }    
    this.contract = window.ethereum.enable().then(accounts => {
      let c = new web3.eth.Contract(
        data.abi as AbiItem[],
        this.contractAddress,
        { from: accounts[0] }
      );
      console.log(c);
      return c;
    });
    return this.contract;
  }

  deposit(amount: BN): Promise<any> {
    return this.getContract()
      .then(c => c.methods.addFunds().send({value: amount}))
      .then(() => this.getBalance());
  }

  withdraw(amount: BN): Promise<any> {
    return this.getContract()
      .then(c => c.methods.withdrawFunds(amount).send())
      .then(() => this.getBalance());
  }

  getBalance(): Promise<BN> {
    return this.getContract()
      .then(c => c.methods.getMyBalance().call())
      .then(balance => {
        this.balance = new BN(balance);
        return this.balance;
      });
  }

  minBet(): Promise<BN> {
    return this.getContract()
      .then(c => c.methods.minBet().call())
      .then(minBet => new BN(minBet));
  }

  maxBet(): Promise<BN> {
    return this.getContract()
      .then(c => c.methods.maxBet().call())
      .then(maxBet => new BN(maxBet));
  }

  placeBet(betOn: boolean, amount: BN): Promise<BetEvent> {
    return this.getContract()
      .then(c => c.methods.placeBet(betOn, amount).send())
      .then(res => {
        this.getBalance();
        return res.events.BetResult.returnValues;
      });
  }

}
