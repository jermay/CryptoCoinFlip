import BN from 'bn.js';

export interface BetResultEvent {
    id: string;
    player: string;
    flipResult: boolean
    payout: BN;
}
