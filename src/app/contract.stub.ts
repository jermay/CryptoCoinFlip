import BN from 'bn.js';
import { Options, DeployOptions, ContractSendMethod, SendOptions, EventData, EventOptions, PastEventOptions } from 'web3-eth-contract';
import { BlockNumber, Common, hardfork, chain } from 'web3-core';

import { Contract } from './contract';

export class ContractStub implements Contract {

    _minBet = new BN('10000000000000000');
    balances = {
        player: new BN('0'),
        owner: new BN('1000000000000000000'),
    };
    bets = {};
    nextBetResult = false;
    nextBetRusultError: any = undefined;
    nextBetId = 0;

    constructor() { }

    defaultAccount: string | null;
    defaultBlock: BlockNumber;
    defaultCommon: Common;
    defaultHardfork: hardfork;
    defaultChain: chain;
    transactionPollingTimeout: number;
    transactionConfirmationBlocks: number;
    transactionBlockTimeout: number;

    options: Options;

    clone(): Contract { return this; }

    deploy(options: DeployOptions): ContractSendMethod { return undefined; };

    deposit(amount: BN): Promise<any> {
        this.balances.player = this.balances.player.add(amount);
        return this.createTxObj(this.balances.player);
    };

    withdraw(amount: BN): Promise<any> {
        this.balances.player = this.balances.player.sub(amount);
        return this.createTxObj(this.balances.player);
    };

    getMyBalance(): Promise<BN> {
        return this.createTxObj(this.balances.player);
    };

    minBet(): Promise<BN> {
        return this.createTxObj(this._minBet);
    };

    maxBet(): Promise<BN> {
        return this.createTxObj(this.balances.owner.clone().div(new BN('100')));
    };

    placeBet(betOn: boolean, amount: BN): any {
        this.nextBetId++;
        const testBetPlacedEvent = {
            id: this.nextBetId.toString(),
            returnValues: {
                id: this.nextBetId.toString(),
                player: 'testplayer',
                amount: amount,
                betOn: betOn
            }
        };
        const testBetResultEvent = {
            id: this.nextBetId.toString(),
            returnValues: {
                id: this.nextBetId.toString(),
                flipResult: this.nextBetResult,
                payout: betOn == this.nextBetResult ? amount.mul(new BN('2')) : new BN('0')
            }
        };
        this.emitTestBetPlacedEvent(
            this.nextBetRusultError,
            testBetPlacedEvent  
        );
        this.emitTestBetResultEvent(
            this.nextBetRusultError,
            testBetPlacedEvent
        );

        const response = {
            events: {
                BetPlaced: testBetPlacedEvent,
                BetResult: testBetResultEvent
            }
        };
        return this.createTxObj(response);
    };

    createTxObj(value: any): any {
        return {
            send: (options?: SendOptions) => Promise.resolve(value),
            call: (options?: SendOptions) => Promise.resolve(value),
        }
    }

    methods = {
        deposit: this.deposit.bind(this),
        withdraw: this.withdraw.bind(this),
        getMyBalance: this.getMyBalance.bind(this),
        minBet: this.minBet.bind(this),
        maxBet: this.maxBet.bind(this),
        placeBet: this.placeBet.bind(this),
    };

    once(
        event: string,
        options: EventOptions,
        callback: (error: Error, event: EventData) => void
    ): void { }

    events = {
        BetPlaced: (filter, callback) => {
            if (callback) {
            this.betPlacedEventSubs.push(callback);
            }
            return this.createEventObj(this.betPlacedEventEmitterSubs);
        },
        BetResult: (filter, callback) => {
            if (callback) {
                this.betResultEventSubs.push(callback);
            }
            return this.createEventObj(this.betResultEventEmitterSubs);
        },
    };
    betPlacedEventSubs = [];
    betPlacedEventEmitterSubs = [];
    betResultEventSubs = [];
    betResultEventEmitterSubs = [];

    createEventObj(subList: any[]) {
        return {
            on: (eventType: string, callback: any) => {
                subList.push({ eventType: eventType, callback: callback });
            }
        };
    }

    emitTestBetPlacedEvent(error: any, data: any) {
        this.betPlacedEventSubs.forEach(callback => callback(error, data));
        this.betPlacedEventEmitterSubs.forEach(sub => {
            if (error && sub.eventType == 'error') {
                sub.callback(error);
            } else {
                sub.callback(data);
            }
        });
    }

    emitTestBetResultEvent(error: any, data: any) {
        this.betResultEventSubs.forEach(callback => callback(error, data));
        this.betResultEventEmitterSubs.forEach(sub => {
            if (error && sub.eventType == 'error') {
                sub.callback(error);
            } else {
                sub.callback(data);
            }
        });
    }

    pastEvents = {
        BetPlaced: [],
        BetResult: [],
    };

    getPastEvents(
        event: string,
        options?: PastEventOptions,
        callback?: (error: Error, event: EventData) => void
    ): Promise<EventData[]> {
        let events = this.pastEvents[event];
        if (callback) {
            callback(undefined, events);
        }
        return Promise.resolve(events);
    }
}