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

        it('should have an initial balance of 1 ether in both the owner balance and blockchain', async function () {
            const expectedValue = web3.utils.toWei(new BN('1'), 'ether');
            const ownerBalance = await deployedContract.getMyBalance({from: accounts[0]});
            const contractValue = await web3.eth.getBalance(deployedContract.address);

            assert.equal(contractValue.toString(10), expectedValue.toString(10), 'initial contract balance should be 1 ether');
            assert.equal(ownerBalance.toString(10), expectedValue.toString(), 'inital balance property should be 1 ether');
        });
    });

    describe('bet amount', function () {
        beforeEach(async function() {
            await contractInstance.addFunds({value: web3.utils.toWei('1', 'ether')});
        })
        it('should return the maximum allowed bet as 1% of the owner balance', async function() {
            const ownerBalance = await contractInstance.getMyBalance({from: accounts[0]});
            const expected = ownerBalance.div(new BN('100'));

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
            await contractInstance.addFunds({from: accounts[0], value: web3.utils.toWei(new BN('1'), 'ether') });
            await contractInstance.addFunds({from: accounts[1], value: web3.utils.toWei(new BN('6'), 'milli')})
            betAmount = web3.utils.toWei(new BN('5'), 'milli');
            betOn = true;
        });

        function getQueryIdFromLogs(response) {
            const betEvent = response.logs.find(l => l.event == 'BetPlaced');
            return betEvent.args.id;
        }

        it('should emit a BetPlaced event', async function() {
            const expectedResult = {
                player: accounts[1],
                amount: betAmount,
                betOn: betOn,
            };
            const result = await contractInstance.placeBet(
                expectedResult.betOn, expectedResult.amount, { from: expectedResult.player });

            truffleAssert.eventEmitted(result, 'BetPlaced');
            truffleAssert.eventEmitted(result, 'BetPlaced', e => {
                return !!e.id
                    && e.player === expectedResult.player                    
                    && e.amount.toString(10) === expectedResult.amount.toString(10)
                    && e.betOn === expectedResult.betOn;
            }, 'event params incorrect');
        });

        it('should store the bet and amount in the mapping', async function() {
            const expectedResult = {
                player: accounts[1],
                amount: betAmount,
                betOn: betOn,
            };

            const res = await contractInstance.placeBet(
                expectedResult.betOn, expectedResult.amount, { from: expectedResult.player });
            
            truffleAssert.eventEmitted(res, 'BetPlaced');
            const result = await contractInstance.getBet(getQueryIdFromLogs(res));

            assert.equal(result.player, expectedResult.player, 'player address incorrect');
            assert.equal(result.amount.toString(10), expectedResult.amount.toString(10), 'amount incorrect');
            assert.equal(result.betOn, expectedResult.betOn, 'betOn incorrect');
        });

        it('should REVERT if the player bet is above their balance', async function() {
            const betTooHigh = web3.utils.toWei(new BN('7'), 'milli');
            const maxBet = await contractInstance.maxBet();
            assert(betTooHigh.lt(maxBet), 'precondition failed: bet is above max bet');

            truffleAssert.reverts(
                contractInstance.placeBet(betOn, betTooHigh, { from: accounts[1] }));
        });

        it('should REVERT if the player bet is above the max allowable bet', async function() {
            const betAboveBal = web3.utils.toWei(new BN('20'), 'milli');
            const ownerBal = await contractInstance.getMyBalance({from: accounts[0]});
            const maxBet = await contractInstance.maxBet();
            assert(betAboveBal.gt(maxBet), 'precondition failed: bet is too small');
            assert(betAboveBal.lt(ownerBal), 'precondition failed: bet is more than owner balance');                      

            await truffleAssert.reverts(
                contractInstance.placeBet(betOn, betAboveBal, { from: accounts[1] }));
        });

        it('should REVERT if the player bet is below the min allowable bet', async function() {
            betAmount = web3.utils.toWei(new BN('20'), 'micro');
            const minBet = await contractInstance.minBet();
            assert(betAmount.lt(minBet), 'precondition failed: bet too big');

            await truffleAssert.reverts(
                contractInstance.placeBet(betOn, betAmount, { from: accounts[1] }));
        });

        describe('On winning result', function () {

            async function runWinningBet(amount, fromAccount) {
                const result = await contractInstance.placeBet(betOn, amount, { from: fromAccount });
                const queryId = getQueryIdFromLogs(result);
                return contractInstance.setFlipResult(queryId, betOn);
            }

            it('should emit a winning BetResult event with a 2x positive payout', async function () {
                const expectedResult = {
                    flipResult: betOn,
                    payout: betAmount.mul(new BN('2'))
                };
                const result = await runWinningBet(betAmount, accounts[1]);

                truffleAssert.eventEmitted(result, 'BetResult');
                truffleAssert.eventEmitted(result, 'BetResult', e => {
                    return e.flipResult === expectedResult.flipResult
                        && e.payout.toString(10) === expectedResult.payout.toString(10);
                }, 'event params incorrect');
            });

            it('should add 2x the bet amount to the better and debit the owner balance', async function () {
                const playerBalBefore = await contractInstance.getMyBalance({from: accounts[1]});
                const ownerBalBefore = await contractInstance.getMyBalance({from: accounts[0]});
                const payout = betAmount.mul(new BN('2'));                

                await runWinningBet(betAmount, accounts[1]);

                const playerBalAfter = await contractInstance.getMyBalance({from: accounts[1]});
                const expectedPlayerBalAfter = playerBalBefore.add(payout);
                const ownerBalAfter = await contractInstance.getMyBalance({from: accounts[0]});
                const expectedOwnerBal = ownerBalBefore.sub(payout);
                assert.equal(ownerBalAfter.toString(10), expectedOwnerBal.toString(10), 'owner bal not updated');
                assert.equal(playerBalAfter.toString(10), expectedPlayerBalAfter.toString(10), 'winnings not sent to player');
            });

            it('should REVERT if there is not enough funds to cover the winnings', async function () {
                const betTooBig = web3.utils.toWei(new BN('10'), 'ether');
                const contractBalBefore = new BN(await web3.eth.getBalance(contractInstance.address));
                assert(betTooBig.gt(contractBalBefore), 'precondition failed: bet not big enough');

                truffleAssert.reverts(
                    contractInstance.placeBet(betOn, betTooBig, { from: accounts[1] }));
            });
        });

        describe('On losing result', function () {
            beforeEach(async function () {
                await contractInstance.addFunds({from: accounts[1], value: betAmount.mul(new BN('2'))});
            });

            async function runLosingBet(amount, fromAccount) {
                const result = await contractInstance.placeBet(betOn, amount, { from: fromAccount });
                const queryId = getQueryIdFromLogs(result);
                return contractInstance.setFlipResult(queryId, !betOn);
            }

            it('should emit a losing BetResult event with zero payout', async function () {
                const expectedResult = {
                    flipResult: !betOn,
                    payout: new BN('0')
                };
                const result = await runLosingBet(betAmount, accounts[1]);

                truffleAssert.eventEmitted(result, 'BetResult');
                truffleAssert.eventEmitted(result, 'BetResult', e => {
                    return !!e.id
                        && e.flipResult === expectedResult.flipResult
                        && e.payout.toString(10) === expectedResult.payout.toString(10);
                }, 'event params incorrect');
            });

            it('should subtract the bet from the player and add it to the owner balance', async function () {
                const playerBalBefore = await contractInstance.getMyBalance({from: accounts[1]});
                const ownerBalBefore = await contractInstance.getMyBalance({from: accounts[0]});

                await runLosingBet(betAmount, accounts[1]);

                const expectedPlayerBalAfter = playerBalBefore.sub(betAmount);
                const playerBalAfter = await contractInstance.getMyBalance({from: accounts[1]});
                assert.equal(playerBalAfter.toString(10), expectedPlayerBalAfter.toString(10), 'player balance should decrease');

                const expectedOwnerBal = ownerBalBefore.add(betAmount);
                const ownerBalAfter = await contractInstance.getMyBalance({from: accounts[0]});
                assert.equal(ownerBalAfter.toString(10), expectedOwnerBal.toString(10), 'owner balance not updated');
                
            });
        });
    });

    describe('Add funds', function () {

        it('should increase the contract balance by the provided amount', async function () {
            const contractBalBefore = await web3.eth.getBalance(contractInstance.address);
            assert.equal(contractBalBefore.toString(10), new BN('0'), 'balance property incorrect before');

            const amount = web3.utils.toWei(new BN('100'), 'milli');
            await contractInstance.addFunds({ from:accounts[0], value: amount.toString(10) });

            const contractBalAfter = await web3.eth.getBalance(contractInstance.address);
            assert.equal(contractBalAfter.toString(10), amount.toString(10), 'did NOT increase contract balance');
        });

        it('should increase the player balance went sent by a player', async function() {
            const amount = web3.utils.toWei(new BN('123'), 'milli');
            await contractInstance.addFunds({ from: accounts[1], value: amount });

            const balAfter = await contractInstance.getMyBalance({from: accounts[1]});
            assert.equal(balAfter.toString(10), amount.toString(10), 'did NOT increase balance property');
        });

        it('should increase the owner balance when sent by the owner', async function() {
            const amount = web3.utils.toWei(new BN('200'), 'milli');
            await contractInstance.addFunds({ from: accounts[0], value: amount });

            const balAfter = await contractInstance.getMyBalance({from: accounts[0]});
            assert.equal(balAfter.toString(10), amount.toString(10), 'did NOT increase balance property');
        });

        it('should NOT increase the owner balance when adding player balances', async function() {
            const amount = web3.utils.toWei(new BN('100'), 'milli');
            const contractBalBefore = new BN(await web3.eth.getBalance(contractInstance.address));
            const ownerBalBefore = await contractInstance.getMyBalance({from: accounts[0]});

            await contractInstance.addFunds({ from: accounts[1], value: amount });

            let expectedContractBal = contractBalBefore.add(amount);
            let newContractBal = new BN(await web3.eth.getBalance(contractInstance.address));
            let newOwnerBal = await contractInstance.getMyBalance({from: accounts[0]});
            assert(newOwnerBal.toString(10), ownerBalBefore.toString(10), 'owner bal should be the same');
            assert(newContractBal.toString(10), expectedContractBal.toString(10), 'contract bal not increased');

            await contractInstance.addFunds({ from: accounts[1], value: amount });

            expectedContractBal = contractBalBefore.add(amount.mul(new BN('2')));
            newContractBal = new BN(await web3.eth.getBalance(contractInstance.address));
            newOwnerBal = await contractInstance.getMyBalance({from: accounts[0]});
            assert(newOwnerBal.toString(10), ownerBalBefore.toString(10), 'owner bal should be the same');
            assert(newContractBal.toString(10), expectedContractBal.toString(10), 'contract bal not increased');
        });

        // it('should increase the owner balance when value is sent to the catch all function', async function() {
        //     const balBefore = await contractInstance.getMyBalance({from: accounts[0]});
        //     assert.equal(balBefore.toString(10), '0', 'owner balance incorrect before');

        //     const amount = web3.utils.toWei(new BN('500'), 'milli');
        //     await contractInstance({from: accounts[2], value: amount});

        //     const balAfter = await contractInstance.getMyBalance({from: accounts[0]});
        //     assert.equal(balAfter.toString(10), amount.toString(10), 'owner balance incorrect after');
        // });
        
    });

    describe('Withdraw funds', function () {
       
        let contractInitAmount;        
        let playerInitAmount;
        let withdrawAmt;        
        beforeEach(async function () {
            contractInitAmount = web3.utils.toWei(new BN('100'), 'milli');
            playerInitAmount = web3.utils.toWei(new BN('10'), 'milli');
            withdrawAmt = web3.utils.toWei(new BN('5'), 'milli');

            await contractInstance.addFunds({ from: accounts[0], value: contractInitAmount.toString(10) });
            await contractInstance.addFunds({ from: accounts[1], value: playerInitAmount.toString(10) });
        });


        it('should send the requested amount to the player', async function () {           
            await contractInstance.withdrawFunds(withdrawAmt, {from: accounts[1]});

            const playerBalAfter = new BN(await web3.eth.getBalance(accounts[1]));            
            assert(playerBalAfter.gt(playerInitAmount), 'funds not sent to player');
            
            const expectedContractBal = contractInitAmount.add(playerInitAmount).sub(withdrawAmt);
            const contractBalanceAfter = new BN(await web3.eth.getBalance(contractInstance.address));
            assert.equal(contractBalanceAfter.toString(10), expectedContractBal.toString(10), 'contract balance not deducted');
        });        

        it('should debit the player balance', async function () {
            await contractInstance.withdrawFunds(withdrawAmt, {from: accounts[1]});

            const expectedPlayerBal = playerInitAmount.sub(withdrawAmt);
            const newBalance = await contractInstance.getMyBalance({from: accounts[1]});
            assert.equal(newBalance.toString(10), expectedPlayerBal.toString(10), 'balance not updated');
        });

        it('should REVERT if the requested amount is greater than the player balance', async function () {
            const tooMuch = playerInitAmount.mul(new BN('2'));
            assert(tooMuch.lt(contractInitAmount), 'Precondition failed: withdraw amount also greater than contract balance');

            await truffleAssert.fails(
                contractInstance.withdrawFunds(tooMuch, {from: accounts[1]}),
                truffleAssert.ErrorType.REVERT
            );
        });
    });
});
