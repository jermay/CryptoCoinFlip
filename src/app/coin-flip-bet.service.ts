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
  contractBalance = new BN('0');
  isPlayerOwner = false;
  lastBetResultEventLogId: string;
  eventEmitter: any;

  constructor(private contractService: ContractService) {
    this.getPastBetEvents();
    this.subscribeToAccountChange();
    this.subscribeToEvents();
  }

  private getPastBetEvents() {
    this.contractService.getPlaceCoinFlipBet()
      .then(async c => {
        const options = {
          filter: {
            player: this.contractService.account
          },
          fromBlock: 0
        };
        console.log('service>getPastEvents: options: ', options);
        let betPlacedEventData = <BetPlacedEvent[]>await
          c.getPastEvents('BetPlaced', options)
            .then(result => result.map(
              log => this.getBetPlacedEventFromEventData(log)));

        let betResultEventData = <BetResultEvent[]>await
          c.getPastEvents('BetResult', options)
            .then(result => result.map(
              log => this.getBetResultEventFromEventData(log)));

        console.log('service>getPastEvents: BetPlaced: ', betPlacedEventData, '\nBetResult: ', betResultEventData);
        this.betList.addHistory({
          BetPlaced: betPlacedEventData,
          BetResult: betResultEventData
        });
      });
  }

  subscribeToEvents() {
    this.contractService.getPlaceCoinFlipBet()
      .then(c => {
        this.eventEmitter = c.events.allEvents({
          filter: { player: this.contractService.account },
        });
        this.eventEmitter
          .on('data', e => {
            console.log('Received subbed event: ', e.event);
            if (e.event !== 'BetResult') {
              return;
            }
            console.log('BetResult received: ', e);
            this.onBetResult(e);
          })
          .on('error', err => console.log(err));
      });
    console.log('subscribed to all events');
  }

  private subscribeToAccountChange() {
    this.contractService.accountChanged.subscribe(account => {
      if (!account) {
        return;
      }
      console.log('service: account changed: ', this.contractService.account);
      this.betList.bets = [];
      this.getPastBetEvents();
      this.onStuffChanged();
    });
  }

  updateIsPlayerOwner() {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.owner().call())
      .then(owner => {
        // console.log('isPlayerOwner: ', owner, 'account: ', this.contractService.account);
        this.isPlayerOwner = (owner == this.contractService.account);
      });
  }

  deposit(amount: BN): Promise<any> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.addFunds().send({ from: this.contractService.account, value: amount }))
      .then(() => this.onStuffChanged());
  }

  withdraw(amount: BN): Promise<any> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.withdrawFunds(amount).send({ from: this.contractService.account }))
      .then(() => this.onStuffChanged());
  }

  getBalance(): Promise<BN> {
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.getMyBalance().call({ from: this.contractService.account }))
      .then(balance => {
        this.balance = new BN(balance);
        return this.balance;
      });
  }

  getContractBalance(): Promise<BN> {
    return this.contractService.getContractBalance()
      .then(bal => {
        this.contractBalance = bal;
        return this.contractBalance;
      });
  }

  onStuffChanged() {
    this.getBalance();
    this.getContractBalance();
    this.updateIsPlayerOwner();
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
      .then(c => c.methods.placeBet(betOn, amount).send({ from: this.contractService.account }))
      .then(res => {
        console.log('Service > placeBet: response', res);
        const betPlacedEvent = this.getBetPlacedEventFromResponse(res);
        this.betList.confirmBet(
          bet.id(),
          betPlacedEvent
        );
        this.onStuffChanged();
        return true;
      }).catch(err => {
        this.betList.remove(bet.id());
        console.error(err);
        return false;
      });
  }

  getBlockNumberFromResponse(response: any): number {
    try {
      return response.events.BetPlaced.blockNumber
    } catch (error) {
      console.error('unable to get block number from response', error, response);
    }
  }

  getBetPlacedEventFromResponse(response: any): BetPlacedEvent {
    try {
      return response.events.BetPlaced.returnValues;
    } catch (error) {
      console.error('unable to get BetPlacedEvent from response. ', error, response);
      return undefined;
    }
  }

  private subscribeToResult(queryId: string, fromBlock: number) {
    this.contractService.getPlaceCoinFlipBet()
      .then(c => {
        const options = {
          fromBlock: 0,
          filter: {
            id: queryId
            // player: this.contractService.account
          },
        };
        console.log(`Subscribed to bet result. options: `, JSON.stringify(options));
        this.eventEmitter = c.events.BetResult(options)
          .on('data',
            (event: any) => {
              console.log('BetResultEvent recieved: ', event);
              this.onBetResult(event);
            }
          ).on('error', err => console.log(err));
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

  onBetResult(event: any) {
    console.log('CoinFlipBetService > onBetResult');
    if (!event || !event.returnValues.id || event.id === this.lastBetResultEventLogId) {
      console.log('CoinFlipBetService > onBetResult: empty or duplicate event');
      return;
    }
    const data: BetResultEvent = this.getBetResultEventFromEventData(event);
    this.lastBetResultEventLogId = event.id;

    this.betList.addResult(data);
    this.onStuffChanged();
  }

  private getBetResultEventFromEventData(event: any): BetResultEvent {
    return {
      id: event.returnValues.id,
      player: event.returnValues.player,
      flipResult: event.returnValues.flipResult,
      payout: new BN(event.returnValues.payout)
    };
  }

  destroyContract(confirmation: string): Promise<any> {
    if (confirmation != 'this cannot be undone') {
      return Promise.reject('invalid confirmation code');
    }
    console.log("Calling self destruct on the contract. THIS CANNOT BE UNDONE!");
    return this.contractService.getPlaceCoinFlipBet()
      .then(c => c.methods.destroy()
        .send({ from: this.contractService.account }));
  }
}
