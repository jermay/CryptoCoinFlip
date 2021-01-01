import BN from 'bn.js';
import { ContractStub } from "./contract.stub";

describe('ContractStub', () => {
    let contract: ContractStub;
    beforeEach(() => {
        contract = new ContractStub();
    });

    it('should create', () => {
        expect(contract).toBeTruthy();
    });

    describe('events', () => {
        let callCount: number;
        let directCallback;
        let emitterCallback;
        let exampleSubs;
        let player1;
        let player2;
        let exampleEvents;
        beforeEach(() => {
            callCount = 0;
            directCallback = (error: any, event: any) => callCount++;
            emitterCallback = (event: any) => callCount++;

            exampleSubs = [
                { // 0
                    event: 'BetPlaced',
                    type: 'direct',
                    options: { filter: { fromBlock: 0 } },
                    callback: directCallback
                },
                { // 1
                    event: 'BetResult',
                    type: 'direct',
                    options: { filter: { fromBlock: 0 } },
                    callback: directCallback
                },
                { // 2
                    event: 'BetResult',
                    type: 'data',
                    options: { filter: { fromBlock: 0 } },
                    callback: emitterCallback
                },
                { // 3
                    event: 'BetPlaced',
                    type: 'data',
                    options: { filter: { fromBlock: 0 } },
                    callback: emitterCallback
                },
                { // 4
                    event: 'BetResult',
                    type: 'error',
                    options: { filter: { fromBlock: 0 } },
                    callback: emitterCallback
                },
            ];

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
        });

        describe('subscription', () => {

            it('should store the callback when given a subscription directly (case BetPlaced)', () => {
                const expectedSub = exampleSubs[0];
                contract.events.BetPlaced(expectedSub.filter, expectedSub.callback);

                expect(contract.eventSubs.length).toEqual(1, 'direct BetPlaced');

                let sub = contract.eventSubs[0];
                expect(sub.event).toEqual(expectedSub.event, 'event');
                expect(sub.type).toEqual(expectedSub.type, 'type');
                expect(sub.options).toEqual(expectedSub.filter, 'filter');
                expect(sub.callback).toEqual(expectedSub.callback, 'callback');
            });

            it('should store the callback when given a subscription directly (case BetResult)', () => {
                const expectedSub = exampleSubs[1];
                contract.events.BetResult(expectedSub.filter, expectedSub.callback);

                expect(contract.eventSubs.length).toEqual(1, 'direct BetResult');

                let sub = contract.eventSubs[0];
                expect(sub.event).toEqual(expectedSub.event, 'event');
                expect(sub.type).toEqual(expectedSub.type, 'type');
                expect(sub.options).toEqual(expectedSub.filter, 'filter');
                expect(sub.callback).toEqual(expectedSub.callback, 'callback');
            });

            it('should return an event emitter object', () => {
                const expectedSub = exampleSubs[2];
                const result = contract.events.BetResult(
                    expectedSub.options, undefined);

                expect(Object.keys(result)).toContain('on', 'on');

                result.on('data', expectedSub.callback);
                expect(contract.eventSubs.length).toEqual(1, 'on data');

                let sub = contract.eventSubs[0];
                expect(sub.event).toEqual(expectedSub.event, 'event');
                expect(sub.type).toEqual(expectedSub.type, 'type');
                expect(sub.options).toEqual(expectedSub.options, 'filter');
                expect(sub.callback).toEqual(expectedSub.callback, 'callback');
            });
        });

        describe('emmitting events', () => {
            beforeEach(() => {
                contract.eventSubs = exampleSubs;
            });

            it('should execute the callbacks for the proper event name (case BetPlaced)', () => {
                const eventData = {
                    event: 'BetPlaced',
                    blockNumber: 1,
                    returnValues: {
                        id: '1a2c3b',
                        player: 'test',
                        amount: new BN('1'),
                        betOn: true
                    }
                };
                contract.emitEvent('BetPlaced', null, eventData);

                expect(callCount).toEqual(2);
            });

            it('should execute the callbacks for the proper event name (case BetResult)', () => {
                const eventData = {
                    event: 'BetResult',
                    blockNumber: 2,
                    returnValues: {
                        id: '1a2c3b',
                        player: 'test',
                        flipResult: true,
                        payout: new BN('1'),

                    }
                };
                contract.emitEvent('BetResult', null, eventData);

                expect(callCount).toEqual(3);
            });

            it('on error it should not call sub type data', () => {
                const eventData = {
                    event: 'BetResult',
                    blockNumber: 3,
                    returnValues: null
                };
                const error = 'test error';

                contract.emitEvent('BetResult', error, eventData);

                expect(callCount).toEqual(2);
            });

            describe('filtering', () => {
                beforeEach(() => {
                    contract.eventSubs = [];
                    contract.pastEvents = exampleEvents;
                });

                it('should filter events by block number', () => {
                    const tooEarly = exampleEvents[1];
                    const eventData = exampleEvents[3];

                    contract.events.BetResult({ filter: { fromBlock: 3 } }, directCallback);
                    expect(contract.eventSubs.length).toEqual(1, 'precondition subbed');

                    contract.emitEvent(eventData.event, null, eventData);
                    expect(callCount).toEqual(1, 'after filter block');

                    callCount = 0;
                    contract.emitEvent(tooEarly.event, null, tooEarly);
                    expect(callCount).toEqual(0, 'before filter block');
                });

                it('should filter events by player address', () => {
                    const p1Data = exampleEvents[0];
                    const p2Data = exampleEvents[2];

                    contract.events.BetPlaced({ filter: { player: p1Data.returnValues.player } }, directCallback);
                    expect(contract.eventSubs.length).toEqual(1, 'precondition subbed');

                    contract.emitEvent(p1Data.event, null, p1Data);
                    expect(callCount).toEqual(1, 'correct player');

                    callCount = 0;
                    contract.emitEvent(p2Data.event, null, p2Data);
                    expect(callCount).toEqual(0, 'wrong player');
                });

                it('should filter events by queryId', () => {
                    const tooEarly = exampleEvents[1];
                    const eventData = exampleEvents[3];

                    contract.events.BetResult({ filter: { id: eventData.returnValues.id } }, directCallback);
                    expect(contract.eventSubs.length).toEqual(1, 'precondition subbed');

                    contract.emitEvent(eventData.event, null, eventData);
                    expect(callCount).toEqual(1, 'exact id');

                    callCount = 0;
                    contract.emitEvent(tooEarly.event, null, tooEarly);
                    expect(callCount).toEqual(0, 'wrong id');
                });
            });
        });

        describe('past events', () => {
            beforeEach(() => {
                contract.eventSubs = [];
                contract.pastEvents = exampleEvents;
            });

            it('should return events only of that name', async () => {
                const result = await contract.getPastEvents('BetPlaced', null, null);

                expect(result.length).toEqual(2);
                result.forEach(event => expect(event.event).toEqual('BetPlaced'));
            });

            describe('filtering', () => {

                it('should filer by block number', async () => {
                    const options = { filter: { fromBlock: 3 } };
                    const result = await contract.getPastEvents(
                        'BetResult', options, null);

                    expect(result.length).toEqual(1);
                    result.forEach(event => {
                        expect(event.event).toEqual('BetResult');
                        expect(event.blockNumber).toBeGreaterThanOrEqual(options.filter.fromBlock, 'fromBlock');
                    });
                });

                it('should filter by player address', async () => {
                    const options = { filter: { player: player1 } };
                    const result = await contract.getPastEvents(
                        'BetResult', options, null);

                    expect(result.length).toEqual(1);
                    result.forEach(event => {
                        expect(event.event).toEqual('BetResult');
                        expect(event.returnValues.player).toEqual(options.filter.player, 'player');
                    });
                });

                it('should filter by queryId', async () => {
                    const expectedId = exampleEvents[1].returnValues.id;
                    const options = { filter: { id: expectedId } };
                    const result = await contract.getPastEvents(
                        'BetResult', options, null);

                    expect(result.length).toEqual(1);
                    result.forEach(event => {
                        expect(event.event).toEqual('BetResult');
                        expect(event.returnValues.id).toEqual(expectedId, 'player');
                    });
                });
            });
        });
    });
});