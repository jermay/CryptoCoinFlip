pragma solidity ^0.6.6;
import "./PlaceCoinFlipBet.sol";

contract TestPlaceCoinFlipBet is PlaceCoinFlipBet {
  constructor(address vrfCoordinatorAddress, address linkTokenAddress)
  PlaceCoinFlipBet(vrfCoordinatorAddress, linkTokenAddress)
  public {}

  function setFlipResult(bytes32 queryId, bool r) public {
      uint256 result = r ? 1 : 0;
      fulfillRandomness(queryId, result);
  }

  function setOwnerBalance(uint256 amount) public {
      balances[owner] = amount;
  }
}
