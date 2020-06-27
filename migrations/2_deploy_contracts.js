const PlaceCoinFlipBet = artifacts.require("PlaceCoinFlipBet");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(PlaceCoinFlipBet)
    .then(betContract => betContract.addFunds({ value: web3.utils.toWei('1', 'ether')}));
};
