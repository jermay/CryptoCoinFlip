import BN from 'bn.js';
import { Bet, BetStatus } from './bet';
import { BetPlacedEvent } from './bet-placed-event';
import { BetResultEvent } from './bet-result-event';

describe('Bet', () => {
  let bet: Bet;
  let expectedBetPlacedEvent: BetPlacedEvent;
  let expectedBetResultEvent: BetResultEvent;
  beforeEach(() => {
    bet = new Bet();
    expectedBetPlacedEvent = {
      id: '1',
      player: '2',
      amount: new BN('3'),
      betOn: true
    };
  });

  it('should create an instance', () => {
    expect(bet).toBeTruthy();
  });

  it('should init', () => {
    expect(bet.id()).toBeGreaterThan(0, 'id');
    expect(bet.timePlaced()).toBeDefined('timePlaced');
    expect(bet.timeResult()).toBeFalsy('timeResult');
    expect(bet.eventId()).toBeFalsy('event id');
    expect(bet.isComplete()).toEqual(false, 'isComplete');
    expect(bet.isWinner()).toEqual(false, 'isWinner');
    expect(bet.status()).toEqual(BetStatus.Unconfirmed, 'status');
  });

  describe('on confirmation', () => {

    it('isConfirmed should be TRUE', () => {
      bet.confirm(expectedBetPlacedEvent);
      expect(bet.isConfirmed()).toEqual(true);
    });

    it('should have status confirmed', () => {
      bet.confirm(expectedBetPlacedEvent);
      expect(bet.status()).toEqual(BetStatus.ConfirmedAndWaitingForResult);
    });

    it('should have an event ID', () => {
      bet.confirm(expectedBetPlacedEvent);
      expect(bet.eventId()).toEqual(expectedBetPlacedEvent.id);
    });

    it('should return what was bet on', () => {
      bet.confirm(expectedBetPlacedEvent);
      expect(bet.on()).toBeDefined();
      expect(bet.on().getValBool()).toEqual(expectedBetPlacedEvent.betOn);
    });

    it('amount should return the bet amount', () => {
      bet.confirm(expectedBetPlacedEvent);
      expect(bet.amount()).toEqual(expectedBetPlacedEvent.amount);
    });

    it('isComplete should be false', () => {
      bet.confirm(expectedBetPlacedEvent);
      expect(bet.isComplete()).toEqual(false);
    });
  });

  describe('on result', () => {
    beforeEach(() => {
      expectedBetResultEvent = {
        id: expectedBetPlacedEvent.id,
        flipResult: true,
        payout: expectedBetPlacedEvent.amount.clone().mul(new BN('2'))
      }
      bet.confirm(expectedBetPlacedEvent);
    });

    it('should return the result', () => {
      bet.addResult(expectedBetResultEvent);
      expect(bet.flipResult().getValBool()).toEqual(expectedBetResultEvent.flipResult);
    });
    it('isComplete should be true', () => {
      bet.addResult(expectedBetResultEvent);
      expect(bet.isComplete()).toEqual(true);
    });

    it('should have a status of complete', () => {
      bet.addResult(expectedBetResultEvent);
      expect(bet.status()).toEqual(BetStatus.Completed);
    });

    it('should return the payout', () => {
      bet.addResult(expectedBetResultEvent);
      expect(bet.payout()).toEqual(expectedBetResultEvent.payout);
    });

    describe('on winning result', () => {
      it('isWinner should return TRUE', () => {
        bet.addResult(expectedBetResultEvent);
        expect(bet.isWinner()).toEqual(true);
      });
    });

    describe('on losing result', () => {
      beforeEach(() => {
        expectedBetResultEvent = {
          id: expectedBetPlacedEvent.id,
          flipResult: false,
          payout: new BN('0')
        }
      });

      it('isWinner should return FALSE', () => {
        bet.addResult(expectedBetResultEvent);
        expect(bet.isWinner()).toEqual(false);
      });
    });
  });

});
