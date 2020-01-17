const BN = web3.utils.BN
const truffleAssert = require('truffle-assertions');
const PlaceCoinFlipBet = artifacts.require('PlaceCoinFlipBet');

contract('PlaceCoinFlipBet', async function (accounts) {

    describe('init', async function () {
        let deployedContract;
        before(async function () {
            deployedContract = await PlaceCoinFlipBet.deployed();
        });

        it('should have an initial balance of 1 ether in both the variable and blockchain', async function () {
            const expectedValue = web3.utils.toWei(new BN('1'), 'ether');
            const propValue = await deployedContract.balance.call();
            const contractValue = await web3.eth.getBalance(deployedContract.address);
            // console.log(`Expected: ${expectedValue.toString(10)}, property: ${propValue.toString(10)}, contract: ${contractValue.toString(10)}`);

            assert.equal(contractValue.toString(10), expectedValue.toString(10), 'initial contract balance should be 1 ether');
            assert.equal(propValue.toString(10), expectedValue.toString(), 'inital balance property should be 1 ether');
        });
    });

    let contractInstance;
    beforeEach(async function () {
        // note: the contract instance from new() does not get the migration script applied to it!
        contractInstance = await PlaceCoinFlipBet.new();
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

        async function testAdd(expectedBalBefore, amount) {
            const balBefore = await contractInstance.balance.call();
            const contractBalBefore = await web3.eth.getBalance(contractInstance.address);
            assert.equal(balBefore.toString(10), expectedBalBefore.toString(10), 'balance property incorrect before');
            assert.equal(contractBalBefore.toString(10), expectedBalBefore.toString(10), 'contract balance incorrect before');

            await contractInstance.addFunds({ value: amount.toString(10) });

            const expectedBalAfter = balBefore.add(new BN(amount));
            const balAfter = await contractInstance.balance.call();
            const contractBalAfter = await web3.eth.getBalance(contractInstance.address);
            assert.equal(balAfter.toString(10), expectedBalAfter.toString(10), 'did NOT increase balance property');
            assert.equal(contractBalAfter.toString(10), expectedBalAfter.toString(10), 'did NOT increase contract balance');
        }

        it('should increase the contract balance by the provided amount', async function () {
            const amount = web3.utils.toWei(new BN(100), 'milli');
            await testAdd(new BN(0), amount);
            await testAdd(new BN(amount), amount);
        });

        it('should REVERT if the sender is NOT the contract owner', async function () {
            await truffleAssert.fails(
                contractInstance.addFunds({ value: 1000, from: accounts[1] }),
                truffleAssert.ErrorType.REVERT
            );
        });
    });

    describe('Withdraw funds', function () {

        let initAmount;
        let withdrawAmt;
        let expectedBal;
        beforeEach(async function () {
            initAmount = web3.utils.toWei(new BN('1'), 'ether');
            withdrawAmt = web3.utils.toWei(new BN('100'), 'milli');
            expectedBal = initAmount.clone().sub(withdrawAmt);

            await contractInstance.addFunds({ value: initAmount.toString(10) });
            const bal = await contractInstance.balance.call();
            assert.equal(bal.toString(10), initAmount.toString(10), 'init balance not 1 ether');
        });


        it('should send the requested amount to the owner', async function() {
            const ownerBalBefore = await web3.eth.getBalance(accounts[0]);
            await contractInstance.withdrawFunds(withdrawAmt);

            const newOwnerBal = new BN(await web3.eth.getBalance(accounts[0]));
            const contractBalance = new BN(await web3.eth.getBalance(contractInstance.address));
            assert(newOwnerBal.gt(ownerBalBefore), 'funds not sent to owner');
            assert.equal(contractBalance.toString(10), expectedBal.toString(10), 'contract balance not updated');
        });

        it('should debit the balance', async function() {            
            await contractInstance.withdrawFunds(withdrawAmt);

            const newBalance = await contractInstance.balance.call();            
            assert.equal(newBalance.toString(10), expectedBal.toString(10), 'balance property not updated');            
        });

        it('should REVERT if the requested amount is greater than the contract balance', async function () {
            truffleAssert.fails(
                contractInstance.withdrawFunds(web3.utils.toWei('2', 'ether')),
                truffleAssert.ErrorType.REVERT
            );
        });

        it('should REVERT if the sender is NOT the owner', async function () {
            truffleAssert.fails(
                contractInstance.withdrawFunds(1000, { from: accounts[1] }),
                truffleAssert.ErrorType.REVERT
            );
        });
    });
});
