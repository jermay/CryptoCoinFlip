import BN from 'bn.js';

export interface BetResultEvent {
    id: string;
    flipResult: boolean
    payout: BN;
}
