import BN from 'bn.js';

export interface BetPlacedEvent {
    id: string;
    player: string;
    amount: BN;
    betOn: boolean;
}
