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
    vrfCoordinatorAddress = 0xdd3782915140c8f3b190b5d67eac6dc5760c46e9;
    linkTokenAddress = 0xa36085f69e2889c224210f603d836748e7dc0088;
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
