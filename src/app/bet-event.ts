import BN from 'bn.js';

export interface BetEvent {
    id: BN,
    player: string,
    amount: BN,
    betOn: boolean,
    flipResult: boolean
    payout: BN
}
