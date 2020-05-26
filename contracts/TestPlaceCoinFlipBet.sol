pragma solidity 0.5.12;
import './PlaceCoinFlipBet.sol';

contract TestPlaceCoinFlipBet is PlaceCoinFlipBet {
    bool public testFlipResult = true;

    function flipCoin() public view returns (bool) {
        return testFlipResult;
    }

    function setFlipResult(bool r) public {
        testFlipResult = r;
    }
}