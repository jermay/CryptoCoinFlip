import BN from 'bn.js';
import { BehaviorSubject } from 'rxjs';

import { Injectable } from '@angular/core';
import { BetPlacedEvent } from './bet-placed-event';
import { BetResultEvent } from './bet-result-event';
import { ContractService } from './contract.service';

@Injectable({
  providedIn: 'root'
})
export class CoinFlipBetService {

  balance = new BN('0');
  readonly betPlaced = new BehaviorSubject<BetPlacedEvent>({
    id: '',
    player: '',
    amount: new BN(''),
    betOn: false
  });
  readonly betResult = new BehaviorSubject<BetResultEvent>({
    id: '',
    flipResult: false,
    payout: new BN('0')
  });
  private betEventCounter = 0; // test

  constructor(private contractService: ContractService) {
    this.subscribtToEvents();
  }

  private subscribtToEvents() {
    this.contractService.getPlaceCoinFlipBet()
      .then(c => {
        c.events.BetPlaced({}, this.onBetPlaced.bind(this))
        c.events.BetResult({}, this.onBetResult.bind(this));
        console.log('Subscribed to bet events')
      });
  }

  deposit(amount: BN): Promise<any> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.addFunds().send({value: amount}))
      .then(() => this.getBalance());
  }

  withdraw(amount: BN): Promise<any> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.withdrawFunds(amount).send())
      .then(() => this.getBalance());
  }

  getBalance(): Promise<BN> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.getMyBalance().call())
      .then(balance => {
        this.balance = new BN(balance);
        return this.balance;
      });
  }

  minBet(): Promise<BN> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.minBet().call())
      .then(minBet => new BN(minBet));
  }

  maxBet(): Promise<BN> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.maxBet().call())
      .then(maxBet => new BN(maxBet));
  }

  placeBet(betOn: boolean, amount: BN): Promise<boolean> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.placeBet(betOn, amount).send())
      .then(res => {
        console.log('Service > placeBet: response', res);
        this.getBalance();
        return true;
      });
  }

  onBetPlaced(error: any, event: any) {    
    console.log('CoinFlipBetService > onBetPlaced ', ++this.betEventCounter, event);
    if (error) {
      console.error(error);
      return;
    } else if (!event || !event.returnValues.id) {
      return;
    }
    const data: BetPlacedEvent = {
      id: event.returnValues.id,
      player: event.returnValues.player,
      amount: new BN(event.returnValues.amount),
      betOn: event.returnValues.betOn
    };
    this.betPlaced.next(data);
  }

  onBetResult(error: any, event: any) {
    console.log('CoinFlipBetService > onBetResult: ', event);
    if (error) {
      console.error(error);
      return;
    } else if (!event || !event.returnValues.id) {
      return;
    }
    const data: BetResultEvent = {
      id: event.returnValues.id,
      flipResult: event.returnValues.flipResult,
      payout: new BN(event.returnValues.payout)
    };
    this.betResult.next(data);
  }

}
