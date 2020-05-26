const truffleAssert = require('truffle-assertions');
const BN = web3.utils.BN
// const sinon = require('sinon');

const PlaceCoinFlipBet = artifacts.require('PlaceCoinFlipBet');
const TestPlaceCoinFlipBet = artifacts.require('TestPlaceCoinFlipBet');

contract('PlaceCoinFlipBet', async function (accounts) {

    let contractInstance;
    beforeEach(async function () {
        // note: the contract instance from new() does not get the migration script applied to it!
        contractInstance = await TestPlaceCoinFlipBet.new();
        // console.log(contractInstance);
    });

    afterEach(async function () {
        await contractInstance.destroy();
    });

    describe('init', async function () {
        let deployedContract;
        before(async function () {
            deployedContract = await PlaceCoinFlipBet.deployed();
        });

        it('should have an initial balance of 1 ether in both the variable and blockchain', async function () {
            const expectedValue = web3.utils.toWei(new BN('1'), 'ether');
            const propValue = await deployedContract.balance.call();
            const contractValue = await web3.eth.getBalance(deployedContract.address);

            assert.equal(contractValue.toString(10), expectedValue.toString(10), 'initial contract balance should be 1 ether');
            assert.equal(propValue.toString(10), expectedValue.toString(), 'inital balance property should be 1 ether');
        });
    });

    describe('bet amount', function () {
        beforeEach(async function() {
            await contractInstance.addFunds({value: web3.utils.toWei('1', 'ether')});
        })
        it('should return the maximum allowed bet as 1% of the contract balance', async function() {
            const contractBalance = await contractInstance.balance();
            const expected = contractBalance.div(new BN('100'));

            const result = await contractInstance.maxBet();

            assert.equal(result.toString(10), expected.toString(10), 'invalid max bet');
        });

        it('should return the minimum bet as 1 milli ether', async function() {
            const expected = web3.utils.toWei(new BN('1'), 'milli');
            const result = await contractInstance.minBet();

            assert.equal(result.toString(10), expected.toString(10), 'invalid min bet');
        });
    });

    describe('Place bet', function () {

        let betAmount;
        let betOn;
        beforeEach(async function () {
            await contractInstance.addFunds({ value: web3.utils.toWei(new BN('1'), 'ether') });
            betAmount = web3.utils.toWei(new BN('10'), 'milli');
            betOn = true;
        });

        it('should REVERT if the player bet is above the max allowable bet', async function() {
            betAmount = web3.utils.toWei(new BN('20'), 'milli');
            const bal = await contractInstance.balance();
            const maxBet = await contractInstance.maxBet();
            assert(betAmount.gt(maxBet), 'precondition failed: bet is too small');
            assert(betAmount.lt(bal), 'precondition failed: bet is more than contract balance');

            truffleAssert.reverts(
                contractInstance.placeBet(betOn, { from: accounts[1], value: betAmount }));
        });

        it('should REVERT if the player bet is below the min allowable bet', async function() {
            betAmount = web3.utils.toWei(new BN('20'), 'micro');
            const minBet = await contractInstance.minBet();
            assert(betAmount.lt(minBet), 'precondition failed: bet too big');

            truffleAssert.reverts(
                contractInstance.placeBet(betOn, { from: accounts[1], value: betAmount }));
        });

        describe('On winning result', function () {
            beforeEach(async function () {
                await contractInstance.testFlipResult.call(true);
            });

            it('should emit a winning BetResult event with a 2x positive payout', async function () {
                const expectedResult = {
                    id: new BN('1'),
                    player: accounts[1],
                    amount: betAmount,
                    betOn: betOn,
                    flipResult: betOn,
                    payout: betAmount.mul(new BN('2'))
                };
                const result = await contractInstance.placeBet(betOn, { from: accounts[1], value: betAmount });

                truffleAssert.eventEmitted(result, 'BetResult');
                truffleAssert.eventEmitted(result, 'BetResult', e => {
                    return e.id.toString(10) === expectedResult.id.toString(10)
                        && e.player === expectedResult.player
                        && e.amount.toString(10) === expectedResult.amount.toString(10)
                        && e.betOn === expectedResult.betOn
                        && e.flipResult === expectedResult.flipResult
                        && e.payout.toString(10) === expectedResult.payout.toString(10);
                }, 'event params incorrect');
            });

            it('should send 2x the bet amount to the better and debit the contract balance', async function () {
                const playerBalBefore = new BN(await web3.eth.getBalance(accounts[1]));
                const contractBalBefore = new BN(await web3.eth.getBalance(contractInstance.address));
                const expectedContractBal = contractBalBefore.sub(betAmount);

                await contractInstance.placeBet(betOn, { from: accounts[1], value: betAmount });

                const playerBalAfter = new BN(await web3.eth.getBalance(accounts[1]));
                const contractBalAfter = new BN(await web3.eth.getBalance(contractInstance.address));
                assert.equal(contractBalAfter.toString(10), expectedContractBal.toString(10), 'contract bal not updated');
                assert(playerBalAfter.gt(playerBalBefore), 'winnings not sent to player');
            });

            it('should REVERT if there is not enough funds to cover the winnings', async function () {
                const betTooBig = web3.utils.toWei(new BN('10'), 'ether');
                const contractBalBefore = new BN(await web3.eth.getBalance(contractInstance.address));
                assert(betTooBig.gt(contractBalBefore), 'precondition failed: bet not big enough');

                truffleAssert.reverts(
                    contractInstance.placeBet(betOn, { from: accounts[1], value: betTooBig }));
            });
        });

        describe('On losing result', function () {
            beforeEach(async function () {
                await contractInstance.setFlipResult(false);
                await assert(contractInstance.flipCoin(), false, 'precondition failed');
            });

            it('should emit a losing BetResult event with zero payout', async function () {
                const expectedResult = {
                    id: new BN('1'),
                    player: accounts[2],
                    amount: betAmount,
                    betOn: betOn,
                    flipResult: !betOn,
                    payout: new BN('0')
                };
                const result = await contractInstance.placeBet(betOn, { from: expectedResult.player, value: expectedResult.amount });

                truffleAssert.eventEmitted(result, 'BetResult');
                truffleAssert.eventEmitted(result, 'BetResult', e => {
                    return e.id.toString(10) === expectedResult.id.toString(10)
                        && e.player === expectedResult.player
                        && e.amount.toString(10) === expectedResult.amount.toString(10)
                        && e.betOn === expectedResult.betOn
                        && e.flipResult === expectedResult.flipResult
                        && e.payout.toString(10) === expectedResult.payout.toString(10);
                }, 'event params incorrect');
            });

            it('should add the bet to the contract balance', async function () {
                const playerBalBefore = new BN(await web3.eth.getBalance(accounts[2]));
                const contractBalBefore = new BN(await web3.eth.getBalance(contractInstance.address));
                const balancePropBefore = await contractInstance.balance();
                const expectedContractBal = contractBalBefore.add(betAmount);
                assert.equal(contractBalBefore.toString(10), balancePropBefore.toString(10), 'precondition failed: blances not equal');

                await contractInstance.placeBet(betOn, { from: accounts[2], value: betAmount });

                const contractBalAfter = new BN(await web3.eth.getBalance(contractInstance.address));
                const playerBalAfter = new BN(await web3.eth.getBalance(accounts[2]));
                const balancePropAfter = await contractInstance.balance();
                assert.equal(contractBalAfter.toString(10), expectedContractBal.toString(10), 'contract bal did not increase');
                assert.equal(balancePropAfter.toString(10), expectedContractBal.toString(10), 'balance prop not updated');
                assert(playerBalAfter.lt(playerBalBefore), 'player balance should decrease');
            });
        });
    });

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
            const amount = web3.utils.toWei(new BN('100'), 'milli');
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


        it('should send the requested amount to the owner', async function () {
            const ownerBalBefore = await web3.eth.getBalance(accounts[0]);
            await contractInstance.withdrawFunds(withdrawAmt);

            const newOwnerBal = new BN(await web3.eth.getBalance(accounts[0]));
            const contractBalance = new BN(await web3.eth.getBalance(contractInstance.address));
            assert(newOwnerBal.gt(ownerBalBefore), 'funds not sent to owner');
            assert.equal(contractBalance.toString(10), expectedBal.toString(10), 'contract balance not updated');
        });

        it('should debit the balance', async function () {
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
