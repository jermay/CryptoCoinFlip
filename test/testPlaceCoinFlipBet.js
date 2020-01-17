const truffleAssert = require('truffle-assertions');
const PlaceCoinFlipBet = artifacts.require('PlaceCoinFlipBet');

contract('PlaceCoinFlipBet', async function () {
    let contractInstance;

    beforeEach(async function () {
        contractInstance = PlaceCoinFlipBet.new();
    });

    describe('init', function () {
        it('should have an initial balance of 10 ether in both the variable and blockchain');
        it('should have the psudo random coin flip contract address set by default');
    });

    describe('Place bet', function () {
        it('should get the coin toss result from the CoinFlip contract');
        describe('On winning result', function () {
            it('should emit a winning BetResult event with a 2x positive payout');
            it('should send 2x the bet amount to the better and debit the contract balance');
            it('should REVERT if there is not enough funds to cover the winnings');
        });
        describe('On losing result', function () {
            it('should emit a losing BetResult event with a negative payout');
            it('should add the bet to the contract balance');
        });
    });

    //  not sure if this is needed
    // describe('coin flip algo', function() {        
    //     it('should set the address of the coin flipping contract');
    // });

    describe('Add funds', function () {
        it('should increase the contract balance by the provided amount');
        it('should REVERT if the sender is NOT the contract owner');
    });

    describe('Withdraw funds', function () {
        it('should send the requested amount to the owner and debit the balance');
        it('should REVERT if the requested amount is greater than the contract balance');
        it('should REVERT if the sender is NOT the owner');
    });
});
