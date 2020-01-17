pragma solidity 0.5.12;

contract CoinFlipSimple {
    function flipCoin() public view returns (uint) {
        return now % 2;
    }
}
