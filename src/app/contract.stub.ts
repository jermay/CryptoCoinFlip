import BN from 'bn.js';
import { Options, DeployOptions, ContractSendMethod, SendOptions, EventData, EventOptions, PastEventOptions } from 'web3-eth-contract';
import { BlockNumber, Common, hardfork, chain } from 'web3-core';

import { Contract } from './contract';

export class ContractStub implements Contract {

    // set _error to a value to make transaction fail
    _error: any = undefined;

    _minBet = new BN('10000000000000000');
    balances = {
        player: new BN('0'),
        owner: new BN('1000000000000000000'),
    };
    bets = {};
    nextBetResult = false;
    nextBetRusultError: any = undefined;
    nextBetId = 0;
    _owner: string;

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
        const playerAddress = 'testplayer';
        const testBetPlacedEvent = {
            id: this.nextBetId.toString(),
            event: 'BetPlaced',
            blockNumber: 1,
            returnValues: {
                id: this.nextBetId.toString(),
                player: playerAddress,
                amount: amount,
                betOn: betOn
            }
        };
        const testBetResultEvent = {
            id: this.nextBetId.toString(),
            event: 'BetResult',
            blockNumber: 2,
            returnValues: {
                id: this.nextBetId.toString(),
                player: playerAddress,
                flipResult: this.nextBetResult,
                payout: betOn == this.nextBetResult ? amount.mul(new BN('2')) : new BN('0')
            }
        };
        this.emitEvent(
            'BetPlaced',
            this.nextBetRusultError,
            testBetPlacedEvent
        );
        this.emitEvent(
            'BetResult',
            this.nextBetRusultError,
            testBetResultEvent
        );

        const response = {
            events: {
                BetPlaced: testBetPlacedEvent,
                BetResult: testBetResultEvent
            }
        };
        return this.createTxObj(response);
    };

    owner(): Promise<string> {
        return this.createTxObj(this._owner);
    }

    destroy(): Promise<any> {
        return this.createTxObj('kaboom!');
    }

    createTxObj(value: any): any {
        let txObj: any;
        if (this._error) {
            txObj = {
                send: (options?: SendOptions) => Promise.reject(this._error),
                call: (options?: SendOptions) => Promise.reject(this._error),
            }
        } else {
            txObj = {
                send: (options?: SendOptions) => Promise.resolve(value),
                call: (options?: SendOptions) => Promise.resolve(value),
            }
        }
        return txObj;
    }

    methods = {
        owner: this.owner.bind(this),
        deposit: this.deposit.bind(this),
        withdraw: this.withdraw.bind(this),
        getMyBalance: this.getMyBalance.bind(this),
        minBet: this.minBet.bind(this),
        maxBet: this.maxBet.bind(this),
        placeBet: this.placeBet.bind(this),
        destroy: this.destroy.bind(this),
    };

    once(
        event: string,
        options: EventOptions,
        callback: (error: Error, event: EventData) => void
    ): void { }

    events = {
        BetPlaced: (
            options: EventOptions,
            callback: (error: Error, event: EventData) => void
        ) => {
            if (callback) {
                this.eventSubs.push({
                    event: 'BetPlaced',
                    type: 'direct',
                    options: options,
                    callback: callback
                });
            }
            return this.createEventObj(this.eventSubs, 'BetPlaced', options);
        },
        BetResult: (
            options: EventOptions,
            callback: (error: Error, event: EventData) => void
        ) => {
            if (callback) {
                this.eventSubs.push({
                    event: 'BetResult',
                    type: 'direct',
                    options: options,
                    callback: callback
                });
            }
            return this.createEventObj(this.eventSubs, 'BetResult', options);
        },
    };

    eventSubs: EventSub[] = [];

    createEventObj(subList: any[], event: string, options: EventOptions) {
        return {
            on: (eventType: string, callback: any) => {
                subList.push({ event: event, type: eventType, options: options, callback: callback });
            }
        };
    }

    emitEvent(name: string, error: any, data: any) {
        this.eventSubs
            .filter(sub => sub.event === name)
            .filter(sub => this.filterEvent(name, sub.options, data))
            .forEach(sub => {
                switch (sub.type) {
                    case 'direct':
                        sub.callback(error, data);
                        break;
                    case 'data':
                        if (!error) sub.callback(data);
                        break;
                    case 'error':
                        sub.callback(error);
                        break;

                    default:
                        throw new Error('unknown sub event type');
                }
            });
    }

    filterEvent(name: string, options: EventOptions, event: any): boolean {
        if (name != event.event) {
            // console.log('filter event: name failed');
            return false;
        }
        if (!options || !options.filter || !event.returnValues) {
            return true;
        }
        for (let key in options.filter) {
            // console.log('filter key: ', key, 'filter value: ', options.filter[key], 'event value', event[key], 'event', event);
            if (key == 'fromBlock') {
                if (event.blockNumber < options.filter.fromBlock) {
                    // console.log('filter event: fromBlock failed');
                    return false;
                }
            } else if (key === 'toBlock') {
                if (options.filter.toBlock !== 'latest'
                    && options.filter.toBlock < event.blockNumber) {
                    // console.log('filter event: toBlock failed');
                    return false;
                }
            } else if (event.returnValues[key] != options.filter[key]) {
                // console.log(`filter event: key ${key} failed`);
                return false;
            }
        }
        return true;
    }

    pastEvents: any = [];

    getPastEvents(
        event: string,
        options?: PastEventOptions,
        callback?: (error: Error, event: EventData) => void
    ): Promise<EventData[]> {
        let events = this.pastEvents
            .filter(e => this.filterEvent(event, options, e));
        if (callback) {
            callback(undefined, events);
        }
        return Promise.resolve(events);
    }
}

interface EventSub {
    event: string
    type: string
    options: EventOptions
    callback: any
};