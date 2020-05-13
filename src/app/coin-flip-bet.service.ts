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

  private readonly contractAddress = '0xDf7d6a80e938ecA5a30E73AC108449126db2A70A';
  private contract: Promise<Contract>;

  constructor() {
    this.contract = this.getContract();
  }

  private getContract(): Promise<Contract> {
    if (this.contract) {
      return this.contract;
    }
    return window.ethereum.enable().then(accounts => {
      let c = new web3.eth.Contract(
        data.abi as AbiItem[],
        this.contractAddress,
        { from: accounts[0] }
      );
      console.log(c);
      return c;
    });
  }

  minBet(): Promise<BN> {
    return this.getContract()
      .then(c => c.methods.minBet().call())
      .then(minBet => minBet);
  }

  maxBet(): Promise<BN> {
    return this.getContract()
      .then(c => c.methods.maxBet().call())
      .then(maxBet => maxBet);
  }

  placeBet(betOn: boolean, amount: BN): Promise<BetEvent> {
    return this.getContract()
      .then(c => c.methods.placeBet(betOn)
        .send({ value: web3.utils.toWei(amount, 'milli') })
        .on('receipt', res => {
          console.log(res);
          let betEvent = res.nsactionIndex[0].events.BetResult;
          console.log(betEvent);
          return betEvent;
        }));
  }
}
