import BN from 'bn.js';

import { CoinFlipBetService } from './coin-flip-bet.service';
import { ContractServiceStub } from './contract.service.stub';
import { ContractStub } from './contract.stub';
import { async } from '@angular/core/testing';
import { BetStatus, Bet } from './bet';
import { BetPlacedEvent } from './bet-placed-event';
import { BetResultEvent } from './bet-result-event';

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
  });

  describe('when a bet result event is received', () => {
    let bet: Bet;
    let betPlacedEvent: BetPlacedEvent;
    let betResultEventData: any;
    beforeEach(() => {
      bet = new Bet();
      betPlacedEvent = {
        id: '1a2c3b',
        player: 'test',
        amount: new BN('1'),
        betOn: true
      };
      betResultEventData = {
        id: 'log_4d5f6a',
        blockNumber: 2,
        returnValues: {
          id: betPlacedEvent.id,
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

    beforeEach(async(() => {
      contract.pastEvents = {
        BetPlaced: [
          {
            event: 'BetPlaced',
            blockNumber: 1,
            returnValues: {
              id: '1a2c3b',
              player: 'test',
              amount: new BN('1'),
              betOn: true
            }
          },
          {
            event: 'BetPlaced',
            blockNumber: 3,
            returnValues: {
              id: '2a3c4b',
              player: 'test',
              amount: new BN('2'),
              betOn: false
            }
          }
        ],
        BetResult: [
          {
            event: 'BetResult',
            blockNumber: 2,
            returnValues: {
              id: '1a2c3b',
              flipResult: true, // winning
              payout: new BN('2')
            }
          },
          {
            event: 'BetResult',
            blockNumber: 4,
            returnValues: {
              id: '2a3c4b',
              flipResult: true, // losing
              payout: new BN('0')
            }
          }
        ]
      };
      // create fresh service with event history
      service = new CoinFlipBetService(contractService);
    }));

    it('should get the past events and add them to the list', () => {
      expect(service.betList.bets.length).toEqual(2, 'add past bets');
      service.betList.bets.forEach(bet => {
        expect(bet.status()).toEqual(BetStatus.Completed);
      });
    });
  });
});
