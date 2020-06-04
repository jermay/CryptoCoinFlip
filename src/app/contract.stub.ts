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
        this.emitTestBetPlacedEvent(
            this.nextBetRusultError,
            {
                returnValues: {
                    id: this.nextBetId.toString(),
                    player: 'testplayer',
                    amount: amount,
                    betOn: betOn
                }
            }
        );
        this.emitTestBetResultEvent(
            this.nextBetRusultError,
            {
                returnValues: {
                    id: this.nextBetId.toString(),
                    flipResult: this.nextBetResult,
                    payout: betOn == this.nextBetResult ? amount.mul(new BN('2')) : new BN('0')
                }
            }
        );

        return this.createTxObj(true);
    };

    createTxObj(value: any): any {
        return {
            send: (options: SendOptions) => Promise.resolve(value),
            call: (options: SendOptions) => Promise.resolve(value),
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
        BetPlaced: (filter, callback) => this.betPlacedEventSubs.push(callback),
        BetResult: (filter, callback) => this.betResultEventSubs.push(callback),
    };
    betPlacedEventSubs = [];
    betResultEventSubs = [];

    emitTestBetPlacedEvent(error: any, data: any) {
        this.betPlacedEventSubs.forEach(callback => callback(error, data));
    }

    emitTestBetResultEvent(error: any, data: any) {
        this.betResultEventSubs.forEach(callback => callback(error, data));
    }

    getPastEvents(
        event: string,
        options: PastEventOptions,
        callback: (error: Error, event: EventData) => void
    ): Promise<EventData[]> {
        return Promise.resolve(undefined);
    }
}