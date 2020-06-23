import BN from 'bn.js';

import { Injectable } from '@angular/core';
import { BetPlacedEvent } from './bet-placed-event';
import { BetResultEvent } from './bet-result-event';
import { ContractService } from './contract.service';
import { BetList } from './bet-list';

@Injectable({
  providedIn: 'root'
})
export class CoinFlipBetService {

  balance = new BN('0');
  betList = new BetList();
  lastBetResultEventLogId: string;

  constructor(private contractService: ContractService) {
    this.getPastBetEvents();
  }

  private getPastBetEvents() {
    this.contractService.getPlaceCoinFlipBet()
      .then(async c => {
        let betPlacedEventData = <BetPlacedEvent[]>await c.getPastEvents(
          'BetPlaced', { fromBlock: 0, toBlock: 'latest' })
          .then(result => result.map(log => this.getBetPlacedEventFromEventData(log)));

        let betResultEventData = <BetResultEvent[]>await c.getPastEvents(
          'BetResult', { fromBlock: 0, toBlock: 'latest' })
          .then(result => result.map(log => this.getBetResultEventFromEventData(log)));

        this.betList.addHistory({
          BetPlaced: betPlacedEventData,
          BetResult: betResultEventData
        });
      });
  }

  deposit(amount: BN): Promise<any> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.addFunds().send({ value: amount }))
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
    console.log(`Service>placeBet(): betOn: ${betOn}, amount: ${amount} wei`);
    let bet = this.betList.newBet();
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.placeBet(betOn, amount).send())
      .then(res => {
        console.log('Service > placeBet: response', res);
        const betPlacedEvent = this.getBetPlacedEventFromResponse(res);
        this.betList.confirmBet(
          bet.id(),
          betPlacedEvent
        );
        this.subscribeToResult(betPlacedEvent.id, res.blockNumber);
        this.getBalance();
        return true;
      });
  }

  getBetPlacedEventFromResponse(response: any): BetPlacedEvent {
    try {
      return response.events.BetPlaced.returnValues;
    } catch (error) {
      console.error('unable to get BetPlacedEvent from response. ', error);
      return undefined;
    }
  }

  private subscribeToResult(queryId: string, fromBlock: number) {
    this.contractService.getPlaceCoinFlipBet()
      .then(c => {
        c.events.BetResult(
          { fromBlock: fromBlock },
          (error: any, event: any) => this.onBetResult(error, event, queryId)
        );
        console.log(`Subscribed to bet result (queryId: ${queryId}, fromBlock: ${fromBlock})`);
      });
  }

  private getBetPlacedEventFromEventData(event: any): BetPlacedEvent {
    return {
      id: event.returnValues.id,
      player: event.returnValues.player,
      amount: new BN(event.returnValues.amount),
      betOn: event.returnValues.betOn
    };
  }

  onBetResult(error: any, event: any, queryId: string) {
    console.log('CoinFlipBetService > onBetResult');
    if (error) {
      console.error(error);
      return;
    } else if (!event || !event.returnValues.id || event.id === this.lastBetResultEventLogId) {
      console.log('CoinFlipBetService > onBetResult: empty or duplicate event');
      return;
    }
    const data: BetResultEvent = this.getBetResultEventFromEventData(event);
    if (data.id != queryId) {
      console.log(`onBetResult: event id "${data.id}" does not match target id of "${queryId}"`);
      return;
    }
    this.lastBetResultEventLogId = event.id;
    
    this.betList.addResult(data);
    this.getBalance();
  }

  private getBetResultEventFromEventData(event: any): BetResultEvent {
    return {
      id: event.returnValues.id,
      flipResult: event.returnValues.flipResult,
      payout: new BN(event.returnValues.payout)
    };
  }
}
