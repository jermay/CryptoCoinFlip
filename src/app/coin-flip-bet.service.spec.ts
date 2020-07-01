import BN from 'bn.js';

import { CoinFlipBetService } from './coin-flip-bet.service';
import { ContractServiceStub } from './contract.service.stub';
import { ContractStub } from './contract.stub';
import { async } from '@angular/core/testing';
import { BetStatus, Bet } from './bet';
import { BetPlacedEvent } from './bet-placed-event';
import { BetResultEvent } from './bet-result-event';
import { assert } from 'console';

describe('CoinFlipBetService', () => {
  let contractService: ContractServiceStub;
  let service: CoinFlipBetService;
  let contract: ContractStub;

  beforeEach(async(() => {
    contractService = new ContractServiceStub();
    contract = new ContractStub();
    contractService.setplaceCoinFlipBet(contract);
    service = new CoinFlipBetService(contractService);
  }));

  it('should be created', () => {
    expect(contract).toBeTruthy();
    expect(service).toBeTruthy();
  });

  describe('Place Bet', () => {

    it('should add a new bet to the list', async () => {
      await service.placeBet(true, new BN('1'));
      expect(service.betList.bets.length).toEqual(1);
    });

    it('should confirm the bet in the list', async () => {
      await service.placeBet(true, new BN('1'));
      let bet = service.betList.bets[0];
      expect(bet).toBeTruthy('no bet in list');
      expect(bet.status()).toEqual(BetStatus.ConfirmedAndWaitingForResult);
    });

    it('should only subscribe to the result event with the queryId from the BetPlaced event', async () =>{
      await service.placeBet(true, new BN('1'));
      
      expect(contract.eventSubs.length).toEqual(1, 'subbed');
      const bet = service.betList.bets[0];
      const sub = contract.eventSubs[0];
      expect(sub.options.filter.id).toEqual(bet.eventId(), 'id filter');
    });

    it('on error it should remove the bet from the list', async () => {
      contract._error = 'test error';
      await service.placeBet(true, new BN('1'));
      expect(service.betList.bets.length).toEqual(0);
    });

  });

  describe('when a bet result event is received', () => {
    let bet: Bet;
    let betPlacedEvent: BetPlacedEvent;
    let betResultEventData: any;
    let player1;
    let player2;
    beforeEach(() => {
      player1 = 'addr one';
      player2 = 'addr two';
      contract.defaultAccount = player1;

      bet = new Bet();
      betPlacedEvent = {
        id: '1a2c3b',
        player: player1,
        amount: new BN('1'),
        betOn: true
      };
      betResultEventData = {
        id: 'log_4d5f6a',
        blockNumber: 2,
        returnValues: {
          id: betPlacedEvent.id,
          player: betPlacedEvent.player,
          flipResult: true,
          payout: new BN('2')
        }
      }
      bet.confirm(betPlacedEvent);
      service.betList.bets.push(bet);
      expect(bet.status()).toEqual(BetStatus.ConfirmedAndWaitingForResult, 'precondition');
    });

    it('should update the original bet', () => {
      service.onBetResult(undefined, betResultEventData, betPlacedEvent.id);
      expect(bet.status()).toEqual(BetStatus.Completed);
    });

    it('should NOT create a duplicate bet', () => {
      service.onBetResult(undefined, betResultEventData, betPlacedEvent.id);
      expect(service.betList.bets.length).toEqual(1);
    });
  });

  describe('Bet History', () => {
    let player1: string;
    let player2: string;
    let exampleEvents;
    beforeEach(async(() => {
      player1 = 'one addr';
      player2 = 'two addr';
      exampleEvents = [
        { // 0
          event: 'BetPlaced',
          blockNumber: 1,
          returnValues: {
            id: '1a2c3b',
            player: player1,
            amount: new BN('1'),
            betOn: true
          }
        },
        { // 1
          event: 'BetResult',
          blockNumber: 2,
          returnValues: {
            id: '1a2c3b',
            player: player1,
            flipResult: true, // winning
            payout: new BN('2')
          }
        },
        { // 2
          event: 'BetPlaced',
          blockNumber: 3,
          returnValues: {
            id: '2a3c4b',
            player: player2,
            amount: new BN('2'),
            betOn: false
          }
        },
        { // 3
          event: 'BetResult',
          blockNumber: 4,
          returnValues: {
            id: '2a3c4b',
            player: player2,
            flipResult: true, // losing
            payout: new BN('0')
          }
        }
      ];
      contract.pastEvents = exampleEvents;
      contractService.account = player1;
      service = new CoinFlipBetService(contractService);
    }));

    it('should get the past events filtered by player and add them to the list', () => {
      expect(service.betList.bets.length).toEqual(1, 'add past bets');
      service.betList.bets.forEach(bet => {
        expect(bet.status()).toEqual(BetStatus.Completed);
        expect(bet.player()).toEqual(player1);
      });
    });
  });

  describe('Withdraw', () =>{
    describe('Owner', () =>{
      it('should REJECT if the owner balance is greater than the contract balance');
    });
  });
});
