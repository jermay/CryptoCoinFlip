const Ownable = artifacts.require("Ownable");
const CoinFlipSimple = artifacts.require("CoinFlipSimple");
const PlaceCoinFlipBet = artifacts.require("PlaceCoinFlipBet");

module.exports = function(deployer) {
  deployer.deploy(Ownable);
  deployer.deploy(CoinFlipSimple);
  deployer.deploy(PlaceCoinFlipBet);
};
