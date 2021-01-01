const PlaceCoinFlipBet = artifacts.require("PlaceCoinFlipBet");
const MockToken = artifacts.require("MockToken");

module.exports = async function (deployer, network, accounts) {
  let vrfCoordinatorAddress;
  let linkTokenAddress;
  if (network === "development") {
    // create mock LINK token on dev
    await deployer.deploy(MockToken);
    vrfCoordinatorAddress = MockToken.address;
    linkTokenAddress = MockToken.address;
  } else if (network === "kovan") {
    vrfCoordinatorAddress = "0xdD3782915140c8f3b190B5D67eAc6dc5760C46E9";
    linkTokenAddress = "0xa36085F69e2889c224210F603D836748e7dC0088" ;
  }

  await deployer
    .deploy(PlaceCoinFlipBet, vrfCoordinatorAddress, linkTokenAddress)
    .then((betContract) =>
      betContract.addFunds({ value: web3.utils.toWei("1", "ether") })
    );

  if (network === "development") {
    const token = await MockToken.deployed();
    await token.mint(PlaceCoinFlipBet.address, web3.utils.toWei('100', 'ether'));
  }
};
