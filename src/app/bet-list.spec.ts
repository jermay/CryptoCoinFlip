import BN from 'bn.js';
import { BetList } from './bet-list';
import { Bet, BetStatus } from './bet';
import { BetPlacedEvent } from './bet-placed-event';
import { BetResultEvent } from './bet-result-event';

describe('BetList', () => {
  let betList: BetList;
  beforeEach(() => {
    betList = new BetList();
  });

  it('should create an instance', () => {
    expect(betList).toBeTruthy();
  });

  describe('new bet', () => {
    it('should add a new bet instance', () => {
      let result = betList.newBet();
      expect(betList.bets.length).toEqual(1, 'add');
      expect(result).toBeTruthy('return instance');
    });

    it('should add new bets to the FRONT of the lsit', () => {
      let bet1 = betList.newBet();
      let bet2 = betList.newBet();

      expect(betList.bets.length).toEqual(2, 'added both');
      expect(betList.bets[0].id()).toEqual(bet2.id());
      expect(betList.bets[1].id()).toEqual(bet1.id());
    });
  });

  describe('bet confirmed', () => {
    let bet: Bet;
    let betPlacedEvent: BetPlacedEvent;
    beforeEach(() => {
      bet = new Bet();
      betList.bets.push(bet);
      betPlacedEvent = {
        id: '1a2c3b',
        player: 'test',
        amount: new BN('1'),
        betOn: true
      };
      expect(bet.status()).toEqual(BetStatus.Unconfirmed, 'precondition');
    });

    it('should update the status of the original bet to confirmed and return TRUE', () => {
      let result = betList.confirmBet(bet.id(), betPlacedEvent);

      expect(bet.status()).toEqual(BetStatus.ConfirmedAndWaitingForResult);
      expect(result).toEqual(true);
    });

    it('should handle an undefined event and return FLASE', () => {
      let result = true;
      expect(() => {
        result = betList.confirmBet(bet.id(), undefined)
      }).not.toThrow();
      expect(result).toEqual(false);
    });
  });

  describe('bet result', () => {
    let bet: Bet;
    let betPlacedEvent: BetPlacedEvent;
    let betResultEvent: BetResultEvent;
    beforeEach(() => {
      bet = new Bet();
      betPlacedEvent = {
        id: '1a2c3b',
        player: 'test',
        amount: new BN('1'),
        betOn: true
      };
      betResultEvent = {
        id: betPlacedEvent.id,
        player: 'test',
        flipResult: true,
        payout: new BN('2')
      }
      bet.confirm(betPlacedEvent);
      betList.bets.push(bet);
      expect(bet.status()).toEqual(BetStatus.ConfirmedAndWaitingForResult, 'precondition');
    });

    it('should update the status of the original bet to completed and return TRUE', () => {
      let result = betList.addResult(betResultEvent);

      expect(bet.status()).toEqual(BetStatus.Completed);
      expect(result).toEqual(true);
    });

    it('should handle an invalid event id and return FLASE', () => {
      betResultEvent.id = 'invalid';
      let result = true;
      expect(() => {
        result = betList.addResult(betResultEvent);
      }).not.toThrow('throw');
      expect(result).toEqual(false, 'return false');
    });

    it('should handle an undefined event and return FLASE', () => {
      let result = true;
      expect(() => {
        result = betList.addResult(undefined)
      }).not.toThrow('throw');
      expect(result).toEqual(false, 'return false');
    });
  });

  describe('add bet history by events', () => {
    let pastEvents: any;
    beforeEach(() => {
      pastEvents = {
        BetPlaced: [
          {
            id: '1a2c3b',
            player: 'test',
            amount: new BN('1'),
            betOn: true
          },
          {
            id: '2a3c4b',
            player: 'test',
            amount: new BN('2'),
            betOn: false
          },
          {
            id: '3a4c5b', // waiting for result
            player: 'test',
            amount: new BN('3'),
            betOn: true
          }
        ],
        BetResult: [
          {
            id: '1a2c3b',
            player: 'test',
            flipResult: true, // winning
            payout: new BN('2')
          },
          {
            id: '2a3c4b',
            player: 'test',
            flipResult: true, // losing
            payout: new BN('0')
          }
        ]
      };
    });

    it('should add bets for all BetPlaced events', () => {
      betList.addHistory(pastEvents);
      expect(betList.bets.length).toEqual(3, 'add bets');
    });

    it('should complete all bets with BetResult events', () => {
      betList.addHistory(pastEvents);

      // new bets added to the front
      expect(betList.bets[0].status()).toEqual(BetStatus.ConfirmedAndWaitingForResult, 'confirmed');
      expect(betList.bets[1].status()).toEqual(BetStatus.Completed, 'complete');
      expect(betList.bets[2].status()).toEqual(BetStatus.Completed, 'complete');
    });

    // what about the time stamps for past events? Only have block numbers.
  });

  describe('remove', () => {
    let bet: Bet;
    beforeEach(() => {
      bet = new Bet();
      betList.bets.push(bet);
    });

    it('should remove the bet', () => {
      const result = betList.remove(bet.id());
      expect(result).toEqual(true, 'return value');
      expect(betList.bets.length).toEqual(0, 'removed');
    });

  });

});
