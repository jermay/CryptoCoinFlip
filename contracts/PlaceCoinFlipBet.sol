pragma solidity 0.5.12;
import './Ownable.sol';

contract PlaceCoinFlipBet is Ownable {
    uint public balance;

    function placeBet() public payable returns (bool) {
        return false;
    }

    function addFunds() public payable onlyOwner returns (uint) {
        balance += msg.value;
        return balance;
    }

    function withdrawFunds(uint amount) public onlyOwner returns (uint) {
        require(amount <= balance, 'withdraw amount greater than contract balance');
        balance -= amount;
        msg.sender.transfer(amount);
        return balance;
    }
}
