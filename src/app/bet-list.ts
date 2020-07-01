import { Bet } from './bet';
import { BetPlacedEvent } from './bet-placed-event';
import { BetResultEvent } from './bet-result-event';

export class BetList {
    bets: Bet[] = [];

    newBet(): Bet {
        let bet = new Bet();
        this.bets.unshift(bet);
        return bet;
    }

    confirmBet(id: number, betPlacedEvent: BetPlacedEvent): boolean {
        if (!betPlacedEvent) {
            return false;
        }
        let bet = this.findBetById(id)
        if (!bet) {
            console.log(`bet not found. id: ${id}`);
            return false;
        }

        bet.confirm(betPlacedEvent);
        return true;
    }

    addResult(betResultEvent: BetResultEvent): boolean {
        if (!betResultEvent) {
            return false;
        }
        let bet = this.findBetByEventId(betResultEvent.id);
        if (!bet) {
            console.log('bet not found. BetResultEvent: ', betResultEvent);
            return false;
        }
        bet.addResult(betResultEvent);
        return true;
    }

    findBetById(id: number): Bet {
        return this.bets.find(b => b.id() === id);
    }

    findBetByEventId(id: string): Bet {
        return this.bets.find(b => b.eventId() === id);
    }

    addHistory(eventData: { BetPlaced: BetPlacedEvent[], BetResult: BetResultEvent[] }) {
        eventData.BetPlaced.forEach(betPlacedEvent => {
            let bet = this.newBet();
            this.confirmBet(bet.id(), betPlacedEvent);
        });
        eventData.BetResult.forEach(betResultEvent => {
            this.addResult(betResultEvent);
        });
    }

    remove(id: number): boolean {
        let i = this.bets.findIndex(bet => bet.id() === id);
        if (i >= 0) {
            this.bets.splice(i, 1);
        }
        return true;
    }
}
