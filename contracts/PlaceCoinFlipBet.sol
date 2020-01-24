pragma solidity 0.5.12;
import './Ownable.sol';

contract PlaceCoinFlipBet is Ownable {
    uint public balance;

    event BetResult(uint id, address player, uint amount, bool betOn,  bool flipResult, uint payout);
    uint private betId = 0;

    function placeBet(bool betOn) public payable returns (bool) {
        bool result = flipCoin();
        uint payoutAmt = payout(msg.sender, betOn, result, msg.value);
        emit BetResult(++betId, msg.sender, msg.value, betOn, result, payoutAmt);
        return true;
    }

    function payout(address payable player, bool betOn, bool flipResult, uint betAmount) private returns(uint) {
        if (betOn != flipResult) {
            return 0;
        }
        uint winnings = betAmount * 2;
        balance -= winnings;
        player.transfer(winnings);
        return winnings;
    }

    // tails = true, heads = false
    function flipCoin() public view returns (bool) {
        return (now % 2) == 0;
    }

    function addFunds() external payable onlyOwner returns (uint) {
        balance += msg.value;
        return balance;
    }

    function withdrawFunds(uint amount) external onlyOwner returns (uint) {
        require(amount <= balance, 'withdraw amount greater than contract balance');
        balance -= amount;
        msg.sender.transfer(amount);
        return balance;
    }

    function destroy() external onlyOwner {
        selfdestruct(owner);
    }
}
