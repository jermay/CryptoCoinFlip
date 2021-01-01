import { Options, DeployOptions, ContractSendMethod, EventData, EventOptions, PastEventOptions } from 'web3-eth-contract';
import { BlockNumber, Common, hardfork, chain } from 'web3-core';

export interface Contract {

    defaultAccount: string | null;
    defaultBlock: BlockNumber;
    defaultCommon: Common;
    defaultHardfork: hardfork;
    defaultChain: chain;
    transactionPollingTimeout: number;
    transactionConfirmationBlocks: number;
    transactionBlockTimeout: number;

    options: Options;

    clone(): Contract;

    deploy(options: DeployOptions): ContractSendMethod;

    methods: any;

    once(
        event: string,
        options?: EventOptions,
        callback?: (error: Error, event: EventData) => void
    ): void;

    events: any;

    getPastEvents(
        event: string,
        options?: PastEventOptions,
        callback?: (error: Error, event: EventData) => void
    ): Promise<EventData[]>;
}
