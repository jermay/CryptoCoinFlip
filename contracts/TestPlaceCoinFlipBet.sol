pragma solidity 0.5.12;
import './PlaceCoinFlipBet.sol';

contract TestPlaceCoinFlipBet is PlaceCoinFlipBet {

    function flipCoin() public returns (bytes32) {
        return bytes32(keccak256(abi.encodePacked(msg.sender)));
    }

    function setFlipResult(bytes32 queryId, bool r) public {
        string memory result = r ? "1" : "0";
        __callback(queryId, result);
    }
}