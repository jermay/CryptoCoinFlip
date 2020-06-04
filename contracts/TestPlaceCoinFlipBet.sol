pragma solidity 0.5.12;
import './PlaceCoinFlipBet.sol';

contract TestPlaceCoinFlipBet is PlaceCoinFlipBet {
    bool public testFlipResult = true;

    function flipCoin() public returns (bytes32) {
        bytes32 queryId = getQueryId();
        string memory result = testFlipResult ? "1" : "0";
        __callback(queryId, result);

        return queryId;
    }

    function setFlipResult(bool r) public {
        testFlipResult = r;
    }
}