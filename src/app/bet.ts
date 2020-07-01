import BN from 'bn.js';
import { BetPlacedEvent } from './bet-placed-event';
import { BetResultEvent } from './bet-result-event';
import { HeadsOrTails } from './heads-or-tails';

export class Bet {
    // sequence counter
    private static _nextId = 0;

    private _id: number;
    private _timePlaced: Date;
    private _timeConfirmed: Date;
    private _timeResult: Date;
    private _betPlacedEvent: BetPlacedEvent = undefined;
    private _betResultEvent: BetResultEvent = undefined;
    private _betOn: HeadsOrTails;
    private _flipResult: HeadsOrTails;

    constructor() {
        this._id = Bet.nextId();
        this._timePlaced = new Date();
    }

    private static nextId(): number {
        return ++Bet._nextId;
    }

    id(): number {
        return this._id;
    }

    confirm(betPlaced: BetPlacedEvent) {
        this._timeConfirmed = new Date();
        this._betPlacedEvent = betPlaced;
        this._betOn = new HeadsOrTails(betPlaced.betOn);
    }

    isConfirmed(): boolean {
        return this._betPlacedEvent != undefined;
    }

    player(): string {
        if (this.isConfirmed()) {
            return this._betPlacedEvent.player;
        }
        return undefined;
    }

    on(): HeadsOrTails {
        if (this.isConfirmed()) {
            return this._betOn
        }
        return undefined;
    }

    eventId(): string {
        if (this.isConfirmed()) {
            return this._betPlacedEvent.id;
        }
        return '';
    }

    timePlaced(): Date {
        return this._timePlaced;
    }

    timeConfirmed(): Date {
        return this._timeConfirmed;
    }

    timeResult(): Date {
        return this._timeResult;
    }

    amount(): BN {
        if (this.isConfirmed()) {
            return this._betPlacedEvent.amount;
        }
        return new BN('0');
    }

    addResult(result: BetResultEvent) {
        this._timeResult = new Date();
        this._betResultEvent = result;
        this._flipResult = new HeadsOrTails(result.flipResult);
    }

    flipResult(): HeadsOrTails {
        if (this.isComplete()) {
            return this._flipResult;
        }
        return undefined;
    }

    isComplete(): boolean {
        return this._betResultEvent != undefined;
    }

    payout(): BN {
        if (this.isComplete()) {
            return this._betResultEvent.payout;
        }
        return undefined;
    }

    isWinner(): boolean {
        return this.isComplete()
            && this.on().getValBool() === this._betResultEvent.flipResult;
    }

    status(): BetStatus {
        if (this.isComplete()) {
            return BetStatus.Completed;
        } else if (this.isConfirmed()) {
            return BetStatus.ConfirmedAndWaitingForResult;
        }
        return BetStatus.Unconfirmed;
    }
}

export enum BetStatus {
    Unconfirmed = 'Unconfirmed',
    ConfirmedAndWaitingForResult = 'Confirmed: Waiting for Result',
    Completed = 'Completed'
}
