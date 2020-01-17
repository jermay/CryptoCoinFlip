const Ownable = artifacts.require("Ownable");
const CoinFlipSimple = artifacts.require("CoinFlipSimple");
const PlaceCoinFlipBet = artifacts.require("PlaceCoinFlipBet");

module.exports = function (deployer, network, accounts) {
  deployer.deploy(Ownable)
    .then(() => deployer.deploy(CoinFlipSimple))
    .then(() => deployer.deploy(PlaceCoinFlipBet))
    .then(betContract => betContract.addFunds({ value: web3.utils.toWei('1', 'ether')}));
};
